const test=require('node:test');
const assert=require('node:assert/strict');
const {createProductSearch}=require('../lib/product-data');
const {createSolChat}=require('../lib/sol-runtime');
const ok=data=>({ok:true,json:async()=>data});
const collection={id:'confetti-collection',name:'Confetti',visible:true};
const make=fetchImpl=>createProductSearch({apiKey:'test',siteId:'site',fetchImpl});
test('overview resolves Confetti and traverses every page beyond the ten detail results',async()=>{
 const requests=[];
 const search=make(async(url,o)=>{const body=JSON.parse(o.body);requests.push({url,body});
  if(url.includes('/collections/'))return ok({collections:[collection]});
  const start=body.query.paging.offset;
  return ok({products:Array.from({length:start===0?100:1},(_,i)=>({id:String(start+i),name:'Modello '+(start+i),stock:{inventoryStatus:'IN_STOCK'}})),totalResults:101});
 });
 const r=await search({query:'',panoramica_confetti:true});
 assert.equal(r.catalogo_confetti.length,101);assert.equal(r.ricerca_parziale,false);assert.equal(r.pagine_lette,2);assert.equal(requests[2].body.query.paging.offset,100);
 assert.deepEqual(JSON.parse(requests[1].body.query.filter),{'collections.id':{$hasSome:[collection.id]}});assert.equal(requests[1].body.includeHiddenProducts,undefined);
});
test('overview preserves product labels and stock without inventing colors from flavors or exposing private costs',async()=>{
 const search=make(async url=>url.includes('/collections/')?ok({collections:[collection]}):ok({totalResults:3,products:[
  {id:'a',name:'Confetti Pesca',description:'Gusto pesca.',stock:{inventoryStatus:'IN_STOCK'},costAndProfitData:{profit:99}},
  {id:'b',name:'Linea Nuance Pesca',description:'Il colore esterno è pesca.',stock:{inventoryStatus:'OUT_OF_STOCK',inStock:true}},
  {id:'c',name:'Linea',stock:{inventoryStatus:'PARTIALLY_OUT_OF_STOCK',inStock:true},productOptions:[{name:'Colore',choices:[{value:'Rosa',inStock:true},{value:'Blu',visible:false}]}]}
 ]}));
 const r=await search({query:'',panoramica_confetti:true});
 assert.equal(r.catalogo_confetti[0].indicazioni_colore,undefined);assert.match(r.catalogo_confetti[1].indicazioni_colore,/colore esterno/);assert.equal(r.catalogo_confetti[1].disponibile,false);assert.equal(r.catalogo_confetti[2].disponibile,null);assert.equal(r.catalogo_confetti[2].opzioni_colore[0].scelte.length,1);assert.doesNotMatch(JSON.stringify(r),/profit|costAndProfitData/);
});
test('collection ambiguity is reported instead of selecting a guessed section',async()=>{
 const r=await make(async()=>ok({collections:[collection,{...collection,id:'other'}]}))({query:'',panoramica_confetti:true});
 assert.match(r.errore,/univoco/);assert.equal(r.ricerca_parziale,true);assert.equal(r.catalogo_confetti,undefined);
});
test('a failed later page never becomes a complete overview',async()=>{
 let n=0;
 const r=await make(async url=>{
  if(url.includes('/collections/'))return ok({collections:[collection]});
  return ++n===1?ok({products:Array.from({length:100},(_,i)=>({id:String(i),name:'Modello'})),totalResults:101}):{ok:false,status:503};
 })({query:'',panoramica_confetti:true});
 assert.match(r.errore,/503/);assert.equal(r.catalogo_confetti,undefined);assert.equal(r.ricerca_parziale,true);
});
test('changed totals and duplicate pages cannot be reported as full coverage',async()=>{
 const r=await make(async(url,o)=>{
  if(url.includes('/collections/'))return ok({collections:[collection]});
  const offset=JSON.parse(o.body).query.paging.offset;
  return ok({products:Array.from({length:100},(_,i)=>({id:String(i),name:'Modello'})),totalResults:offset===0?200:201});
 })({query:'',panoramica_confetti:true});
 assert.equal(r.ricerca_parziale,true);assert.equal(r.catalogo_confetti.length,100);
});
test('runtime forwards the overview flag and records its coverage in the tool trace',async()=>{
 let got,round=0;const requests=[];
 const chat=createSolChat({apiKey:'test',search:async args=>{got=args;return {risultati:[],catalogo_confetti:[{id:'a',nome:'Linea Salvia',disponibile:true}],ricerca_parziale:false};},fetchImpl:async(u,o)=>{
  requests.push(JSON.parse(o.body));
  return ok({id:'r'+round,status:'completed',output:++round===1?[{type:'function_call',name:'cerca_prodotto',call_id:'catalog',arguments:JSON.stringify({query:'',panoramica_confetti:true})}]:[{type:'message',role:'assistant',content:[{type:'output_text',text:'È presente il colore salvia.'}]}],usage:{input_tokens:1,output_tokens:1}});
 }});
 const r=await chat({message:'Quali colori ci sono?'});
 assert.equal(got.panoramica_confetti,true);assert.equal(r.trace[0].confetti_count,1);assert.match(requests[1].input.find(x=>x.type==='function_call_output').output,/Linea Salvia/);
});
