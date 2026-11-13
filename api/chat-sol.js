const { createSolChat } = require('../lib/sol-runtime');
const { logConversation, journalContext } = require('../lib/conversation-log');
module.exports=async (req,res)=>{
 res.setHeader('Cache-Control','private, no-store');
 const origin=req.headers?.origin;
 const allowed=!origin || ['https://www.crispohome.it','https://crispohome.it'].includes(origin) || origin===`https://${req.headers?.host}`;
 if (!allowed) return res.status(403).json({error:'Origine non consentita.'});
 if (origin) {res.setHeader('Access-Control-Allow-Origin',origin);res.setHeader('Vary','Origin');}
 res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
 res.setHeader('Access-Control-Allow-Headers','Content-Type');
 if(req.method==='OPTIONS')return res.status(204).end();
 // This new route is available in Preview. Production requires a separate explicit enablement.
 if(process.env.VERCEL_ENV!=='preview' && process.env.ARIA_SOL_ENABLED!=='true')return res.status(503).json({error:'Aria Sol non attiva in questo ambiente.'});
 if(req.method!=='POST')return res.status(405).json({error:'Metodo non consentito.'});
 const journal=journalContext({sessionId:req.body?.sessionId,requestId:req.body?.requestId,turn:req.body?.turn});
 const message=req.body?.message;
 if(typeof message!=='string'||!message.trim()||message.length>6000)return res.status(400).json({error:'Inserisci un messaggio valido.'});
 await logConversation(message,undefined,{...journal,outcome:'in elaborazione'});
 try {
  const chat=createSolChat({apiKey:process.env.OPENAI_API_KEY||process.env.OPENAI_KEY,wixApiKey:process.env.WIX_API_KEY,wixSiteId:process.env.WIX_SITE_ID});
  const result=await chat({message:req.body?.message,history:req.body?.history,productId:req.body?.productId});
  await logConversation(message,result.response,{...journal,outcome:'completato'});
  return res.status(200).json({response:result.response,suggestions:result.suggestions});
 }catch(error){
  console.error('Aria Sol:',error.message);
  if(error.message==='INVALID_MESSAGE')return res.status(400).json({error:'Inserisci un messaggio valido.'});
  const fallback='Non riesco a completare la verifica in questo momento. Puoi contattarci a info@crispohome.it o su WhatsApp al 328 448 2654, solo messaggi.';
  await logConversation(message,fallback,{...journal,outcome:'errore del servizio'});
  return res.status(502).json({error:fallback});
 }
};
