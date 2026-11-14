/* Aria · Crispo Home. Isolated, accessible widget for the Sol preview. */
(() => {
  'use strict';
  if (document.getElementById('aria-sol-chat')) return;
  const script = document.currentScript;
  const legacy = document.getElementById('aria-w');
  if (legacy) {
    if (document.getElementById('aria-panel')?.classList.contains('open')) document.getElementById('aria-x')?.click();
    legacy.remove();
    document.querySelectorAll('style').forEach(style => { if (style.textContent.includes('#aria-w{') && style.textContent.includes('#aria-panel{')) style.remove(); });
  }
  const origin = new URL(script.src).origin;
  const assetRoot = new URL('./assets/aria/', script.src);
  const endpoint = script.dataset.endpoint || `${origin}/api/chat-sol`;
  const autoOpen = script.dataset.autoOpen === 'true';
  const reviewURL = 'https://g.page/r/CQ9h1M02Bt5uEAI/review';
  if (typeof FontFace === 'function' && document.fonts) {
    for (const [family, file] of [['AriaCormorant', 'cormorant-regular.woff2'], ['AriaRaleway', 'raleway-regular.woff2']]) {
      if (![...document.fonts].some(font => font.family === family)) {
        const face = new FontFace(family, `url("${new URL(file, assetRoot).href}")`, { style:'normal', weight:'400', display:'swap' });
        document.fonts.add(face); face.load().catch(() => {});
      }
    }
  }
  const icons = {
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
    arrow: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
    chevron: '<path d="m9 6 6 6-6 6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    minus: '<path d="M5 12h14"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    gift: '<path d="M3 8h18v4H3zM5 12v9h14v-9M12 8v13"/><path d="M12 8H8.5A3.5 3.5 0 1 1 12 4.5V8Zm0 0h3.5A3.5 3.5 0 1 0 12 4.5V8Z"/>',
    delivery: '<path d="M3 6h11v12H3zM14 10h4l3 4v4h-7M3 10h5"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    order: '<path d="M8 5H5v16h14V5h-3M9 3h6v4H9zM8 12h8M8 16h5"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    reset: '<path d="M3 10a9 9 0 1 1 1 8M3 4v6h6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    confetti: '<ellipse cx="8" cy="8" rx="3" ry="4" transform="rotate(-25 8 8)"/><ellipse cx="16" cy="9" rx="3" ry="4" transform="rotate(25 16 9)"/><ellipse cx="12" cy="17" rx="3" ry="4" transform="rotate(-10 12 17)"/>',
    topics: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>'
  };
  const svg = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]}</svg>`;
  const topics = {
    customization: { title: 'Personalizzazione', description: 'Grafiche, colori e bozza', icon: 'gift', questions: ['Come funziona la personalizzazione?', 'Posso inviare una mia grafica o una foto?', 'Quando riceverò la bozza grafica?'] },
    shipping: { title: 'Spedizioni e ritiro', description: 'Costi, tempi e ritiro in sede', icon: 'delivery', questions: ['Quanto costa la spedizione in Italia?', 'Quanto tempo richiede il trasporto dopo la spedizione?', 'Posso ritirare il mio ordine in sede?'] },
    products: { title: 'Confetti e prodotti', description: 'Quantità, conservazione e allergeni', icon: 'confetti', questions: ['Come calcolo i confetti per i miei invitati?', 'Come devo conservare i prodotti?', 'Come posso verificare gli allergeni di un prodotto?'] },
    assistance: { title: 'Assistenza ordini', description: 'Tracking, modifiche e contatti', icon: 'order', questions: ['Come ricevo il tracking?', 'Posso modificare quantità o indirizzo del mio ordine?', 'Come posso contattare l’assistenza?'] }
  };
  const host = document.createElement('div');
  host.id = 'aria-sol-chat';
  const root = host.attachShadow({ mode: 'open' });
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = new URL('aria-widget-sol.css', script.src).href;
  root.append(stylesheet);
  const markup = document.createElement('div');
  markup.innerHTML = `
    <section class="panel" id="aria-panel" role="dialog" aria-labelledby="aria-title" aria-describedby="aria-description" hidden>
      <header class="header">
        <div class="avatar" aria-hidden="true"><span>A</span><i></i></div>
        <div class="identity"><span class="eyebrow">CRISPO HOME</span><h2 id="aria-title">Aria</h2><p id="aria-description">Assistente virtuale</p></div>
        <div class="header-actions">
          <button class="icon-button" id="menu-toggle" aria-label="Opzioni della conversazione" aria-expanded="false" aria-controls="chat-menu">${svg('more')}</button>
          <button class="icon-button" id="minimize" aria-label="Riduci la chat">${svg('minus')}</button>
        </div>
      </header>
      <div class="menu" id="chat-menu" hidden>
        <div id="menu-default"><button id="open-topics">${svg('topics')}Argomenti e domande</button><button id="new-chat">${svg('reset')}Nuova conversazione</button><button id="contact-team">${svg('mail')}Contatta il team</button></div>
        <div id="menu-confirm" hidden><p>Vuoi iniziare una nuova conversazione?</p><div class="confirm-actions"><button id="cancel-reset">Annulla</button><button id="confirm-reset">Sì, ricomincia</button></div></div>
      </div>
      <div class="conversation" id="conversation">
        <div class="welcome" id="welcome">
          <div class="welcome-heading"><p class="welcome-copy">Sono Aria. Ti aiuto a scegliere, personalizzare e trovare le informazioni che cerchi.</p></div>
          <h3 class="browse-heading">Di cosa vuoi parlare?</h3>
          <div class="topics" id="topic-list" aria-label="Scegli un argomento">${Object.entries(topics).map(([key, topic]) => `<button class="topic" data-topic="${key}" aria-controls="topic-detail">${svg(topic.icon)}<span><strong>${topic.title}</strong><small>${topic.description}</small></span>${svg('chevron')}</button>`).join('')}</div>
          <div class="topic-detail" id="topic-detail" hidden><button class="topic-back" id="topic-back">${svg('chevron')}Tutti gli argomenti</button><h3 id="topic-title" tabindex="-1"></h3><p class="topic-hint">Scegli una domanda oppure scrivimi liberamente.</p><div id="topic-questions" class="questions" aria-labelledby="topic-title"></div></div>
          <p class="welcome-note">Oppure scrivimi direttamente qui sotto.</p>
        </div>
        <div class="messages" id="messages" role="log" aria-label="Conversazione con Aria" aria-live="polite" aria-relevant="additions text"></div>
        <div class="contact-card" id="contact-card" hidden><button id="contact-close" class="icon-button" aria-label="Chiudi i contatti">${svg('close')}</button><span class="eyebrow">IL TEAM CRISPO HOME</span><h3>Un contatto diretto.</h3><p>Per richieste sul tuo ordine puoi scriverci:</p><a href="https://wa.me/393284482654" target="_blank" rel="noopener noreferrer">WhatsApp <span>328 448 2654</span>${svg('chevron')}</a><small>Solo messaggi</small><a href="mailto:info@crispohome.it">Email <span>info@crispohome.it</span>${svg('chevron')}</a><p class="hours">Lun–ven 9:00–13:00 / 15:30–19:45<br>Sabato 9:00–13:00</p></div>
      </div>
      <div class="reply-status" id="reply-status" role="status" aria-live="polite"></div>
      <footer class="footer"><div class="footer-tools" id="footer-tools" hidden><button id="topics-toggle" type="button" aria-controls="welcome" aria-expanded="false">${svg('topics')}Argomenti</button></div><form id="composer" class="composer"><label for="message" class="sr-only">Il tuo messaggio ad Aria</label><textarea id="message" rows="1" placeholder="Scrivi ad Aria…" maxlength="6000" enterkeyhint="send"></textarea><button id="send" class="send" type="submit" aria-label="Invia messaggio" disabled>${svg('arrow')}</button></form><div class="footer-note"><span class="fine-monogram" aria-hidden="true">A</span><span>Aria · Assistente virtuale di Crispo Home</span></div></footer>
    </section>
    <button class="launcher" id="launcher" aria-label="Apri la chat con Aria" aria-expanded="false" aria-controls="aria-panel">${svg('chat')}<span>Parla con Aria</span><i class="unread" hidden></i></button>`;
  root.append(markup);
  const $ = (id) => root.getElementById(id);
  const panel = $('aria-panel'), input = $('message'), send = $('send');
  const messages = $('messages'), welcome = $('welcome'), conversation = $('conversation');
  const launcher = $('launcher'), status = $('reply-status'), menu = $('chat-menu');
  const cacheKey = 'crispohome.aria.sol.conversation.v1';
  const newId = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Array.from(crypto.getRandomValues(new Uint8Array(16)), n => n.toString(16).padStart(2, '0')).join('');
  const validId = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{8,100}$/.test(value);
  let sessionId = newId(), turn = 0;
  let history = [], records = [], busy = false, opened = false, controller = null;
  let pageStyles = null, savedScrollY = 0, slowTimer = null;
  const mobile = () => matchMedia('(max-width: 480px)').matches;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const time = () => new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const scroll = () => requestAnimationFrame(() => conversation.scrollTo({ top: conversation.scrollHeight, behavior: reducedMotion ? 'instant' : 'smooth' }));
  function persist() {
    try { sessionStorage.setItem(cacheKey, JSON.stringify({ saved: Date.now(), sessionId, turn, history, records: records.slice(-40) })); } catch (_) { /* Storage can be disabled. */ }
  }
  function lockPage(lock) {
    if (lock && mobile() && !pageStyles) {
      savedScrollY = window.scrollY;
      pageStyles = {};
      for (const key of ['position', 'top', 'left', 'right', 'width', 'overflow']) pageStyles[key] = document.body.style[key];
      Object.assign(document.body.style, { position: 'fixed', top: `-${savedScrollY}px`, left: '0', right: '0', width: '100%', overflow: 'hidden' });
    } else if ((!lock || !mobile()) && pageStyles) {
      Object.assign(document.body.style, pageStyles); pageStyles = null;
      window.scrollTo(0, savedScrollY);
    }
  }
  function viewport() {
    if (mobile() && window.visualViewport) {
      host.style.setProperty('--aria-viewport-height', `${window.visualViewport.height}px`);
      host.style.setProperty('--aria-viewport-top', `${window.visualViewport.offsetTop}px`);
    }
    panel.setAttribute('aria-modal', String(mobile()));
    lockPage(opened);
  }
  function setOpen(value) {
    opened = value; panel.hidden = !value;
    launcher.setAttribute('aria-expanded', String(value));
    launcher.classList.toggle('active', value);
    launcher.setAttribute('aria-label', value ? 'Riduci la chat con Aria' : 'Apri la chat con Aria');
    if (value) {
      root.querySelector('.unread').hidden = true;
      viewport();
      if (!mobile()) setTimeout(() => input.focus({ preventScroll: true }), 100);
      if (!welcome.hidden) conversation.scrollTop = 0; else scroll();
    } else { closeMenu(); lockPage(false); launcher.focus({ preventScroll: true }); }
  }
  function closeMenu() { menu.hidden = true; $('menu-toggle').setAttribute('aria-expanded', 'false'); }
  function topicRoot() {
    $('topic-list').hidden = false; $('topic-detail').hidden = true;
    welcome.classList.remove('detail-open');
  }
  function showTopics() {
    if (busy) return;
    closeMenu(); $('contact-card').hidden = true; topicRoot();
    welcome.hidden = false; welcome.classList.toggle('browsing', records.length > 0);
    $('topics-toggle').setAttribute('aria-expanded', 'true');
    conversation.scrollTop = 0;
    $('topic-list').querySelector('button').focus({ preventScroll: true });
  }
  function hideTopics() {
    welcome.hidden = true; $('topics-toggle').setAttribute('aria-expanded', 'false');
  }
  function showTopic(key) {
    if (busy || !topics[key]) return;
    const topic = topics[key];
    $('topic-list').hidden = true; $('topic-detail').hidden = false;
    welcome.classList.add('detail-open'); $('topic-title').textContent = topic.title;
    $('topic-questions').replaceChildren();
    for (const question of topic.questions) {
      const button = document.createElement('button'); button.className = 'question';
      const label = document.createElement('span'); label.textContent = question;
      button.append(label); const icon = document.createElement('span'); icon.className = 'question-arrow'; icon.innerHTML = svg('chevron'); button.append(icon);
      button.addEventListener('click', () => ask(question)); $('topic-questions').append(button);
    }
    conversation.scrollTop = 0; $('topic-title').focus({ preventScroll: true });
  }
  function safeLink(url) {
    try { const parsed = new URL(url); return ['https:', 'http:', 'mailto:'].includes(parsed.protocol) ? parsed.href : null; } catch (_) { return null; }
  }
  function inline(text, target) {
    const tokens = /(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s]+|[\w.+-]+@[\w.-]+\.[a-z]{2,})/gi;
    let previous = 0;
    for (const match of text.matchAll(tokens)) {
      target.append(document.createTextNode(text.slice(previous, match.index)));
      const token = match[0];
      if (token.startsWith('**')) { const strong = document.createElement('strong'); strong.textContent = token.slice(2, -2); target.append(strong); }
      else {
        const md = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        const trim = token.startsWith('http') ? token.replace(/[.,;!?]+$/, '') : token;
        const url = md ? md[2] : trim.includes('@') && !trim.startsWith('http') ? `mailto:${trim}` : trim;
        const href = safeLink(url);
        if (href) {
          const a = document.createElement('a'); a.href = href; a.textContent = md ? md[1] : trim; a.target = '_blank'; a.rel = 'noopener noreferrer';
          if (href === reviewURL) {
            a.className = 'review-button'; a.textContent = 'Lascia una recensione su Google';
            a.setAttribute('aria-label', 'Scrivi una recensione di Crispo Home su Google, si apre in una nuova scheda');
          }
          target.append(a); if (!md && trim.length < token.length) target.append(document.createTextNode(token.slice(trim.length)));
        }
        else target.append(document.createTextNode(token));
      }
      previous = match.index + token.length;
    }
    target.append(document.createTextNode(text.slice(previous)));
  }
  function richText(text, target) {
    let list = null, listType = '';
    for (const line of text.split('\n')) {
      if (!line.trim()) { list = null; listType = ''; continue; }
      const bullet = line.match(/^\s*(?:([-*•])\s+|(\d+)\.\s+)(.+)$/);
      if (bullet) {
        const type = bullet[2] ? 'ol' : 'ul';
        if (!list || listType !== type) { list = document.createElement(type); listType = type; if (type === 'ol') list.start = Number(bullet[2]); target.append(list); }
        const li = document.createElement('li'); inline(bullet[3], li); list.append(li);
      } else { list = null; listType = ''; const p = document.createElement('p'); inline(line.replace(/^#{1,4}\s+/, ''), p); target.append(p); }
    }
  }
  function whatsappURL(context = '') {
    const request = typeof context === 'string' ? context.trim().slice(0, 1000) : '';
    const url = new URL('https://wa.me/393284482654');
    url.searchParams.set('text', request ? `Salve, ho appena parlato con Aria e vorrei assistenza per: ${request}` : 'Salve, vorrei ricevere assistenza.');
    return url.href;
  }
  function mentionsSupport(text) {
    return /(?:\+?39[\s().-]*)?328[\s().-]*448[\s().-]*2654\b/.test(text) || /https:\/\/wa\.me\/393284482654(?:[?\s/)\]]|$)/i.test(text);
  }
  function addMessage(text, role, stamp = time(), save = true, supportContext = '') {
    hideTopics(); $('footer-tools').hidden = false;
    const row = document.createElement('article'); row.className = `message ${role}`;
    row.setAttribute('aria-label', role === 'user' ? 'Tu' : 'Aria');
    if (role !== 'user') { const author = document.createElement('span'); author.className = 'author'; author.textContent = 'ARIA'; row.append(author); }
    const bubble = document.createElement('div'); bubble.className = 'bubble';
    if (role === 'user') bubble.textContent = text; else richText(text, bubble);
    row.append(bubble);
    if (role === 'assistant' && mentionsSupport(text)) {
      const contact = document.createElement('a');
      contact.className = 'whatsapp-button';
      contact.href = whatsappURL(supportContext);
      contact.target = '_blank'; contact.rel = 'noopener noreferrer';
      contact.setAttribute('aria-label', 'Apri la chat WhatsApp dell’assistenza Crispo Home');
      contact.innerHTML = svg('chat');
      const label = document.createElement('span'); label.textContent = 'Scrivi su WhatsApp'; contact.append(label);
      row.append(contact);
      const note = document.createElement('small'); note.className = 'whatsapp-note'; note.textContent = 'Assistenza · Solo messaggi'; row.append(note);
    }
    const meta = document.createElement('div'); meta.className = 'message-meta';
    const t = document.createElement('time'); t.textContent = stamp; meta.append(t);
    if (role === 'assistant') {
      const copy = document.createElement('button'); copy.className = 'copy icon-button'; copy.type = 'button'; copy.setAttribute('aria-label', 'Copia la risposta di Aria'); copy.innerHTML = svg('copy');
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(text); copy.innerHTML = svg('check'); copy.setAttribute('aria-label', 'Risposta copiata'); setTimeout(() => { copy.innerHTML = svg('copy'); copy.setAttribute('aria-label', 'Copia la risposta di Aria'); }, 1800); }
        catch (_) { status.textContent = 'Puoi selezionare il testo della risposta per copiarlo.'; }
      });
      meta.append(copy);
    }
    row.append(meta); messages.append(row);
    if (save) { records.push({ text, role, time: stamp, ...(role === 'assistant' && mentionsSupport(text) ? { supportContext: typeof supportContext === 'string' ? supportContext.slice(0, 1000) : '' } : {}) }); persist(); }
    scroll(); return row;
  }
  function resizeInput() { input.style.height = 'auto'; input.style.height = `${Math.min(input.scrollHeight, 120)}px`; send.disabled = busy || !input.value.trim(); }
  function setBusy(value) {
    busy = value; send.disabled = value || !input.value.trim(); input.readOnly = value;
    $('new-chat').disabled = value;
    $('open-topics').disabled = value; $('topics-toggle').disabled = value;
    root.querySelectorAll('.topic, .question').forEach(b => { b.disabled = value; });
    status.classList.toggle('typing', value);
    status.textContent = value ? 'Aria sta rispondendo' : '';
    panel.setAttribute('aria-busy', String(value));
  }
  async function ask(text, retryRow = null, exchange = null) {
    if (busy || !text.trim()) return;
    closeMenu(); hideTopics(); $('contact-card').hidden = true;
    if (!exchange) exchange = { sessionId, requestId: newId(), turn: ++turn };
    if (retryRow) retryRow.remove(); else addMessage(text, 'user');
    input.value = ''; resizeInput(); setBusy(true);
    controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 140000);
    slowTimer = setTimeout(() => { if (busy) status.textContent = 'Aria sta verificando le informazioni'; }, 12000);
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, history, ...exchange }), signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const data = await response.json();
      if (typeof data.response !== 'string' || !data.response.trim()) throw new Error('EMPTY_RESPONSE');
      history.push({ role: 'user', content: text }, { role: 'assistant', content: data.response }); history = history.slice(-20);
      addMessage(data.response, 'assistant', time(), true, text);
      if (!opened) root.querySelector('.unread').hidden = false;
    } catch (_) {
      const row = document.createElement('div'); row.className = 'error'; row.setAttribute('role', 'alert');
      const p = document.createElement('p'); p.textContent = 'Non riesco a rispondere in questo momento. Puoi riprovare o contattare il team.';
      const actions = document.createElement('div');
      const retry = document.createElement('button'); retry.textContent = 'Riprova'; retry.addEventListener('click', () => ask(text, row, exchange));
      const contact = document.createElement('button'); contact.textContent = 'Contatta il team'; contact.addEventListener('click', showContacts);
      actions.append(retry, contact); row.append(p, actions); messages.append(row); scroll();
    } finally { clearTimeout(timeout); clearTimeout(slowTimer); controller = null; setBusy(false); if (opened && !mobile()) input.focus({ preventScroll: true }); }
  }
  function reset() {
    if (busy) return;
    history = []; records = []; sessionId = newId(); turn = 0; messages.replaceChildren(); welcome.hidden = false;
    topicRoot(); welcome.classList.remove('browsing'); $('footer-tools').hidden = true;
    $('topics-toggle').setAttribute('aria-expanded', 'false');
    $('contact-card').hidden = true; input.value = ''; resizeInput(); status.textContent = ''; closeMenu();
    try { sessionStorage.removeItem(cacheKey); } catch (_) { /* No storage is required. */ }
    conversation.scrollTop = 0; if (!mobile()) input.focus({ preventScroll: true });
  }
  function showContacts() {
    closeMenu();
    const lastRequest = [...records].reverse().find(message => message.role === 'user');
    $('contact-card').querySelector('a').href = whatsappURL(lastRequest?.text);
    $('contact-card').hidden = false; scroll();
  }
  launcher.addEventListener('click', () => setOpen(!opened));
  $('minimize').addEventListener('click', () => setOpen(false));
  $('menu-toggle').addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; $('menu-toggle').setAttribute('aria-expanded', String(open)); $('menu-default').hidden = false; $('menu-confirm').hidden = true; });
  $('new-chat').addEventListener('click', () => { if (!records.length) reset(); else { $('menu-default').hidden = true; $('menu-confirm').hidden = false; $('cancel-reset').focus(); } });
  $('cancel-reset').addEventListener('click', () => { closeMenu(); $('menu-toggle').focus(); });
  $('confirm-reset').addEventListener('click', reset);
  $('contact-team').addEventListener('click', showContacts);
  $('contact-close').addEventListener('click', () => { $('contact-card').hidden = true; input.focus({ preventScroll: true }); });
  $('composer').addEventListener('submit', event => { event.preventDefault(); ask(input.value.trim()); });
  input.addEventListener('input', resizeInput);
  input.addEventListener('keydown', event => { if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) { event.preventDefault(); if (!busy) ask(input.value.trim()); } });
  root.querySelectorAll('.topic').forEach(b => b.addEventListener('click', () => showTopic(b.dataset.topic)));
  $('topic-back').addEventListener('click', () => { topicRoot(); $('topic-list').querySelector('button').focus({ preventScroll: true }); });
  $('open-topics').addEventListener('click', showTopics);
  $('topics-toggle').addEventListener('click', () => { if (!welcome.hidden && records.length) { hideTopics(); scroll(); } else showTopics(); });
  root.addEventListener('keydown', event => {
    if (event.key === 'Escape' && opened) { event.preventDefault(); if (!menu.hidden) { closeMenu(); $('menu-toggle').focus(); } else setOpen(false); }
    if (event.key === 'Tab' && opened && mobile()) {
      const focusable = [...panel.querySelectorAll('button:not(:disabled), a[href], textarea')].filter(el => el.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1), active = root.activeElement;
      if (event.shiftKey && active === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
    }
  });
  root.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !$('menu-toggle').contains(event.target)) closeMenu(); });
  window.addEventListener('resize', viewport);
  if (window.visualViewport) { window.visualViewport.addEventListener('resize', viewport); window.visualViewport.addEventListener('scroll', viewport); }
  try {
    const saved = JSON.parse(sessionStorage.getItem(cacheKey));
    if (saved && Date.now() - saved.saved < 2 * 60 * 60 * 1000 && Array.isArray(saved.records) && Array.isArray(saved.history)) {
      if (validId(saved.sessionId)) sessionId = saved.sessionId;
      if (Number.isSafeInteger(saved.turn) && saved.turn >= 0 && saved.turn <= 100000) turn = saved.turn;
      history = saved.history.filter(m => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string').slice(-20);
      records = saved.records.filter(m => ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').slice(-40);
      let lastRequest = '';
      records.forEach(m => {
        if (m.role === 'user') lastRequest = m.text;
        addMessage(m.text, m.role, m.time, false, m.supportContext || lastRequest);
      });
    }
  } catch (_) { /* The chat also works without session storage. */ }
  const mount = () => { document.body.append(host); viewport(); if (autoOpen) setOpen(true); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true }); else mount();
})();
