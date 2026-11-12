# Aria: correzioni di precisione

I dati di catalogo prima comparivano sia nel prompt sia nelle risposte Wix; inoltre descrizioni e sezioni erano tagliate a 500 e 400 caratteri. Le istruzioni includevano eccezioni incoerenti alla regola di non fare domande. Una scheda corretta poteva quindi essere interpretata usando dati incompleti o un vecchio listino.

## Comportamento risultante

- I due endpoint importano le stesse istruzioni da `lib/knowledge.js`.
- Il listino, le misure e la tabella allergeni statici sono sostituiti dalla scheda Wix del prodotto esatto. Le procedure aziendali di personalizzazione e assistenza restano nel prompt.
- Un dato mancante viene richiesto con un invito affermativo coerente con lo stile già scelto per Aria.
- Prezzo sconosciuto e stock sconosciuto restano `null`; un prodotto trovato non equivale a un prodotto disponibile. Gli sconti non vengono applicati due volte.
- La ricerca Catalog V1 usa l'endpoint e il filtro stringa documentati, anziché il campo `freeText` non previsto dal contratto.
- Descrizione, ingredienti, allergeni e tutte le sezioni sono conservati integralmente. Si restituiscono fino a 10 prodotti ordinati per pertinenza, segnalando le ricerche parziali.
- Il senza glutine richiede una dichiarazione esplicita nella scheda della variante esatta.

## Verifica

Eseguire `npm test`. I test non richiedono chiavi né fanno richieste esterne. Coprono filtri Wix, dettagli oltre i vecchi limiti, sezioni con titoli ripetuti, dati mancanti, stock falso, errori HTTP e il passaggio dei risultati attraverso entrambi gli endpoint.

I test del codice non misurano la qualità delle risposte del modello. È stato preparato un campione privato di 50 domande reali dalla tabella Airtable `Sessioni Aria`, con risposte originali, riferimenti ai record e criteri proposti. Il confronto dei modelli sui 50 casi resta da eseguire. Le risposte storiche non sono state trattate come soluzioni corrette.

La lettura dello storico ha motivato due chiarimenti aggiuntivi: non compilare campi obbligatori con valori casuali se un selettore non funziona e non generare recapiti di assistenza diversi da quelli autorizzati.

Il filtro è stato verificato anche sul catalogo reale di Crispo Home, in sola lettura: `kit cremini` ha restituito 6 prodotti e `Snob` 53 corrispondenze totali (50 nella prima pagina). Le schede reali includono sezioni lunghe fino a 1.320 caratteri e ingredienti di 856 caratteri: il vecchio limite di 400 eliminava quindi informazioni presenti sul sito.

Le chat dei clienti e le risposte storiche non vanno inserite nel repository pubblico. Conservare i dati di valutazione in un archivio privato, mantenendo provenienza, testo originale e risposta attesa separata dalla risposta storica di Aria. Le risposte storiche possono essere errate e non sono automaticamente una soluzione corretta. Il campo `Sessione` esistente contiene una data: da solo non identifica una conversazione individuale.

Il modello resta quello esistente. La migrazione a OpenAI e le misure di latenza e costo richiedono una verifica separata. Le credenziali Wix attuali sono configurate su Vercel per Production: una Preview richiede una configurazione Wix appropriata prima di una prova dal vivo.

## Riferimenti API

- https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/query-products
- https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/filter-and-sort
