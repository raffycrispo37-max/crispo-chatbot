// Campaign selection is computed by the server, independently of model interpretation.
function promotionContext(config, instant = new Date()) {
 const now = new Date(instant).getTime();
 if (!Number.isFinite(now)) throw new Error('INVALID_PROMOTION_DATE');
 const campaigns = (config.campaigns || []).filter(c => c.enabled === true)
  .map(c => ({ ...c, start: Date.parse(c.starts_at), end: Date.parse(c.ends_before) }))
  .map(c => { if (!Number.isFinite(c.start) || !Number.isFinite(c.end) || c.start >= c.end) throw new Error('INVALID_PROMOTION_CONFIG'); return c; })
  .sort((a,b) => a.start - b.start);
 const clean = c => ({ id:c.id, name:c.name, starts_at:c.starts_at, ends_before:c.ends_before,
  dates_inclusive:c.dates_inclusive, automatic:c.automatic, replaces_standard_promotions:c.replaces_standard_promotions,
  rules:c.rules, other_coupon_combination:c.other_coupon_combination });
 const active = campaigns.filter(c => c.start <= now && now < c.end);
 if (active.length > 1) return { version:config.version, time_zone:config.time_zone, phase:'CONFLICT', current:null, guidance:'Più campagne sovrapposte: verificare le condizioni senza inventare uno sconto.' };
 if (active.length === 1) return { version:config.version, time_zone:config.time_zone, phase:'ACTIVE', current:clean(active[0]),
  guidance:'La campagna corrente sostituisce le percentuali ordinarie. La regola di marchio specifica prevale sulla fascia generale. Non sommare le percentuali; non ricalcolare un prezzo già scontato. Leggere il prezzo attuale della scheda Wix e non garantire applicazione o importo finale del carrello.' };
 const past = campaigns.filter(c => c.end <= now);
 const next = campaigns.find(c => c.start > now);
 const post = config.post_campaign;
 if (past.length && post && post.after_campaign_id === past.at(-1).id) {
  const begins = Date.parse(post.starts_at);
  if (!Number.isFinite(begins) || begins < past.at(-1).end) throw new Error('INVALID_PROMOTION_CONFIG');
  if (now >= begins) return { version:config.version, time_zone:config.time_zone, phase:'POST_CAMPAIGN', current:post,
   ended_campaign:past.at(-1).id, ...(next ? {upcoming:clean(next)} : {}),
   guidance:'La campagna è conclusa e queste sono le condizioni successive confermate. La regola di marchio prevale sulle fasce generali: discount_percent=0 significa nessuno sconto, non un valore mancante. Non proseguire lo sconto della campagna terminata. Leggere il prezzo corrente su Wix; non calcolare o garantire un diverso totale. Se prezzo o sconto in scheda contrastano con le condizioni, richiedere verifica.' };
 }
 if (past.length) return { version:config.version, time_zone:config.time_zone, phase:'EXPIRED', current:null,
  ...(next ? { upcoming:clean(next) } : {}), guidance:'La campagna passata è terminata. Le promozioni successive non sono confermate: non continuare gli sconti scaduti e non ripristinare automaticamente le percentuali ordinarie. Leggere il prezzo corrente del prodotto; per una promo generale richiedere verifica.' };
 return { version:config.version, time_zone:config.time_zone, phase:next?'UPCOMING':'STANDARD', current:config.standard,
  ...(next ? { upcoming:clean(next) } : {}), guidance:'Sono correnti soltanto le promozioni ordinarie confermate. Una campagna futura può essere descritta come futura se pertinente alla domanda, senza presentarla come già attiva. Verificare i prezzi su Wix; nessun doppio sconto o totale carrello garantito.' };
}
function promotionInstructions(context) {
 return 'PROMOZIONI — STATO CALCOLATO DAL SERVER\nQuesto blocco determina quali promozioni sono correnti e quali future o scadute. Prevale sui riferimenti promozionali storici nelle regole o nella conversazione. Le informazioni sono condizioni aziendali, non la conferma che Wix le abbia applicate a un carrello.\n' + JSON.stringify(context);
}
module.exports = { promotionContext, promotionInstructions };
