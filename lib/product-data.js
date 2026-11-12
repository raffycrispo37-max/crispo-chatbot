// Catalog V1 contract and supported filters:
// https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/query-products
// https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/filter-and-sort
const PRODUCT_QUERY_URL = "https://www.wixapis.com/stores-reader/v1/products/query";
const MAX_RESULTS = 10;

function stripHtml(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function buildProductQuery(query) {
  const words = query.split(/\s+/).filter(Boolean).slice(0, 8);
  const matches = [
    { name: { $contains: query } },
    { sku: { $eq: query } },
  ];
  if (words.length > 1) {
    matches.push({ $and: words.map(word => ({ name: { $contains: word } })) });
  }
  return {
    query: { filter: JSON.stringify({ $or: matches }), paging: { limit: 50 } },
    includeVariants: false,
  };
}

function productToData(product) {
  const sections = (product.additionalInfoSections || []).map(section => ({
    titolo: String(section.title || "").trim(),
    testo: stripHtml(section.description),
  }));
  const sectionText = pattern => {
    const matches = sections.filter(section => pattern.test(section.titolo));
    return matches.length ? matches.map(section => section.testo).join("\n") : null;
  };
  const price = product.priceData || product.price || {};
  return {
    nome: product.name,
    sku: product.sku || null,
    prezzo_listino: price.price ?? null,
    prezzo_scontato: price.discountedPrice ?? null,
    disponibile: typeof product.stock?.inStock === "boolean" ? product.stock.inStock : null,
    // Preserve the complete text, including details after the old 400/500 character limits.
    descrizione: stripHtml(product.description),
    ingredienti: sectionText(/ingredient/i),
    allergeni: sectionText(/allergen/i),
    sezioni: sections,
  };
}

function relevance(product, query) {
  const name = String(product.name || "").toLocaleLowerCase("it-IT");
  const text = query.toLocaleLowerCase("it-IT");
  if (String(product.sku || "").toLowerCase() === text) return 1000;
  if (name === text) return 900;
  return (name.includes(text) ? 100 : 0) + text.split(/\s+/).filter(word => name.includes(word)).length;
}

function createProductSearch({ apiKey, siteId, fetchImpl = globalThis.fetch }) {
  return async function cercaProdotti(value) {
    const query = typeof value === "string" ? value.trim() : "";
    if (!query) return { errore: "Indicare il nome del prodotto da cercare" };
    if (!apiKey || !siteId) return { errore: "Collegamento Wix non configurato" };
    try {
      const response = await fetchImpl(PRODUCT_QUERY_URL, {
        method: "POST",
        headers: {
          Authorization: apiKey,
          "wix-site-id": siteId,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildProductQuery(query)),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return { errore: "Ricerca non riuscita (" + response.status + ")" };
      const data = await response.json();
      if (!Array.isArray(data.products)) return { errore: "Risposta ricerca prodotti non valida" };
      const products = data.products.filter(product => product.visible !== false);
      products.sort((a, b) => relevance(b, query) - relevance(a, query));
      const results = products.slice(0, MAX_RESULTS).map(productToData);
      const total = typeof data.totalResults === "number" ? data.totalResults : null;
      return {
        risultati: results,
        totale_risultati: total,
        ricerca_parziale: products.length > results.length || (total !== null && total > results.length) || data.products.length === 50,
      };
    } catch (error) {
      console.error("cercaProdotti error:", error.name);
      return { errore: "Errore durante la ricerca prodotti" };
    }
  };
}

module.exports = { createProductSearch, buildProductQuery, productToData, stripHtml };
