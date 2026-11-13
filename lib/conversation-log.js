const { randomUUID } = require('node:crypto');
// Separate from the previous Aria journal. No credentials are sent to the client.
const DEFAULT_TABLE = 'Memoria Aria Sol';
const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,100}$/.test(value);
function journalContext({sessionId, requestId, turn}={}) {
 return {sessionId:validId(sessionId)?sessionId:randomUUID(),requestId:validId(requestId)?requestId:randomUUID(),turn:Number.isSafeInteger(turn)&&turn>0&&turn<=100000?turn:1};
}
async function logConversation(message, reply, {fetchImpl=globalThis.fetch,env=process.env,now=new Date(),sessionId,requestId,turn=1,outcome='completato',sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms))}={}) {
 const enabled=env.ARIA_SOL_LOG_CONVERSATIONS!=='false' && (env.VERCEL_ENV==='production'||env.ARIA_SOL_LOG_CONVERSATIONS==='true');
 if(!enabled||!env.AIRTABLE_TOKEN||!env.AIRTABLE_BASE_ID)return false;
 const table=env.ARIA_SOL_AIRTABLE_TABLE_ID||DEFAULT_TABLE;
 if(table!==DEFAULT_TABLE&&!/^tbl[a-zA-Z0-9]{14}$/.test(table)) {console.error('Aria Sol journal configuration invalid');return false;}
 const ids=journalContext({sessionId,requestId,turn});
 const fields={'ID Scambio':ids.requestId,Data:now.toISOString(),'Messaggio Cliente':message,Sessione:ids.sessionId,Turno:ids.turn,Modello:'gpt-6.1-sol',Ambiente:env.VERCEL_ENV==='production'?'produzione':'test',Esito:outcome};
 if(typeof reply==='string')fields['Risposta Aria']=reply;
 const body=JSON.stringify({performUpsert:{fieldsToMergeOn:['ID Scambio']},records:[{fields}]});
 for(let attempt=0;attempt<3;attempt++) {
  try {
   const response=await fetchImpl(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(table)}`,{method:'PATCH',headers:{Authorization:`Bearer ${env.AIRTABLE_TOKEN}`,'Content-Type':'application/json'},body,signal:AbortSignal.timeout(3000)});
   if(response.ok) {const result=await response.json();return !!result.records?.[0]?.id;}
   // Do not hammer a rate-limited base or retry permanent permission/schema errors.
   if(response.status===429||response.status<500){console.error('Aria Sol journal rejected:',response.status);return false;}
  }catch{/* Retry transient failures with the same exchange ID. No transcript in logs. */}
  if(attempt<2)await sleep(attempt===0?250:750);
 }
 console.error('Aria Sol journal unavailable after retries');return false;
}
module.exports={logConversation,journalContext,DEFAULT_TABLE};
