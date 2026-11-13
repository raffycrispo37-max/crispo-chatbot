const test = require('node:test');
const assert = require('node:assert/strict');
const { createProductSearch, productToData, stockValue, stripHtml } = require('../lib/product-data');
const searchWith = fetchImpl => createProductSearch({ apiKey: 'key', siteId: 'site', fetchImpl });
const response = data => ({ ok: true, json: async () => data });

test('product and variant data retain zero prices, hidden filtering, media and mandatory fields without private costs', () => {
 const p = productToData({ id: 'p', name: 'Kit', costAndProfitData: { profit: 99 }, manageVariants: true,
 productPageUrl: { base: 'https://www.crispohome.it', path: '/product-page/kit' },
 stock: { inStock: true, inventoryStatus: 'PARTIALLY_OUT_OF_STOCK' },
 productOptions: [{ name: 'Colore', choices: [{ value: 'Rosa', description: 'Rosa', inStock: true }, { value: 'Blu', visible: false }] }],
 customTextFields: [{ title: 'Scrivi la tua personalizzazione', mandatory: true, maxLength: 500 }],
 media: { items: [{ mediaType: 'image', image: { url: 'https://static.wixstatic.com/a.webp', altText: 'Interno', width: 100 } }] },
 variants: [{ id: 'v', choices: { Colore: 'Rosa' }, variant: { priceData: { price: 0, discountedPrice: 0 }, sku: 'ROSA', costAndProfitData: { profit: 9 } }, stock: { trackQuantity: true, quantity: 0, inStock: true } }, { id: 'hidden', variant: { visible: false } }],
 });
 assert.equal(p.disponibile, null); assert.equal(p.varianti.length, 1); assert.equal(p.varianti[0].disponibile, false);
 assert.equal(p.varianti[0].prezzo_scontato, 0); assert.equal(p.opzioni[0].scelte.length, 1);
 assert.equal(p.campi_personalizzazione[0].obbligatorio, true); assert.equal(p.immagini[0].testo_alternativo, 'Interno');
 assert.equal(p.immagini_analizzate, false); assert.equal(p.url, 'https://www.crispohome.it/product-page/kit');
 assert.doesNotMatch(JSON.stringify(p), /profit|costAndProfitData/);
});
test('new stock status takes precedence over deprecated boolean; unknown stays unknown', () => {
 assert.equal(stockValue({ inventoryStatus: 'OUT_OF_STOCK', inStock: true }), false);
 assert.equal(stockValue({ inventoryStatus: 'IN_STOCK', inStock: false }), true);
 assert.equal(stockValue({ inventoryStatus: 'PARTIALLY_OUT_OF_STOCK', inStock: true }), null);
 assert.equal(stockValue({}), null);
});
test('URL/HTML handling rejects unsafe links and preserves useful text including numeric entities', () => {
 assert.equal(productToData({ name: 'x', productPageUrl: { base: 'invalid', path: '/x' } }).url, null);
 assert.equal(productToData({ name: 'x', productPageUrl: { base: 'https://a.it', path: 'javascript:alert(1)' } }).url, null);
 assert.equal(stripHtml('<script>ignore</script><p>Pu&#242; contenere &amp; tracce</p>'), 'Può contenere & tracce');
});
test('pagination reaches a relevant match on the second page', async () => {
 const calls=[];
 const search = searchWith(async (url, options) => {
  const req=JSON.parse(options.body); calls.push(req);
  const products= req.query.paging.offset === 0 ? Array.from({ length: 50 }, (_, i) => ({ id: String(i), name: 'Kit cremini extra '+i })) : [{ id: 'exact', name: 'Kit cremini' }];
  return response({ products, totalResults: 51 });
 });
 const r=await search('kit cremini');
 assert.equal(calls.length,2); assert.equal(calls[1].query.paging.offset,50); assert.equal(calls[0].includeVariants,true);
 assert.equal(r.risultati[0].id,'exact'); assert.equal(r.ricerca_parziale,true);
});
test('bounded searches explicitly report unread pages', async () => {
 let count=0;
 const r=await searchWith(async()=>{count++;return response({products:Array.from({length:50},(_,i)=>({id:count+'-'+i,name:'Snob'})),totalResults:200});})('Snob');
 assert.equal(count,3); assert.equal(r.ricerca_parziale,true);
});
test('customer spelling Choko Passion is canonicalized without changing returned product facts', async () => {
 let body;
 const r=await searchWith(async (url,opts)=>{body=JSON.parse(opts.body);return response({products:[{id:'p',name:'CiocoPassion Mix Patisserie'}],totalResults:1});})('choko passion');
 assert.match(body.query.filter,/CiocoPassion/); assert.equal(r.risultati[0].nome,'CiocoPassion Mix Patisserie');
});
test('exact product lookup and selected variant keep price and stock tied to the selected choices', async () => {
 let body;
 const search=searchWith(async(url,opts)=>{body=JSON.parse(opts.body);return response({products:[{id:'cb22b10e-914f-8146-3fd1-dde7e24a9462',name:'Macaron',manageVariants:true,variants:[{id:'pink',choices:{Colore:'Rosa'},variant:{priceData:{price:5}},stock:{inStock:true}},{id:'blue',choices:{Colore:'Blu'},variant:{priceData:{price:7}},stock:{inStock:false}}]}],totalResults:1});});
 const r=await search({query:'',product_id:'cb22b10e-914f-8146-3fd1-dde7e24a9462',choices:{Colore:'Rosa'}});
 assert.deepEqual(JSON.parse(body.query.filter),{id:{$eq:'cb22b10e-914f-8146-3fd1-dde7e24a9462'}});
 assert.equal(r.risultati[0].varianti.length,1);assert.equal(r.risultati[0].varianti[0].prezzo_listino,5);assert.equal(r.risultati[0].variante_esatta,true);
});
test('a later-page API failure never becomes a complete product response', async () => {
 let calls=0;
 const r=await searchWith(async()=> ++calls===1 ? response({products:Array.from({length:50},(_,i)=>({id:String(i),name:'Kit'})),totalResults:51}) : {ok:false,status:503})('kit');
 assert.match(r.errore,/503/);assert.equal(r.ricerca_parziale,true);assert.deepEqual(r.risultati,[]);
});

test('quality warnings preserve conflicting source data and unknown mandatory status', () => {
 const p=productToData({name:'Macaron',description:'SENZA GLUTINE',customTextFields:[{title:'Nome'}],additionalInfoSections:[{title:'Allergeni',description:'Può contenere tracce di glutine.'},{title:'Tempi di produzione',description:'10 giorni lavorativi'}]});
 assert.equal(p.campi_personalizzazione[0].obbligatorio,null);
 assert.deepEqual(p.avvisi.map(a=>a.codice),['GLUTINE_DA_VERIFICARE','PROCEDURA_DA_CONFRONTARE']);
 assert.equal(p.descrizione,'SENZA GLUTINE'); assert.match(p.allergeni,/tracce di glutine/);
});
