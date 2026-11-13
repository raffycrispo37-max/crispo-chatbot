# Aria: prima interfaccia Sol

13 novembre 2026. Bozza grafica separata dal widget pubblico esistente. Non sostituisce `public/aria-widget.js` e non modifica l’integrazione Wix.

## Interfaccia

- Palette ripresa dal sito Crispo Home: avorio `#f9f5ef`, oro `#c5a55a`, antracite `#2a2a2a`.
- Cormorant Garamond per i titoli, Raleway per il testo; font locali derivati dagli asset del sito, con licenze OFL incluse.
- Widget in Shadow DOM: lo stile non modifica il sito ospitante.
- Tre argomenti iniziali, testo libero, stato di risposta, riduzione e riapertura, copia della risposta, contatti facoltativi e nuova conversazione con conferma.
- Su schermi fino a480px la chat occupa il viewport; gestisce safe area e visual viewport. Il selettore nel foglio di anteprima mostra anche un formato stretto, senza sostituire una verifica su un dispositivo reale.
- Nessuna emoji, allegato o comando vocale fittizio, presenza umana dichiarata o inoltro automatico all’assistenza.

## Collegamento

Il widget chiama `/api/chat-sol` sull’origine da cui viene caricato il suo script. `data-endpoint` consente una configurazione esplicita; il backend Sol e le sue istruzioni restano nel pacchetto separato di Preview. Questo ramo contiene solo l’interfaccia e non pubblica i prompt o le regole aziendali nel repository.

`public/aria-preview.html` carica `aria-widget-sol.js` con `data-auto-open="true"` solo per la presentazione. Nell’integrazione futura sul sito omettere questa opzione: la chat si apre quando il cliente seleziona il pulsante.

La cronologia usa sessionStorage nella sola scheda, con validità di due ore, massimo20 messaggi di contesto e40 messaggi visualizzati. La nuova conversazione cancella la memoria locale. Non sono presenti accesso agli ordini, telemetria o invio di dati al team.

Le risposte sono inserite come nodi di testo; grassetto, elenchi e collegamenti hanno una formattazione limitata. HTML e schemi URL eseguibili non vengono interpretati. Un errore HTTP non aggiunge una falsa risposta al contesto; il nuovo tentativo non duplica il messaggio utente.

## Anteprima protetta

URL: https://project-7g4zm-11f0otk58-crispo-home.vercel.app/

Deployment: `dpl_98Vs1hzrTJ8vh6C5F2UvDpjqqLWL`, staging, READY. Pacchetto con il prompt0.20 e le45 regole approvate. La route resta disabilitata in produzione senza attivazione esplicita. Il dominio e lo script del sito pubblico non cambiano.

Le route statiche sono consentite esplicitamente per pagina, widget e font; `/lib/*` e gli altri percorsi non previsti ricevono404. Il prompt non è un asset dell’interfaccia.

La verifica automatica ha rifiutato la creazione di un link temporaneo di condivisione Vercel perché non esplicitamente autorizzata. Nessun link di bypass è stato creato per questa anteprima e la protezione non è stata disattivata. Il browser di verifica richiedeva l’accesso Vercel; il suo ambiente non raggiungeva il server locale e non ammetteva URL file. Non è stata completata la verifica visiva nel browser o una chiamata live dal nuovo front-end.

## Controlli eseguiti

23 test esistenti del catalogo/motore superati.9 controlli DOM locali aggiuntivi con risposte simulate superati: isolamento e stato iniziale, invio e cronologia, testo/HTML/link, errori e nuovo tentativo, riduzione e riapertura, reset confermato, invii concorrenti, ripristino della sessione e contatti.

I controlli DOM non misurano layout, resa dei font, tastiera su smartphone o qualità delle risposte Sol. Il cambiamento del prompt non ha ancora una nuova valutazione50+15. La verifica visiva sul browser autenticato e i messaggi live sono da completare prima del rilascio pubblico.

Per consentire una revisione immediata è stata prodotta anche un’anteprima HTML autonoma, `Aria_Anteprima_Chat.html`. Include solo grafica e risposte dimostrative, dichiarate nell’interfaccia; non contiene credenziali, prompt o collegamento al modello. Non è il widget da installare sul sito.


## Dimensioni approvate — aggiornamento13 novembre2026

Raffaele ha approvato i font e i colori e richiesto le misure della Aria già presente sul sito. Verifica effettuata direttamente sullo script pubblico https://project-7g4zm.vercel.app/aria-widget.js .

| Elemento | Desktop | Smartphone fino a480px |
|---|---|---|
| Pannello | Larghezza370px; destra24px; fondo98px | Larghezza e altezza del viewport |
| Altezza | Automatica, massimo viewport meno120px | Viewport visibile, con adattamento alla tastiera |
| Pulsante di apertura | Cerchio52×52px; destra24px; fondo24px | Cerchio40×40px; destra16px; fondo16px più safe area |
| Angoli del pannello | Raggio20px | Nessun raggio |

La pagina di anteprima non sovrascrive più la larghezza con430/400/350px. Il passaggio alla modalità smartphone avviene a480px anche nel codice che gestisce focus e scorrimento. L’altezza effettiva dipende dal contenuto della nuova interfaccia: lo script attuale non imposta un’altezza fissa da copiare. Font e palette approvati rimangono invariati.

Discussione successiva: Raffaele chiede un parere su una chat smartphone meno invasiva. Proposta: larghezza quasi piena e altezza circa85%, angoli arrotondati e chiusura evidente, con adattamento alla tastiera. È una proposta di design; questa revisione applica ancora le misure attuali del sito.


## Pulsante assistenza WhatsApp — 13 novembre2026

Su richiesta di Raffaele è stato aggiunto «Scrivi su WhatsApp» sotto le risposte che riportano il numero dell’assistenza3284482654 o il relativo link ufficiale. Il collegamento è sempre diretto a https://wa.me/393284482654 e non usa numeri eventualmente proposti dal modello. La sola menzione di WhatsApp per la bozza grafica non attiva il pulsante.

Il messaggio precompilato riprende la richiesta associata alla risposta, con un massimo di1000 caratteri. Il cliente apre la chat e decide se inviarlo. La chat non apre WhatsApp da sola e non invia messaggi. Il link resta associato alla richiesta originaria anche dopo ripristino della sessione; i contatti nel menu usano invece la richiesta più recente. Il canale è indicato come «Solo messaggi».

Il numero coincide con la configurazione del widget attuale e con il recapito già comunicato da Raffaele. Controlli DOM:12 superati, inclusi destinatario, codifica della bozza, condizioni di comparsa e ripristino. Sono controlli locali; WhatsApp non è stato aperto e nessun messaggio è stato inviato durante le prove.

Anteprima corrente: https://project-7g4zm-k22ioq65v-crispo-home.vercel.app/ . Deployment dpl_HWZr8wPHxTNqqhUcAaXBqkmGnUot, staging. L’anteprima resta protetta. Il file HTML autonomo aggiornato permette di vedere il pulsante scegliendo «Assistenza su un ordine» e usa risposte dimostrative.
