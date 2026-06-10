module.exports = async function handler(req, res) {
  const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/tblIQCSEMsKupzTzr`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        Data: "Test " + new Date().toISOString(),
        "Messaggio Cliente": "Messaggio di prova",
        "Risposta Aria": "Risposta di prova",
        Sessione: new Date().toISOString().split("T")[0],
      },
    }),
  });
  const data = await response.json();
  return res.status(200).json({ status: response.status, airtable: data });
};
