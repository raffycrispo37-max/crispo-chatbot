module.exports = async function handler(req, res) {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const sessionDate = yesterday.toISOString().split("T")[0];
    const dateLabel = yesterday.toLocaleDateString("it-IT", { timeZone: "Europe/Rome" });

    // Fetch records from Airtable
    const url = `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Sessioni%20Aria?filterByFormula={Sessione}="${sessionDate}"&pageSize=100`;
    const airtableRes = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}` },
    });
    const data = await airtableRes.json();
    const records = data.records || [];

    if (records.length === 0) {
      return res.status(200).json({ message: "Nessuna conversazione ieri." });
    }

    // Build email HTML
    let rows = "";
    records.forEach((r, i) => {
      rows += `
        <div style="margin-bottom:24px;padding:14px;border-left:4px solid #D4AF37;background:#fffdf0;border-radius:4px">
          <p style="margin:0 0 6px;color:#888;font-size:12px">${r.fields["Nome"] || ""}</p>
          <p style="margin:0 0 8px"><strong>👤 Cliente:</strong> ${r.fields["Messaggio Cliente"] || ""}</p>
          <p style="margin:0"><strong>🤖 Aria:</strong> ${r.fields["Risposta Aria"] || ""}</p>
        </div>`;
    });

    const html = `
      <div style="font-family:sans-serif;max-width:640px;margin:auto">
        <div style="background:linear-gradient(135deg,#D4AF37,#B8860B);padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0;color:#fff">📊 Report Aria — ${dateLabel}</h2>
          <p style="margin:6px 0 0;color:rgba(255,255,255,.85)">${records.length} conversazioni ricevute</p>
        </div>
        <div style="padding:20px;border:1px solid #f0e6b0;border-top:none;border-radius:0 0 8px 8px">
          ${rows}
        </div>
      </div>`;

    // Send email via Resend
    const emailRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Aria Report <onboarding@resend.dev>",
        to: "raffycrispo37@gmail.com",
        subject: `Report Aria ${dateLabel} — ${records.length} conversazioni`,
        html,
      }),
    });

    const emailData = await emailRes.json();
    return res.status(200).json({ sent: true, count: records.length, email: emailData });
  } catch (error) {
    console.error("Daily report error:", error);
    return res.status(500).json({ error: error.message });
  }
};
