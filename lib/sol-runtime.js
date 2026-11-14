const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createProductSearch } = require('./product-data');
const { PRODUCT_TOOL } = require('./catalog-tool');
const policies = require('./aria-policies.json');
const promotions = require('./aria-promotions.json');
const { promotionContext, promotionInstructions } = require('./promotion-context');
const core = fs.readFileSync(path.join(__dirname, 'aria-sol-prompt.txt'), 'utf8');
const MODEL = 'gpt-6.1-sol';
const instructions = core + '\n\nREGOLE AZIENDALI APPROVATE — VERSIONE ' + policies.version + '\n' + policies.regole.map(rule => `## ${rule.id} — ${rule.titolo}\n${rule.testo}`).join('\n\n');
const PROMPT_SHA256 = createHash('sha256').update(instructions).digest('hex');
const tool = { type: 'function', name: PRODUCT_TOOL.name, description: PRODUCT_TOOL.description, parameters: PRODUCT_TOOL.input_schema, strict: false };
function cleanHistory(history) {
 if (!Array.isArray(history)) return [];
 return history.filter(x => x && ['user','assistant'].includes(x.role) && typeof x.content === 'string')
  .slice(-20).map(x => ({ role: x.role, content: x.content.slice(0,6000) }));
}
function safeReply(text) {
 return text.replace(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F0FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{FE0F}\u{20E3}]/gu,'').trim();
}
function createSolChat({ apiKey, wixApiKey, wixSiteId, fetchImpl = globalThis.fetch, search, now = () => new Date() }) {
 const catalog = search || createProductSearch({ apiKey: wixApiKey, siteId: wixSiteId, fetchImpl });
 return async function chat({ message, history = [], productId = null }) {
  if (typeof message !== 'string' || !message.trim() || message.length > 6000) throw new Error('INVALID_MESSAGE');
  if (!apiKey) throw new Error('OPENAI_NOT_CONFIGURED');
  const instant = now();
  const currentPromotions = promotionContext(promotions, instant);
  const requestInstructions = instructions + '\n\n' + promotionInstructions(currentPromotions);
  const requestPromptHash = createHash('sha256').update(requestInstructions).digest('hex');
  const input = cleanHistory(history);
  input.push({ role: 'developer', content: 'Data e ora attuali Europe/Rome: ' + instant.toLocaleString('it-IT',{timeZone:'Europe/Rome'}) + '. Nessuna verifica dello stato ordini e nessun calcolo di consegna garantita disponibili.' });
  if (typeof productId === 'string' && /^[0-9a-f-]{36}$/i.test(productId)) input.push({ role: 'developer', content: 'Contesto pagina dichiarato dal client, da verificare tramite cerca_prodotto: product_id=' + productId });
  input.push({ role: 'user', content: message.trim() });
  const trace = [], usage = [], responses = [];
  const deadline = Date.now() + 95000;
  let calls = 0;
  for (let round = 0; round < 5; round++) {
   if (Date.now() >= deadline) throw new Error('RESPONSE_TIMEOUT');
   const budget = round === 4 || calls >= 6;
   const request = { model: MODEL, instructions:requestInstructions, input, tools: [tool], tool_choice: budget ? 'none' : 'auto',
    parallel_tool_calls: false, max_output_tokens: 1600, reasoning: { effort: 'medium' }, store: false,
    include: ['reasoning.encrypted_content'] };
   const response = await fetchImpl('https://api.openai.com/v1/responses', {
    method: 'POST', headers: { Authorization: 'Bearer '+apiKey, 'Content-Type':'application/json' },
    body: JSON.stringify(request), signal: AbortSignal.timeout(Math.min(45000,deadline-Date.now())),
   });
   const value = await response.json();
   if (!response.ok) { const err=new Error('OPENAI_HTTP_'+response.status); err.code=value.error?.code; throw err; }
   if (value.status !== 'completed') throw new Error('OPENAI_RESPONSE_INCOMPLETE');
   usage.push(value.usage); responses.push(value.id);
   // Preserve the provider's reasoning and call items, including encrypted state with store:false.
   input.push(...(value.output || []));
   const functions = (value.output || []).filter(item => item.type === 'function_call');
   if (!functions.length) {
    const reply=safeReply((value.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n'));
    if (!reply) throw new Error('OPENAI_EMPTY_RESPONSE');
    return { response:reply, suggestions:[], model:MODEL, prompt_sha256:requestPromptHash, base_prompt_sha256:PROMPT_SHA256, policy_version:policies.version, promotion_version:promotions.version, promotion_phase:currentPromotions.phase, trace, usage, response_ids:responses };
   }
   for (const item of functions) {
    let result, args;
    try {
     args=JSON.parse(item.arguments);
     if (item.name!=='cerca_prodotto') result={errore:'Funzione non disponibile. Nessuna operazione eseguita.'};
     else if (++calls>6) result={errore:'Limite di ricerche raggiunto. Non confermare dati mancanti.'};
     else if (!args || Array.isArray(args) || typeof args!=='object' || (typeof args.query!=='string' && typeof args.product_id!=='string')) result={errore:'Indicare un nome o un ID prodotto valido.'};
     else result=await catalog({query:args.query,product_id:args.product_id,choices:args.choices,panoramica_confetti:args.panoramica_confetti===true});
    } catch { result={errore:'Richiesta prodotto non valida. Non inventare dati.'}; }
    trace.push({name:item.name,arguments:args||null,results:(result.risultati||[]).map(p=>({id:p.id,nome:p.nome,prezzo:p.prezzo_scontato??p.prezzo_listino,disponibile:p.disponibile,avvisi:p.avvisi})),...(Array.isArray(result.catalogo_confetti)?{confetti_count:result.catalogo_confetti.length}:{}),error:result.errore||null,partial:result.ricerca_parziale??null,read_at:result.letto_il||null});
    input.push({type:'function_call_output',call_id:item.call_id,output:JSON.stringify(result)});
   }
  }
  throw new Error('TOOL_LIMIT');
 };
}
module.exports={createSolChat,MODEL,PROMPT_SHA256,cleanHistory,policyVersion:policies.version};
