// Read-only complete overview. Product details remain a separate exact lookup.
const COLLECTIONS_URL='https://www.wixapis.com/stores-reader/v1/collections/query';
const PRODUCTS_URL='https://www.wixapis.com/stores-reader/v1/products/query';
function createConfettiCatalog({apiKey,siteId,fetchImpl=globalThis.fetch,toData}){
 return async function overview(){
  if(!apiKey||!siteId)return {errore:'Collegamento Wix non configurato',ricerca_parziale:true};
  const post=async(url,body)=>{
   const r=await fetchImpl(url,{method:'POST',headers:{Authorization:apiKey,'wix-site-id':siteId,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
   if(!r.ok)throw Error('WIX_HTTP_'+r.status);
   return r.json();
  };
  try{
   const found=await post(COLLECTIONS_URL,{query:{filter:JSON.stringify({name:{$eq:'Confetti'}}),paging:{limit:100,offset:0}}});
   const matches=Array.isArray(found.collections)?found.collections.filter(c=>c.name==='Confetti'&&c.visible!==false):[];
   if(matches.length!==1)return {errore:'Collezione Confetti non identificata in modo univoco',ricerca_parziale:true};
   const collection=matches[0],all=new Map();let total=null,partial=false,pages=0,finished=false;
   const deadline=Date.now()+35000;
   for(let page=0;page<20;page++){
    if(Date.now()>=deadline){partial=true;break;}
    const data=await post(PRODUCTS_URL,{query:{filter:JSON.stringify({'collections.id':{$hasSome:[collection.id]}}),sort:'[{"numericId":"asc"}]',paging:{limit:100,offset:page*100}},includeVariants:true});
    if(!Array.isArray(data.products))throw Error('INVALID_PRODUCTS');
    if(typeof data.totalResults==='number'){
     if(total!==null&&total!==data.totalResults)partial=true;
     total=data.totalResults;
    }
    const before=all.size;
    for(const p of data.products)if(p.visible!==false&&p.id)all.set(p.id,p);
    pages++;
    if(data.products.length<100||(total!==null&&(page*100+data.products.length)>=total)){finished=true;break;}
    if(all.size===before){partial=true;break;}
   }
   partial=partial||!finished||total===null||all.size!==total;
   const catalog=Array.from(all.values()).map(p=>{
    const d=toData(p);
    const colors=d.opzioni.filter(o=>/color|tonalit/i.test(o.nome)||String(o.tipo).toLowerCase()==='color');
    const statements=(d.descrizione.match(/[^.!?]*(?:color[ei]|tonalit[aà])[^.!?]*[.!?]?/gi)||[]).map(s=>s.trim()).filter(Boolean).join(' ');
    return {id:d.id,nome:d.nome,disponibile:d.disponibile,
     ...(colors.length?{opzioni_colore:colors}:{}),
     ...(statements?{indicazioni_colore:statements.slice(0,800),indicazioni_colore_parziali:statements.length>800}:{})};
   });
   return {risultati:[],catalogo_confetti:catalog,collezione:{id:collection.id,nome:collection.name},totale_risultati:total,articoli_restituiti:catalog.length,pagine_lette:pages,ricerca_parziale:partial,letto_il:new Date().toISOString(),fonte:'Wix Catalog V1 — collezione Confetti',nota:'Questa panoramica serve per individuare linee, modelli e colori presenti. I nomi non identificano sempre il colore: Pesca o Limone possono indicare un gusto. Per dati ambigui, ingredienti, prezzo e formato rileggi il prodotto per ID. Disponibile=false non va proposto come acquistabile; disponibile=null richiede verifica. Una ricerca parziale non è l’elenco completo.'};
  }catch(e){return {errore:'Panoramica Confetti non disponibile ('+(e.message?.startsWith('WIX_HTTP_')?e.message:'errore di lettura')+')',risultati:[],ricerca_parziale:true};}
 };
}
module.exports={createConfettiCatalog};
