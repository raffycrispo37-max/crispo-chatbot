const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { createProductSearch, productToData } = require("../lib/product-data");
const knowledge = require("../lib/knowledge");

function sampleProduct(overrides = {}) {
  return {
    name: "Kit da 32 cremini personalizzati",
    sku: "KIT32",
    visible: true,
    stock: { inStock: false },
    priceData: { price: 30, discountedPrice: 24 },
    description: "<p>" + "Descrizione della confezione. ".repeat(30) + "Il kit non include una scatola.</p>",
    additionalInfoSections: [
      { title: "INGREDIENTI E ALLERGENI", description: "<p>" + "Ingredienti dettagliati. ".repeat(30) + "Può contenere tracce di glutine.</p>" },
      { title: "Misure", description: "Scatola 12 x 8 cm; oggetto interno 3 cm." },
      { title: "Misure", description: "Altezza esterna 2 cm." },
    ],
    ...overrides,
  };
}

test("Wix search sends supported filters and preserves late packaging/allergen details", async () => {
  let request;
  const search = createProductSearch({
    apiKey: "test-key", siteId: "test-site",
    fetchImpl: async (url, options) => {
      request = { url, ...options, body: JSON.parse(options.body) };
      return { ok: true, json: async () => ({ products: [sampleProduct(), sampleProduct({ visible: false })], totalResults: 1 }) };
    },
  });
  const data = await search("kit cremini");
  assert.equal(request.url, "https://www.wixapis.com/stores-reader/v1/products/query");
  assert.equal(request.method, "POST");
  assert.equal(request.body.freeText, undefined);
  assert.deepEqual(JSON.parse(request.body.query.filter).$or[2], {
    $and: [{ name: { $contains: "kit" } }, { name: { $contains: "cremini" } }],
  });
  assert.equal(data.risultati.length, 1);
  assert.match(data.risultati[0].descrizione, /Il kit non include una scatola\.$/);
  assert.match(data.risultati[0].ingredienti, /tracce di glutine\.$/);
  assert.match(data.risultati[0].allergeni, /tracce di glutine\.$/);
  assert.equal(data.risultati[0].sezioni.length, 3);
  assert.equal(data.risultati[0].disponibile, false);
});

test("missing prices and stock remain unknown while valid zero prices are preserved", () => {
  const unknown = productToData({ name: "Prodotto" });
  assert.equal(unknown.prezzo_listino, null);
  assert.equal(unknown.disponibile, null);
  const free = productToData({ name: "Omaggio", priceData: { price: 0, discountedPrice: 0 } });
  assert.equal(free.prezzo_listino, 0);
  assert.equal(free.prezzo_scontato, 0);
});

test("empty queries and absent configuration never trigger a catalog request", async () => {
  const fetchImpl = () => { throw new Error("Unexpected network request"); };
  const search = createProductSearch({ apiKey: "key", siteId: "site", fetchImpl });
  assert.match((await search(" ")).errore, /nome del prodotto/);
  assert.match((await createProductSearch({ fetchImpl })("Snob")).errore, /non configurato/);
});

test("HTTP and malformed catalog errors are not reported as no products or out of stock", async () => {
  const failed = createProductSearch({ apiKey: "key", siteId: "site", fetchImpl: async () => ({ ok: false, status: 403 }) });
  assert.match((await failed("Snob")).errore, /403/);
  const malformed = createProductSearch({ apiKey: "key", siteId: "site", fetchImpl: async () => ({ ok: true, json: async () => ({}) }) });
  assert.match((await malformed("Snob")).errore, /non valida/);
});

test("broad searches flag partial results and rank the exact product first", async () => {
  const products = Array.from({ length: 11 }, (_, i) => sampleProduct({ name: `Kit cremini ${i}`, sku: `SKU-${i}` }));
  products.push(sampleProduct({ name: "Kit cremini", sku: "EXACT" }));
  const search = createProductSearch({ apiKey: "key", siteId: "site", fetchImpl: async () => ({ ok: true, json: async () => ({ products, totalResults: 100 }) }) });
  const data = await search("Kit cremini");
  assert.equal(data.risultati.length, 10);
  assert.equal(data.risultati[0].sku, "EXACT");
  assert.equal(data.ricerca_parziale, true);
});

for (const filename of ["chat.js", "chat-live.js"]) {
  test(`${filename} passes complete Wix data and shared instructions through its tool loop`, async () => {
    const calls = [];
    let primary = 0;
    const fakeFetch = async url => {
      if (url.includes("wixapis.com")) return { ok: true, json: async () => ({ products: [sampleProduct()], totalResults: 1 }) };
      if (url.includes("airtable.com")) return { ok: true, json: async () => ({}) };
      throw new Error("Unexpected endpoint");
    };
    class MockAnthropic {
      constructor() {
        this.messages = { create: async input => {
          calls.push(structuredClone(input));
          if (!input.tools) return { content: [{ type: "text", text: '["Tempi di produzione?","Come personalizzo?","Come ordino?"]' }] };
          if (primary++ === 0) return { stop_reason: "tool_use", content: [{ type: "tool_use", name: "cerca_prodotto", id: "tool-test", input: { query: "kit cremini" } }] };
          return { stop_reason: "end_turn", content: [{ type: "text", text: "La scheda segnala possibili tracce di glutine." }] };
        } };
      }
    }
    const productData = require("../lib/product-data");
    const context = {
      module: { exports: {} },
      require: name => {
        if (name === "@anthropic-ai/sdk") return MockAnthropic;
        if (name === "../lib/knowledge") return knowledge;
        if (name === "../lib/catalog-tool") return require("../lib/catalog-tool");
        if (name === "../lib/product-data") return { createProductSearch: options => productData.createProductSearch({ ...options, fetchImpl: fakeFetch }) };
        throw new Error("Unexpected dependency " + name);
      },
      process: { env: { ANTHROPIC_API_KEY: "test", WIX_API_KEY: "test", WIX_SITE_ID: "test", AIRTABLE_BASE_ID: "test", AIRTABLE_TOKEN: "test" } },
      fetch: fakeFetch, console, Date, Intl,
    };
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../api", filename), "utf8"), context, { filename });
    const result = { setHeader() {}, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
    await context.module.exports({ method: "POST", body: { message: "Il kit cremini contiene glutine?", history: [] } }, result);
    assert.equal(result.code, 200);
    assert.equal(calls[0].system[0].text, knowledge.SYSTEM_PROMPT);
    assert.ok(calls[0].system[1].text.includes(knowledge.PRODUCT_CONTEXT));
    const toolResult = calls[1].messages.at(-1).content[0];
    const details = JSON.parse(toolResult.content).risultati[0];
    assert.match(details.descrizione, /Il kit non include una scatola\.$/);
    assert.match(details.allergeni, /tracce di glutine\.$/);
    assert.equal(details.disponibile, false);
  });
}

