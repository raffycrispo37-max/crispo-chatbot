# Lettura catalogo Aria — 13 novembre 2026

Il lettore conserva descrizioni e sezioni complete, restituisce ID, URL, opzioni, campi di personalizzazione, varianti, prezzi, disponibilità e riferimenti alle immagini. I campi costo e margine non vengono esposti. I prodotti e le varianti nascoste sono esclusi.

La disponibilità parziale rimane distinta da disponibile/esaurito. La lettura per ID e scelte permette di tenere prezzo e stock associati alla variante. Il tool è condiviso dai due endpoint; la sua definizione è riutilizzabile dal futuro adattatore Sol, che non è implementato in questa modifica.

La ricerca utilizza filtri V1 documentati, pagine da50 e un massimo di3 pagine per richiesta; restituisce fino a10 corrispondenze e segnala esplicitamente le ricerche parziali. Non è una ricerca semantica completa: riconosce alcune grafie comuni (Choko Passion/CiocoPassion e Cioco Soft/CiocoSoft) e usa un tentativo normalizzato. Zero risultati non prova che un articolo non esista.

Validazione:16 test offline superati con `npm test`, inclusi i due cicli di tool calling esistenti con modello simulato;12 scenari di sola lettura superati su Vercel staging contro Wix reale. Verificati testi/sezioni, opzioni, campi, varianti visibili e rilettura per ID. Nessuna chiamata a un modello reale in questa validazione; nessuna modifica al catalogo o rilascio in produzione.

Un audit separato ha paginato778 prodotti visibili in8 pagine, senza duplicati, fino al totale dichiarato da Wix. Tutti hanno descrizione e immagini;522 hanno una sezione ingredienti,235 una sezione con titolo allergeni,210 opzioni e221 campi di testo. La mancanza di una sezione dedicata non dimostra l’assenza del dato altrove. Nessun prodotto del catalogo attuale usa varianti gestite (`manageVariants`); prezzi/stock di varianti gestite sono verificati nei test con fixture, non su un caso reale del catalogo.

Segnalazioni euristiche da revisionare:8 schede con «senza glutine» in descrizione e possibili tracce di glutine negli ingredienti/allergeni;288 con riferimenti a10 giorni, spedizione in giornata/entro12 o spedizione lunedì–mercoledì da confrontare con le nuove regole aziendali. Non sono automaticamente288 schede errate. Il lettore segnala i conflitti senza riscrivere le fonti.

Altri limiti: immagini restituite come URL e testo alternativo, non analizzate visivamente; nessun motore di calcolo carrello/promozioni, ordine o spedizione; nessuna certificazione degli allergeni; nessuna garanzia di disponibilità dopo la lettura. Il nuovo prompt aziendale va collegato separatamente al chatbot Sol.

Sicurezza dei test live: endpoint temporaneo con chiave casuale, scadenza, risposte no-store, casi fissi e accesso read-only al catalogo. Credenziali Wix abilitate in Preview mantenendo Production; nessuna lettura o copia in chiaro delle credenziali.

Documentazione:
- https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/query-products
- https://dev.wix.com/docs/api-reference/business-solutions/stores/catalog-v1/catalog/filter-and-sort
