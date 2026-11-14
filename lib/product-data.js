// Wix Catalog V1. Read-only; public product fields only.
// https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/query-products
// https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/filter-and-sort
const PRODUCT_QUERY_URL = 'https://www.wixapis.com/stores-reader/v1/products/query';
const MAX_RESULTS = 10;
const PAGE_SIZE = 50;
const MAX_PAGES = 3;
const {createConfettiCatalog}=require('./confetti-catalog');

function stripHtml(value) {
  return String(value || '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"').replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (match, number) => {
      const code = number[0].toLowerCase() === 'x' ? parseInt(number.slice(1), 16) : Number(number);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
    }).replace(/\s+/g, ' ').trim();
}
function normalize(value) {
  return stripHtml(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
function canonicalQuery(value) {
  return String(value).trim()
    .replace(/\b(?:choko|choco|cioco|ciocco)\s*passion\b/gi, 'CiocoPassion')
    .replace(/\b(?:choco|cioco)\s*soft\b/gi, 'CiocoSoft')
    .replace(/\bmacarons?\b/gi, 'macaron');
}
function buildProductQuery(query, offset = 0) {
  const words = query.split(/\s+/).filter(Boolean).slice(0, 8);
  const matches = [{ name: { $contains: query } }, { sku: { $eq: query } }];
  if (words.length > 1) matches.push({ $and: words.map(word => ({ name: { $contains: word } })) });
  return { query: { filter: JSON.stringify({ $or: matches }), sort: '[{"numericId":"asc"}]', paging: { limit: PAGE_SIZE, offset } }, includeVariants: true };
}
function stockValue(stock, variant = false) {
  if (!stock) return null;
  if (!variant && stock.inventoryStatus) {
    if (stock.inventoryStatus === 'IN_STOCK') return true;
    if (stock.inventoryStatus === 'OUT_OF_STOCK') return false;
    return null; // Partial stock cannot confirm every choice.
  }
  if ((stock.trackQuantity === true || stock.trackInventory === true) && Number.isFinite(stock.quantity)) return stock.quantity > 0;
  return typeof stock.inStock === 'boolean' ? stock.inStock : null;
}
function safeUrl(value, base) {
  try { const u = new URL(value, base); return u.protocol === 'https:' ? u.href : null; } catch { return null; }
}
function mediaToData(media) {
  const items = media?.items || (media?.mainMedia ? [media.mainMedia] : []);
  return items.filter(item => item.mediaType === 'image' || item.image).map(item => ({
    id: item.id || null, url: safeUrl(item.image?.url),
    testo_alternativo: stripHtml(item.image?.altText || item.title),
    larghezza: item.image?.width ?? null, altezza: item.image?.height ?? null,
  })).filter(item => item.url);
}
function priceToData(price) {
  return { valuta: price?.currency || null, prezzo_listino: price?.price ?? null, prezzo_scontato: price?.discountedPrice ?? null };
}
function productToData(product) {
  const sections = (product.additionalInfoSections || []).map(section => ({ titolo: stripHtml(section.title), testo: stripHtml(section.description) }));
  const sectionText = pattern => {
    const matches = sections.filter(section => pattern.test(section.titolo));
    return matches.length ? matches.map(section => section.testo).join('\n') : null;
  };
  const variants = (product.variants || []).filter(item => item.variant?.visible !== false).map(item => ({
    id: item.id, scelte: item.choices || {}, sku: item.variant?.sku || null,
    ...priceToData(item.variant?.priceData || item.variant?.convertedPriceData),
    disponibile: stockValue(item.stock, true), peso: item.variant?.weight ?? null,
    dimensioni_prodotto: item.variant?.productDimensions || null,
  }));
  const options = (product.productOptions || []).map(option => ({
    nome: option.name, tipo: option.optionType,
    scelte: (option.choices || []).filter(choice => choice.visible !== false).map(choice => ({
      valore: choice.value, descrizione: stripHtml(choice.description),
      disponibile: typeof choice.inStock === 'boolean' ? choice.inStock : null,
      immagini: mediaToData(choice.media),
    })),
  }));
  const url = product.productPageUrl;
  const description = stripHtml(product.description);
  const allergenText = sections.filter(s => /ingredient|allergen/i.test(s.titolo)).map(s => s.testo).join(' ');
  const warnings = [];
  if (/senza glutine/i.test(description) && /tracce[^.]{0,180}glutine/i.test(allergenText)) {
    warnings.push({ codice: 'GLUTINE_DA_VERIFICARE', testo: 'Descrizione senza glutine e possibili tracce negli ingredienti/allergeni: non confermare idoneità senza verifica.' });
  }
  if (sections.some(s => /spedi|produzion/i.test(s.titolo) && /10\s*giorni|in giornata|entro le ore 12|dal luned[iì] al mercoled[iì]/i.test(s.testo))) {
    warnings.push({ codice: 'PROCEDURA_DA_CONFRONTARE', testo: 'La scheda contiene una procedura da confrontare con le regole aziendali approvate più recenti.' });
  }
  return {
    id: product.id || null, nome: product.name, sku: product.sku || null,
    url: url?.base && url?.path ? safeUrl(url.path, url.base) : null,
    aggiornato_il: product.lastUpdated || null,
    ...priceToData(product.priceData || product.price),
    intervallo_prezzo: product.priceRange || null,
    disponibile: stockValue(product.stock), stato_magazzino: product.stock?.inventoryStatus || null,
    descrizione: description, ingredienti: sectionText(/ingredient/i),
    allergeni: sectionText(/allergen/i), sezioni: sections,
    peso: product.weight ?? null, dimensioni_prodotto: product.productDimensions || null,
    dimensioni_imballaggio: product.packageDimensions || null,
    opzioni: options, varianti_gestite: product.manageVariants === true, varianti: variants,
    campi_personalizzazione: (product.customTextFields || []).map(field => ({ titolo: field.title, obbligatorio: typeof field.mandatory === 'boolean' ? field.mandatory : null, lunghezza_massima: field.maxLength ?? null })),
    immagini: mediaToData(product.media),
    avvisi: warnings,
    // URLs/alt texts are references, not proof that a model has inspected an image.
    immagini_analizzate: false,
  };
}
function relevance(product, query) {
  const name = normalize(product.name), text = normalize(query);
  if (normalize(product.sku) === text || (product.variants || []).some(v => normalize(v.variant?.sku) === text)) return 1000;
  if (name === text) return 900;
  const words = text.split(' ').filter(Boolean);
  return (name.includes(text) ? 100 : 0) + words.filter(word => name.includes(word)).length * 10;
}
function createProductSearch({ apiKey, siteId, fetchImpl = globalThis.fetch }) {
  const confetti=createConfettiCatalog({apiKey,siteId,fetchImpl,toData:productToData});
  return async function cercaProdotti(value) {
    const input = typeof value === 'string' ? { query: value } : value || {};
    if(input.panoramica_confetti===true)return confetti();
    const raw = typeof input.query === 'string' ? input.query.trim() : '';
    const id = typeof input.product_id === 'string' && /^[0-9a-f-]{36}$/i.test(input.product_id) ? input.product_id : null;
    if (!raw && !id) return { errore: 'Indicare il nome del prodotto da cercare' };
    if (raw.length > 300) return { errore: 'Ricerca troppo lunga: indicare nome o codice del prodotto' };
    if (!apiKey || !siteId) return { errore: 'Collegamento Wix non configurato' };
    const query = canonicalQuery(raw);
    const variants = [...new Set([query, normalize(query)])].filter(Boolean);
    const all = new Map();
    let total = null, partial = false, pages = 0, fallback = false;
    try {
      for (const term of id ? [''] : variants) {
        for (let page = 0; page < MAX_PAGES; page++) {
          const body = buildProductQuery(term, page * PAGE_SIZE);
          if (id) body.query.filter = JSON.stringify({ id: { $eq: id } });
          const response = await fetchImpl(PRODUCT_QUERY_URL, {
            method: 'POST', headers: { Authorization: apiKey, 'wix-site-id': siteId, 'Content-Type': 'application/json' },
            body: JSON.stringify(body), signal: AbortSignal.timeout(8000),
          });
          pages++;
          if (!response.ok) return { errore: 'Ricerca non riuscita (' + response.status + ')', risultati: [], ricerca_parziale: true };
          const data = await response.json();
          if (!Array.isArray(data.products)) return { errore: 'Risposta ricerca prodotti non valida' };
          total = typeof data.totalResults === 'number' ? data.totalResults : null;
          for (const product of data.products) if (product.visible !== false) all.set(product.id || product.name, product);
          const more = data.products.length >= PAGE_SIZE && (total === null || (page + 1) * PAGE_SIZE < total);
          if (!more) break;
          if (page === MAX_PAGES - 1) partial = true;
        }
        if (all.size || id) break;
        fallback = true;
      }
      const products = [...all.values()].sort((a, b) => relevance(b, query) - relevance(a, query));
      const chosen = products.slice(0, MAX_RESULTS);
      const results = chosen.map(productToData);
      // A detail lookup can restrict managed variants without mixing their prices or stock.
      if (input.choices && typeof input.choices === 'object' && !Array.isArray(input.choices)) {
        for (const product of results) {
          product.varianti = product.varianti.filter(v => Object.entries(input.choices).every(([key, value]) => normalize(v.scelte[key]) === normalize(value)));
          product.selezione_richiesta = input.choices;
          product.variante_esatta = product.varianti_gestite && product.varianti.length === 1 && Object.keys(product.varianti[0].scelte).length === Object.keys(input.choices).length;
          // No matching managed variant is not proof that the product itself is out of stock.
        }
      }
      return { risultati: results, totale_risultati: total, ricerca_parziale: partial || products.length > results.length,
        query_utilizzata: query, ricerca_alternativa: fallback, pagine_lette: pages,
        letto_il: new Date().toISOString(), fonte: 'Wix Catalog V1' };
    } catch (error) {
      console.error('cercaProdotti error:', error.name);
      return { errore: 'Errore durante la ricerca prodotti', risultati: [], ricerca_parziale: true };
    }
  };
}
module.exports = { createProductSearch, buildProductQuery, productToData, stripHtml, stockValue, canonicalQuery };
