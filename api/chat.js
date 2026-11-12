const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 25000 });

const { createProductSearch } = require("../lib/product-data");
const { SYSTEM_PROMPT, PRODUCT_CONTEXT } = require("../lib/knowledge");
const cercaProdotti = createProductSearch({
  apiKey: process.env.WIX_API_KEY,
  siteId: process.env.WIX_SITE_ID,
});

// Rete di sicurezza: rimuove dalla risposta eventuali frasi che svelano il meccanismo interno
function sanitizeReply(t) {
  if (!t) return "";
  let out = t
    .replace(/[^\n.?!]*(?:la ricerca|lo strumento)[^\n.?!]*non ha[^\n.?!]*[.?!]\s*/gi, "")
    .replace(/[^\n.?!]*non ha restituito[^\n.?!]*[.?!]\s*/gi, "")
    .replace(/[^\n.?!]*\bho (?:i dati|il dato|le informazioni|i dettagli)\b[^\n.?!]*\bcatalogo\b[^\n.?!]*[.?!]\s*/gi, "")
    .replace(/[^\n.?!]*\b(?:dal catalogo|secondo il catalogo|in base al catalogo|da catalogo)\b[^\n.?!]*[.?!]\s*/gi, "")
    .replace(/\bposso rispondere con quell[eo]\b\s*[:,.]?\s*/gi, "")
    .replace(/\b(?:ti confermo comunque il dato|ti rispondo con le informazioni che ho|confermo comunque la disponibilità|confermo comunque)\b\s*[:,.]?\s*/gi, "")
    .replace(/^\s*ecco(?:\s+(?:la risposta|le informazioni|i dettagli|qui))?\s*[:.]\s*/i, "")
    .replace(/[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F0FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{2139}\u{2122}\u{20E3}\u{FE0F}]/gu, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  out = out.replace(/^[\s:,;.–-]+/, "").trim();
  if (out) out = out.charAt(0).toUpperCase() + out.slice(1);
  return out;
}

const PRODUCT_TOOL = {
  name: "cerca_prodotto",
  description:
    "Cerca i dati REALI e aggiornati di uno o più prodotti sul sito Crispo Home (nome esatto, prezzo di listino, prezzo scontato, disponibilità, descrizione, ingredienti e allergeni). " +
    "USA SEMPRE questo strumento quando il cliente chiede di un prodotto specifico e ti serve un dato di catalogo: prezzo, disponibilità, ingredienti, allergeni, formato o cosa contiene/com'è confezionato. " +
    "Non affidarti alla memoria per questi dati: cercali. Passa come query il nome del prodotto o le parole chiave del cliente (es. 'kit cremini', 'ciocosoft pistacchio', 'maxtris truffle nocciole').",
  input_schema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Nome del prodotto o parole chiave da cercare." },
    },
    required: ["query"],
  },
};


// --- Calcolo giorni lavorativi fino a una data indicata dal cliente (deterministico, non lasciato al modello) ---
function easterMondayUTC(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
  return Date.UTC(y, month - 1, day) + 86400000; // lunedì dopo Pasqua
}
function isHolidayUTC(ms) {
  const dt = new Date(ms), dd = dt.getUTCDate(), mm = dt.getUTCMonth() + 1, y = dt.getUTCFullYear();
  const fissi = [[1, 1], [6, 1], [25, 4], [1, 5], [2, 6], [15, 8], [1, 11], [8, 12], [25, 12], [26, 12]];
  for (const [d2, m2] of fissi) if (dd === d2 && mm === m2) return true;
  return ms === easterMondayUTC(y);
}
function giorniLavorativiTra(fromMs, toMsInclusive) {
  let count = 0, cur = fromMs + 86400000; // da domani
  while (cur <= toMsInclusive) {
    const dow = new Date(cur).getUTCDay();
    if (dow !== 0 && dow !== 6 && !isHolidayUTC(cur)) count++;
    cur += 86400000;
  }
  return count;
}
function estraiDataTarget(msg, Y, Mo, D) {
  if (!msg) return null;
  const s = msg.toLowerCase();
  // Richiede un contesto di tempo/consegna, per evitare falsi positivi (es. misure, quantità)
  if (!/(entro|per il|per la|per\s+le|ricever|consegn|arriv|in tempo|quando|scadenz|mi serv|mi occorr|data|spedi|fate in tempo|ce la fate)/.test(s)) return null;
  const mesi = { gennaio: 1, gen: 1, febbraio: 2, feb: 2, marzo: 3, mar: 3, aprile: 4, apr: 4, maggio: 5, mag: 5, giugno: 6, giu: 6, luglio: 7, lug: 7, agosto: 8, ago: 8, settembre: 9, sett: 9, set: 9, ottobre: 10, ott: 10, novembre: 11, nov: 11, dicembre: 12, dic: 12 };
  const todayMs = Date.UTC(Y, Mo - 1, D);
  function build(day, mon, year) {
    if (!(mon >= 1 && mon <= 12) || !(day >= 1 && day <= 31)) return null;
    let yr = year;
    if (!yr) { yr = Y; if (Date.UTC(yr, mon - 1, day) < todayMs) yr = Y + 1; }
    else if (yr < 100) yr += 2000;
    const ms = Date.UTC(yr, mon - 1, day);
    const chk = new Date(ms);
    if (chk.getUTCMonth() + 1 !== mon || chk.getUTCDate() !== day) return null;
    return ms;
  }
  let m = s.match(/\b(\d{1,2})\s*(?:°|º)?\s*(?:di\s+)?(gennaio|gen|febbraio|feb|marzo|mar|aprile|apr|maggio|mag|giugno|giu|luglio|lug|agosto|ago|settembre|sett|set|ottobre|ott|novembre|nov|dicembre|dic)\b(?:\s+(?:del\s+)?(\d{4}))?/);
  if (m) { const ms = build(parseInt(m[1], 10), mesi[m[2]], m[3] ? parseInt(m[3], 10) : null); if (ms) return ms; }
  let n = s.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
  if (n) { const ms = build(parseInt(n[1], 10), parseInt(n[2], 10), n[3] ? parseInt(n[3], 10) : null); if (ms) return ms; }
  return null;
}

// --- Rilevamento segnali di reclamo/problema o urgenza, per dare priorità a empatia + assistenza ---
function rilevaSegnale(msg) {
  if (!msg) return null;
  const s = " " + msg.toLowerCase() + " ";
  if (/nessun problema|senza problemi/.test(s)) return /(urgent|urgenz|al più presto|al piu presto|entro oggi|entro domani|per domani|ultimo minuto|last minute)/.test(s) ? "urgente" : null;
  const reclamo = /(reclam|lamentel|deluso|delusa|insoddisfatt|arrabbiat|pessim|vergogn|truffa|rimbors|danneggiat|rovinat|\brotto\b|\brotti\b|\brotte\b|sciolt|difett|\berror|sbagliat|mancant|mai arrivat|non .{0,8}arrivat|in ritardo|\britardo\b|disservizio|inaccettabil|assurd|scandal|corpo estraneo|capello|muffa|voglio indietro|restituire|ho un problema|problema con|un problema con)/;
  const urgenza = /(urgent|urgenz|\bsubito\b|al più presto|al piu presto|entro oggi|entro domani|per domani|di fretta|ultimo minuto|last minute|velocissim|mi serve urgent|ho fretta)/;
  if (reclamo.test(s)) return "reclamo";
  if (urgenza.test(s)) return "urgente";
  return null;
}



function buildSessionContext(history) {
  if (!history || history.length < 2) return null;

  const allText = history.map(m => m.content).join(' ').toLowerCase();
  const facts = [];

  // Tipo di evento
  const eventi = [
    [/matrimoni|matrimonio|sposarsi|sposi|nozze/, 'matrimonio'],
    [/battesim|nascita|bimbo|bimba|bebè|neonato|bebè/, 'battesimo/nascita'],
    [/comunion|cresima/, 'comunione/cresima'],
    [/laurea|laureand|laureat/, 'laurea'],
    [/compleanno|anni\b|birthday/, 'compleanno'],
    [/party adulto|festa adulto|adulto/, 'party adulto'],
  ];
  for (const [pattern, label] of eventi) {
    if (pattern.test(allText)) { facts.push(`Evento: ${label}`); break; }
  }

  // Genere per battesimo/nascita
  if (/bimba|femminuccia|bambina|femmina/.test(allText)) facts.push('Genere: femmina');
  else if (/bimbo|maschietto|bambino\b|maschio/.test(allText)) facts.push('Genere: maschio');

  // Numero invitati
  const guestMatch = allText.match(/(\d+)\s*(invitat|person|ospiti|guests?)/);
  if (guestMatch) facts.push(`Invitati: circa ${guestMatch[1]}`);

  // Colori menzionati
  const colori = ['bianco','celeste','rosa','rosso','bordeaux','tortora','nude','verde','oro','argento','nero','lilla','malva','pesca'];
  const coloriTrovati = colori.filter(c => allText.includes(c));
  if (coloriTrovati.length > 0) facts.push(`Colori menzionati: ${coloriTrovati.join(', ')}`);

  // Budget o prodotti già visti
  if (/scatolin|bomboniere|scatola/.test(allText)) facts.push('Interesse: bomboniere/scatoline');
  if (/confetti/.test(allText)) facts.push('Interesse: confetti');
  if (/macarons|donuts/.test(allText)) facts.push('Interesse: macarons/donuts');

  if (facts.length === 0) return null;
  return facts.join(' | ');
}

async function logToAirtable(message, reply) {
  try {
    const now = new Date();
    const dateStr = now.toLocaleString("it-IT", { timeZone: "Europe/Rome" });
    const sessionDate = now.toISOString().split("T")[0];
    await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Sessioni%20Aria`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Data: dateStr,
          "Messaggio Cliente": message,
          "Risposta Aria": reply,
          Sessione: sessionDate,
        },
      }),
    });
  } catch (e) {
    console.error("Airtable log error:", e);
  }
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")
    return res.status(405).json({ error: "Metodo non consentito" });

  try {
    const { message, history = [] } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Messaggio richiesto" });
    }

    const messages = [
      ...history.slice(-20),
      { role: "user", content: message.trim() },
    ];

    const sessionCtx = buildSessionContext(history);

    // Data e ora odierne in italiano (fuso orario Europa/Roma)
    const oggi = new Date().toLocaleDateString("it-IT", {
      timeZone: "Europe/Rome",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    const oraAttuale = new Date().toLocaleTimeString("it-IT", {
      timeZone: "Europe/Rome",
      hour: "2-digit",
      minute: "2-digit"
    });

    // Calcolo del PRIMO giorno utile di spedizione (fatto qui, non lasciato al modello)
    // Regole: si spedisce dal lunedì al venerdì tutto l'anno; non si spedisce sabato e domenica.
    const romeParts = Object.fromEntries(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Rome",
        year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false
      }).formatToParts(new Date()).map(p => [p.type, p.value])
    );
    const romeY = parseInt(romeParts.year, 10);
    const romeMo = parseInt(romeParts.month, 10);
    const romeD = parseInt(romeParts.day, 10);
    const romeH = parseInt(romeParts.hour, 10);
    const baseMs = Date.UTC(romeY, romeMo - 1, romeD);
    const isShippingDay = (ms) => {
      const dow = new Date(ms).getUTCDay();          // 0=dom ... 6=sab
      if (dow === 0 || dow === 6) return false;      // sab/dom mai; lun-ven sempre (tutto l'anno)
      return true;
    };
    // Nessuna "spedizione in giornata": si indica sempre il PRIMO giorno utile di spedizione a partire da domani.
    let shipMs = baseMs + 86400000;
    while (!isShippingDay(shipMs)) shipMs += 86400000;
    const partenzaTxt = new Intl.DateTimeFormat("it-IT", {
      timeZone: "UTC", weekday: "long", day: "numeric", month: "long"
    }).format(new Date(shipMs));

    // Se il cliente ha indicato una data precisa, calcoliamo NOI i giorni lavorativi (il modello non deve contarli)
    let dataTargetBlock = "";
    const targetMs = estraiDataTarget(message, romeY, romeMo, romeD);
    if (targetMs && targetMs >= baseMs) {
      const gg = giorniLavorativiTra(baseMs, targetMs);
      const dataTxt = new Intl.DateTimeFormat("it-IT", { timeZone: "UTC", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(targetMs));
      dataTargetBlock = `## GIORNI LAVORATIVI FINO ALLA DATA RICHIESTA (GIÀ CALCOLATO — non ricalcolare, non mostrare il conteggio)\nIl cliente ha indicato come data di riferimento ${dataTxt}. Da oggi a quella data ci sono circa ${gg} giorni lavorativi (già esclusi sabato, domenica e le festività nazionali italiane). USA SOLO questo numero per valutare la fattibilità, NON contare i giorni per conto tuo e NON mostrare il calcolo.\nPromemoria tempi: prodotti personalizzati (scatoline, bomboniere, kit, ecc.) circa 10 giorni lavorativi di produzione + 1-2 di spedizione; soli confetti/macarons/donuts/marshmallow circa 2-3 giorni lavorativi totali.\nRispondi in 2-3 frasi con la sola conclusione: se i tempi sono comodi, stretti o non sufficienti, e il consiglio (ordinare subito, indicare la data al checkout, o scrivere all'assistenza WhatsApp 328 448 2654 per casi urgenti). Se non è chiaro che tipo di prodotto vuole, valuta per i personalizzati (caso più lungo) e ricorda che per i soli confetti i tempi sono molto più rapidi. NON fare domande.`;
    }

    // Prompt caching: SYSTEM_PROMPT statico in cache, contesto dinamico (data + sessione) separato
    const dynamicParts = [`## DATA E ORA ODIERNE\nOggi è ${oggi} e sono le ${oraAttuale} (orario italiano). Usa la data per calcolare i giorni lavorativi quando un cliente chiede se riuscirà a ricevere l'ordine entro una certa data.\n\n## GIORNO DI SPEDIZIONE GIÀ CALCOLATO (NON ricalcolarlo)\nPer un ordine di soli confetti, macarons, donuts o marshmallow (senza prodotti personalizzati) effettuato ORA, il primo giorno utile di spedizione è: ${partenzaTxt}. I prodotti vengono spediti entro 24 ore lavorative.\nUSA ESATTAMENTE questo dato quando il cliente chiede "se ordino oggi/adesso quando spedite/quando arriva": è già calcolato tenendo conto dei giorni in cui non si spedisce (sabato e domenica; si spedisce dal lunedì al venerdì tutto l'anno). NON esiste la spedizione in giornata e NON c'è alcuna regola delle 12:00: non promettere mai la spedizione "oggi stesso" né citare orari limite. NON fare calcoli sui giorni della settimana per conto tuo e non saltare giorni: limitati a comunicare questo giorno di partenza. Alla partenza aggiungi i tempi di consegna (24/48 ore lavorative; 48/72 per Basilicata, Puglia, Sardegna, Sicilia e zone disagiate). I prodotti personalizzati (scatoline, bomboniere) seguono invece i tempi di produzione di circa 10 giorni lavorativi + spedizione.


${PRODUCT_CONTEXT}`];
    if (dataTargetBlock) {
      dynamicParts.push(dataTargetBlock);
    }
    const segnale = rilevaSegnale(message);
    if (segnale === "reclamo") {
      dynamicParts.push(`## SEGNALE: POSSIBILE RECLAMO O PROBLEMA\nIl messaggio del cliente sembra segnalare un problema, un disservizio o un disappunto. PRIORITÀ assoluta in questa risposta:\n- Apri con empatia sincera e un dispiacere autentico (es. "Mi dispiace davvero per l'accaduto"), senza minimizzare e senza essere fredda o burocratica.\n- Metti SUBITO in primo piano il contatto diretto con il team: WhatsApp 328 448 2654 (solo messaggi) ed email info@crispohome.it.\n- Invita (con una frase, non una domanda) a inviare le informazioni utili per risolvere in fretta: foto del problema, nome e cognome e numero d'ordine.\n- Se è un prodotto danneggiato/errato, ricorda con garbo che le richieste di cambio o rimborso vanno fatte entro 7 giorni dalla consegna.\n- Non promettere rimborsi o soluzioni che non puoi garantire: rassicura che il team sistemerà la cosa il prima possibile. Resta breve (2-4 frasi), calda e concreta.`);
    } else if (segnale === "urgente") {
      dynamicParts.push(`## SEGNALE: RICHIESTA URGENTE\nIl cliente ha un'urgenza. In questa risposta: rassicura con tono rapido e disponibile, dai l'informazione utile sui tempi (usa i tempi già calcolati se presenti) e metti in evidenza che, per gestire al meglio l'urgenza e verificare la fattibilità o dare priorità all'ordine, può scrivere al team su WhatsApp al 328 448 2654 (solo messaggi). Breve e rassicurante, senza fare domande.`);
    }
    if (sessionCtx) {
      dynamicParts.push(`## CONTESTO SESSIONE ATTUALE\nIl cliente ha già fornito queste informazioni durante questa conversazione — usale nelle risposte senza chiedere di nuovo:\n${sessionCtx}`);
    }

    const systemBlocks = [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" }
      },
      {
        type: "text",
        text: dynamicParts.join("\n\n")
      }
    ];

    // Ciclo con tool-use: Aria può chiamare "cerca_prodotto" per leggere i dati reali dal sito
    const convo = messages.slice();
    let response;
    let guard = 0;
    while (true) {
      response = await client.messages.create({
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system: systemBlocks,
        tools: [PRODUCT_TOOL],
        messages: convo,
      });

      if (response.stop_reason !== "tool_use" || guard >= 3) break;
      guard++;

      // esegui le ricerche richieste
      const toolResults = [];
      for (const block of response.content) {
        if (block.type === "tool_use" && block.name === "cerca_prodotto") {
          const q = (block.input && block.input.query) ? String(block.input.query) : "";
          const data = await cercaProdotti(q);
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(data),
          });
        }
      }
      convo.push({ role: "assistant", content: response.content });
      convo.push({ role: "user", content: toolResults });
    }

    // estrai il testo finale (ignora eventuali blocchi tool_use)
    let reply = sanitizeReply(((response.content.find(b => b.type === "text") || { text: "" }).text || ""));
    if (!reply) reply = "Mi dispiace, non riesco a rispondere in questo momento. Scrivici su WhatsApp al 328 448 2654.";

    // Genera 3 domande di follow-up pertinenti, collegate a ciò che il cliente ha appena chiesto (modello veloce)
    let suggestions = [];
    try {
      const sugg = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system:
          "Sei un generatore di domande di follow-up per l'assistente clienti di Crispo Home (confetti, macarons, donuts, scatoline e bomboniere personalizzate). " +
          "Dato l'ultimo messaggio del cliente e la risposta dell'assistente, proponi 3 possibili domande MOLTO BREVI (max ~6 parole) che il cliente potrebbe voler fare SUBITO DOPO, pertinenti e collegate all'argomento appena trattato. " +
          "Devono essere domande a cui l'assistente sa rispondere (prodotti, ordini, spedizioni, personalizzazione, pagamenti, allergeni, conservazione, tempi). " +
          "Scrivile dal punto di vista del cliente, in italiano. Rispondi SOLO con un array JSON di 3 stringhe, senza altro testo.",
        messages: [
          { role: "user", content: `Messaggio cliente: "${message.trim()}"\n\nRisposta assistente: "${reply}"\n\nProponi 3 domande di follow-up brevi e collegate.` }
        ]
      });
      const txt = (sugg.content[0] && sugg.content[0].text ? sugg.content[0].text : "").trim();
      const match = txt.match(/\[[\s\S]*\]/);
      if (match) {
        const arr = JSON.parse(match[0]);
        if (Array.isArray(arr)) suggestions = arr.filter((s) => typeof s === "string" && s.trim()).slice(0, 3);
      }
    } catch (e) {
      console.error("Suggestion error:", e);
    }

    await logToAirtable(message.trim(), reply);
    return res.status(200).json({ response: reply, suggestions });
  } catch (error) {
    console.error("Aria API error:", error);
    return res.status(500).json({
      error: "Si è verificato un errore. Per assistenza contattaci al 081 827 1670 o su WhatsApp al 328 448 2654.",
    });
  }
};

