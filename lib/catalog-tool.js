// The input schema is also reusable by the Sol function-calling adapter.
const PRODUCT_TOOL = {
  name: 'cerca_prodotto',
  description: 'Legge prodotti Wix aggiornati con descrizioni e sezioni complete, prezzi, stock, opzioni, varianti, campi di personalizzazione e riferimenti alle immagini. Cerca prima per nome o SKU; per una scheda esatta usa product_id restituito da una ricerca. Se conosci le scelte della variante passale in choices usando i nomi delle opzioni restituiti. Non confondere prezzo/stock generali con quelli di una variante. Ricerca parziale o vuota non significa prodotto inesistente. Le immagini sono URL, non immagini già analizzate. Se ci sono conflitti negli allergeni non confermare l’idoneità. Le regole aziendali approvate prevalgono sulle vecchie procedure commerciali presenti nelle descrizioni; non reinterpretare così gli ingredienti.',
  input_schema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Nome, SKU o parole chiave. Può essere vuoto quando si usa product_id.' },
      product_id: { type: 'string', description: 'ID prodotto Wix già restituito dalla ricerca, per leggerne la scheda esatta.' },
      choices: { type: 'object', additionalProperties: { type: 'string' }, description: 'Opzioni selezionate, ad esempio {"Colore":"Rosa"}. Usa le chiavi e i valori presenti nella scheda.' },
      panoramica_confetti: { type: 'boolean', description: 'Imposta true per cercare tutte le linee, modelli o colori nella sezione Confetti, anche quando sono schede separate. Usa query vuota: restituisce la panoramica paginata della sola collezione Confetti, non le schede dettagliate. Poi rileggi un articolo per product_id quando servono informazioni specifiche. Non usare per le sole indicazioni del menu o per i confetti standard inclusi nei personalizzati.' },
    },
    required: ['query'],
  },
};
module.exports = { PRODUCT_TOOL };
