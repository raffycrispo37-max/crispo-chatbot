/* Aria - widget Crispo Home (file unico da caricare su Vercel). Per aggiornarlo in futuro basta sostituire questo file. */
(function(){
  var CSS="*,*::before,*::after{box-sizing:border-box}#aria-w{position:fixed;bottom:24px;right:24px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}#aria-btn{position:relative;width:60px;height:60px;border-radius:50%;background:#C3A04A;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(184,134,11,.26);display:flex;align-items:center;justify-content:center;transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s;outline:none}#aria-btn:hover{transform:translateY(-2px);box-shadow:0 12px 30px rgba(184,134,11,.42)}#aria-btn svg{width:26px;height:26px;fill:#fff}#aria-panel{position:fixed;bottom:98px;right:24px;width:370px;max-height:calc(100vh - 120px);background:#FBFAF8;border:1px solid #EFEADD;border-radius:20px;box-shadow:0 18px 50px rgba(40,34,20,.16);display:flex;flex-direction:column;overflow:hidden;transform:translateY(16px) scale(.98);opacity:0;pointer-events:none;transition:all .3s cubic-bezier(.22,1,.36,1);transform-origin:bottom right}#aria-panel.open{transform:translateY(0) scale(1);opacity:1;pointer-events:all}#aria-hdr{background:#fff;padding:15px 16px;display:flex;align-items:center;gap:12px;flex-shrink:0;border-bottom:1px solid #EFEADD}#aria-av{width:40px;height:40px;border-radius:50%;background:#F5EDD8;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#B8860B;font-family:Georgia,'Times New Roman',serif;font-size:20px;font-weight:600;letter-spacing:.3px}.ah-info{flex:1;min-width:0}.ah-name{color:#2C2A26;font-family:Georgia,'Times New Roman',serif;font-weight:600;font-size:16px;letter-spacing:.2px}.ah-sub{color:#9B9484;font-size:11.5px;margin-top:3px;display:flex;align-items:center;gap:5px}.ah-sub::before{content:'';width:6px;height:6px;border-radius:50%;background:#3fbf7f;display:inline-block;flex-shrink:0}#aria-x{background:none;border:none;color:#B4AC99;font-size:17px;cursor:pointer;padding:5px;line-height:1;border-radius:8px;transition:background .2s,color .2s}#aria-x:hover{color:#2C2A26;background:#F2EEE3}#aria-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;background:#FBFAF8}#aria-msgs::-webkit-scrollbar{width:4px}#aria-msgs::-webkit-scrollbar-thumb{background:#E6DDC2;border-radius:3px}.am{max-width:84%;padding:10px 14px;border-radius:16px;font-size:13.5px;line-height:1.55;word-wrap:break-word;white-space:pre-wrap;animation:amIn .3s cubic-bezier(.22,1,.36,1) both}@keyframes amIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.am.bot{background:#fff;color:#33302A;align-self:flex-start;border:1px solid #EEE8DA;border-bottom-left-radius:5px}.am.usr{background:#C3A04A;color:#fff;align-self:flex-end;border-bottom-right-radius:5px}.am-time{display:block;font-size:10px;margin-top:5px;text-align:right;letter-spacing:.3px}.am.bot .am-time{color:#B4AC99}.am.usr .am-time{color:rgba(255,255,255,.75)}.at{display:flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid #EEE8DA;border-radius:16px;border-bottom-left-radius:5px;align-self:flex-start}.at span{width:6px;height:6px;background:#C9A227;border-radius:50%;animation:abounce 1.2s infinite}.at span:nth-child(2){animation-delay:.2s}.at span:nth-child(3){animation-delay:.4s}@keyframes abounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-5px);opacity:1}}#aria-quick{display:flex;flex-direction:column;gap:6px;padding:8px 14px 10px;flex-shrink:0;background:#FBFAF8}.aq-btn{background:#fff;border:1px solid #E4DBC2;color:#7A6A2E;border-radius:12px;padding:8px 14px;font-size:12.5px;cursor:pointer;text-align:left;transition:background .18s,border-color .18s,color .18s;line-height:1.35;width:100%;font-weight:500}.aq-btn:hover{background:#F7F1DF;border-color:#C9A227;color:#8A6A10}.aq-btn.has-sub::after{content:'›';float:right;color:#C9A227;font-weight:600;margin-left:8px}#aria-tip{position:absolute;bottom:14px;right:74px;width:max-content;max-width:280px;background:#fff;color:#3b372f;border:1px solid #EFEADD;border-radius:14px;border-bottom-right-radius:4px;box-shadow:0 8px 24px rgba(40,34,20,.14);padding:11px 32px 11px 15px;font-size:13.5px;line-height:1.45;opacity:0;transform:translateY(6px) scale(.96);transform-origin:bottom right;pointer-events:none;transition:all .3s cubic-bezier(.22,1,.36,1);white-space:normal}#aria-tip b{display:block;margin-bottom:2px}#aria-tip.show{opacity:1;transform:translateY(0) scale(1);pointer-events:all;cursor:pointer}#aria-tip b{font-family:Georgia,'Times New Roman',serif;color:#2C2A26}#aria-tip-x{position:absolute;top:5px;right:7px;border:none;background:none;color:#B4AC99;font-size:14px;line-height:1;cursor:pointer;padding:2px}#aria-tip-x:hover{color:#2C2A26}#aria-footer{padding:12px;border-top:1px solid #EFEADD;display:flex;gap:8px;flex-shrink:0;background:#fff;align-items:center}#aria-inp{flex:1;border:1px solid #E4DBC2;border-radius:22px;padding:10px 15px;font-size:13.5px;outline:none;transition:border-color .2s,box-shadow .2s,background .2s;color:#33302A;background:#FBFAF8}#aria-inp:focus{border-color:#C9A227;box-shadow:0 0 0 3px rgba(201,162,39,.12);background:#fff}#aria-inp::placeholder{color:#B4AC99}#aria-send{width:40px;height:40px;border-radius:50%;background:#C3A04A;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .2s,opacity .2s;flex-shrink:0}#aria-send:hover{transform:scale(1.05)}#aria-send svg{width:16px;height:16px;fill:#fff}.aria-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;background:#e74c3c;border-radius:50%;border:2px solid #fff;display:none;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff}@media(max-width:480px){#aria-w{bottom:18px;right:18px}#aria-btn{width:54px;height:54px}#aria-panel{position:fixed;inset:0;width:100%!important;max-height:100%!important;border-radius:0;border:none}#aria-msgs{min-height:120px}#aria-quick{max-height:40vh;overflow-y:auto;-webkit-overflow-scrolling:touch}.aq-btn{font-size:12px}}";
  var HTML="<div id=\"aria-w\">\n  <div id=\"aria-panel\">\n    <div id=\"aria-hdr\">\n      <div id=\"aria-av\"><img src=\"data:image/jpeg;base64,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\" alt=\"Aria\" style=\"width:100%;height:100%;border-radius:50%;object-fit:cover;display:block\"></div>\n      <div class=\"ah-info\">\n        <div class=\"ah-name\">Aria</div>\n        <div class=\"ah-sub\">Assistente &middot; Crispo Home</div>\n      </div>\n      <button id=\"aria-x\" title=\"Chiudi\">&#x2715;</button>\n    </div>\n    <div id=\"aria-msgs\"></div>\n    <div id=\"aria-quick\"></div>\n    <div id=\"aria-footer\">\n      <input type=\"text\" id=\"aria-inp\" placeholder=\"Scrivi un messaggio...\" maxlength=\"500\" autocomplete=\"off\">\n      <button id=\"aria-send\" title=\"Invia\">\n        <svg viewBox=\"0 0 24 24\"><path d=\"M2.01 21L23 12 2.01 3 2 10l15 2-15 2z\"/></svg>\n      </button>\n    </div>\n  </div>\n\n  <div id=\"aria-tip\">\n    <button id=\"aria-tip-x\" title=\"Chiudi\">&#x2715;</button>\n    <b>Ciao!</b> Sono Aria, posso aiutarti?\n  </div>\n\n  <button id=\"aria-btn\" title=\"Parla con Aria\">\n    <svg id=\"aria-ico-chat\" viewBox=\"0 0 24 24\"><path d=\"M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z\"/></svg>\n    <svg id=\"aria-ico-x\" viewBox=\"0 0 24 24\" style=\"display:none\"><path d=\"M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z\"/></svg>\n    <div class=\"aria-badge\" id=\"aria-badge\">1</div>\n  </button>\n</div>";
  function init(){
    if(document.getElementById('aria-w')) return;
    var st=document.createElement('style'); st.textContent=CSS; document.head.appendChild(st);
    var wrap=document.createElement('div'); wrap.innerHTML=HTML; document.body.appendChild(wrap);
    try{ start(); }catch(e){ console.error('Aria init error', e); }
  }
  function start(){
var API = 'https://project-7g4zm.vercel.app/api/chat';

  var MENUS = {
    root: [
      { label: 'Laurea', menu: 'laurea' },
      { label: 'Nascita e Battesimo', menu: 'nascita' },
      { label: 'Comunione e Cresima', menu: 'comunione' },
      { label: 'Compleanno', menu: 'compleanno' },
      { label: 'Confetti', menu: 'confetti' },
      { label: 'Cioccolato', menu: 'cioccolato' },
      { label: 'Spedizioni e Pagamenti', menu: 'ordini' },
      { label: 'Altre domande', menu: 'altre' }
    ],
    laurea: [
      { label: 'Come funziona la personalizzazione?', ask: 'Come funziona la personalizzazione?' },
      { label: 'Tempi di produzione e consegna', ask: 'Quali sono i tempi di produzione e consegna?' },
      { label: 'Posso vedere un\'anteprima?', ask: 'Posso vedere un\'anteprima prima di ordinare?' }
    ],
    nascita: [
      { label: 'Come funziona la personalizzazione?', ask: 'Come funziona la personalizzazione?' },
      { label: 'Tempi di produzione e consegna', ask: 'Quali sono i tempi di produzione e consegna?' },
      { label: 'Posso vedere un\'anteprima?', ask: 'Posso vedere un\'anteprima prima di ordinare?' }
    ],
    comunione: [
      { label: 'Come funziona la personalizzazione?', ask: 'Come funziona la personalizzazione?' },
      { label: 'Tempi di produzione e consegna', ask: 'Quali sono i tempi di produzione e consegna?' },
      { label: 'Posso vedere un\'anteprima?', ask: 'Posso vedere un\'anteprima prima di ordinare?' }
    ],
    compleanno: [
      { label: 'Come funziona la personalizzazione?', ask: 'Come funziona la personalizzazione?' },
      { label: 'Tempi di produzione e consegna', ask: 'Quali sono i tempi di produzione e consegna?' },
      { label: 'Posso vedere un\'anteprima?', ask: 'Posso vedere un\'anteprima prima di ordinare?' }
    ],
    confetti: [
      { label: 'Quanti kg di confetti devo acquistare per il mio evento?', ask: 'Quanti Kg di confetti devo acquistare per il mio evento?' },
      { label: 'Quanti confetti escono in una confezione?', ask: 'Quanti confetti escono in una confezione?' },
      { label: 'Quali confetti sono senza glutine?', ask: 'Quali confetti sono senza glutine?' }
    ],
    cioccolato: [
      { label: 'Il cioccolato è senza glutine?', ask: 'Il cioccolato della Cioccolateria è senza glutine?' },
      { label: 'Tempi di spedizione', ask: 'Quali sono i tempi di spedizione del cioccolato della Cioccolateria?' },
      { label: 'Che tipi di cioccolato avete?', ask: 'Che tipi di cioccolato avete nella Cioccolateria?' }
    ],
    ordini: [
      { label: 'Costi e tempi di spedizione', ask: 'Quali sono i costi e i tempi di spedizione?' },
      { label: 'Metodi di pagamento', ask: 'Quali metodi di pagamento accettate?' },
      { label: 'Posso ritirare in sede?', ask: 'Posso ritirare l\'ordine in sede?' }
    ],
    altre: [
      { label: 'Ordinare ora e ricevere più avanti', ask: 'Posso ordinare adesso e richiedere la consegna nei prossimi mesi?' },
      { label: 'Quando mi contatta l\'ufficio grafico?', ask: 'Quando mi contatta l\'ufficio grafico dopo l\'ordine?' },
      { label: 'Come funziona un reso o un reclamo?', ask: 'Come funziona un reso o un reclamo?' }
    ]
  };

  var history = [];
  var isOpen = false;
  var isTyping = false;
  var greeted = false;

  var panel  = document.getElementById('aria-panel');
  var msgs   = document.getElementById('aria-msgs');
  var inp    = document.getElementById('aria-inp');
  var quick  = document.getElementById('aria-quick');
  var badge  = document.getElementById('aria-badge');

  function toggle(){
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    document.getElementById('aria-ico-chat').style.display = isOpen ? 'none' : 'block';
    document.getElementById('aria-ico-x').style.display   = isOpen ? 'block' : 'none';
    badge.style.display = 'none';
    var t = document.getElementById('aria-tip'); if(t) t.classList.remove('show');
    if(isOpen){
      if(!greeted){ greet(); greeted = true; }
      setTimeout(function(){ inp.focus(); }, 300);
    }
  }

  function greet(){
    addMsg('Ciao! 🌸 Sono Aria, l\'assistente di Crispo Home.\nScegli un argomento qui sotto oppure scrivimi pure la tua domanda.', 'bot');
    showQuick();
  }

  function showQuick(){
    renderChips('root');
  }

  function renderChips(key){
    quick.innerHTML = '';
    var items = MENUS[key] || MENUS.root;
    items.forEach(function(it){
      var b = document.createElement('button');
      b.className = 'aq-btn' + (it.menu ? ' has-sub' : '');
      b.textContent = it.label;
      b.addEventListener('click', function(){
        if(it.menu){ renderChips(it.menu); }
        else if(it.ask){ sendMsg(it.ask); }
      });
      quick.appendChild(b);
    });
    if(key !== 'root'){
      var back = document.createElement('button');
      back.className = 'aq-btn';
      back.textContent = '‹ Torna al menu';
      back.addEventListener('click', function(){ renderChips('root'); });
      quick.appendChild(back);
    }
  }

  function renderSuggestions(list){
    quick.innerHTML = '';
    list.slice(0,3).forEach(function(q){
      var b = document.createElement('button');
      b.className = 'aq-btn';
      b.textContent = q;
      b.addEventListener('click', function(){ sendMsg(q); });
      quick.appendChild(b);
    });
    var back = document.createElement('button');
    back.className = 'aq-btn';
    back.textContent = '‹ Menu principale';
    back.addEventListener('click', function(){ renderChips('root'); });
    quick.appendChild(back);
  }

  function addMsg(text, who){
    var d = document.createElement('div');
    d.className = 'am ' + who;
    d.appendChild(document.createTextNode(text));
    var t = document.createElement('span');
    t.className = 'am-time';
    t.textContent = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    d.appendChild(t);
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping(){
    var d = document.createElement('div');
    d.className = 'at'; d.id = 'aria-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping(){
    var el = document.getElementById('aria-typing');
    if(el) el.remove();
  }

  function sendMsg(msg){
    if(isTyping) return;
    addMsg(msg, 'usr');
    isTyping = true;
    showTyping();

    fetch(API, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ message: msg, history: history })
    })
    .then(function(r){ return r.json(); })
    .then(function(data){
      hideTyping();
      var reply = data.response || 'Mi dispiace, si è verificato un errore. Riprova tra qualche istante.';
      addMsg(reply, 'bot');
      if(reply.indexOf('328 448 2654') !== -1){
        var waText = encodeURIComponent('Ciao! Ho appena chattato con Aria e ho bisogno di assistenza riguardo a: ' + msg);
        var btn = document.createElement('a');
        btn.href = 'https://wa.me/393284482654?text=' + waText;
        btn.target = '_blank';
        btn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="#fff" style="vertical-align:middle;margin-right:6px;flex-shrink:0"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>Scrivi su WhatsApp';
        btn.style.cssText = 'display:inline-flex;align-items:center;background:#25D366;color:#fff;border-radius:20px;padding:8px 16px;font-size:13px;font-weight:600;text-decoration:none;margin-top:8px;cursor:pointer;align-self:flex-start';
        msgs.appendChild(btn);
        msgs.scrollTop = msgs.scrollHeight;
      }
      history.push({role:'user', content: msg});
      history.push({role:'assistant', content: reply});
      if(history.length > 20) history = history.slice(-20);
      if(!isOpen){ badge.style.display = 'flex'; }
    })
    .catch(function(){
      hideTyping();
      addMsg('Mi dispiace, non riesco a rispondere in questo momento.\nContattaci al ☎️ 081 827 1670 o su WhatsApp 📱 328 448 2654 (solo messaggi).', 'bot');
    })
    .finally(function(){ isTyping = false; });
  }

  function send(){
    var msg = inp.value.trim();
    if(!msg) return;
    inp.value = '';
    sendMsg(msg);
  }

  document.getElementById('aria-btn').addEventListener('click', toggle);
  document.getElementById('aria-x').addEventListener('click', toggle);
  document.getElementById('aria-send').addEventListener('click', send);
  inp.addEventListener('keydown', function(e){
    if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); send(); }
  });

  // Fumetto di benvenuto
  var tip = document.getElementById('aria-tip');
  var tipDismissed = false;
  function hideTip(){ if(tip) tip.classList.remove('show'); }
  setTimeout(function(){ if(!isOpen && !tipDismissed && tip){ tip.classList.add('show'); } }, 4000);
  if(tip){
    tip.addEventListener('click', function(){ hideTip(); if(!isOpen) toggle(); });
    document.getElementById('aria-tip-x').addEventListener('click', function(e){ e.stopPropagation(); tipDismissed = true; hideTip(); });
  }
  var _origToggle = toggle;
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded', init); } else { init(); }
})();
