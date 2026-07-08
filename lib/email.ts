import nodemailer from "nodemailer"

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as nodemailer.TransportOptions)
}

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const TO = process.env.CONTACT_EMAIL || "papillonrosebertha@gmail.com"

export async function sendQuoteConfirmation(to: string, quoteNumber: string, recapHtml: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Votre demande de devis n°${quoteNumber} - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Demande de devis reçue</h2>
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre demande de devis <strong>n°${quoteNumber}</strong>.</p>
      ${recapHtml}
      <p>Vous recevrez votre devis personnalisé sous <strong>48h ouvrées</strong>.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })
}

export async function sendAdminQuoteNotification(quoteNumber: string, clientName: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: TO,
    subject: `Nouvelle demande de devis n°${quoteNumber} - ${clientName}`,
    text: `Nouvelle demande de devis n°${quoteNumber} de ${clientName}. Connectez-vous pour la consulter.`,
  })
}

export async function sendQuoteStockConfirmed(to: string, quoteNumber: string, recapHtml: string, depositAmount: number) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Devis n°${quoteNumber} — Stock confirmé ✓ - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Stock confirmé</h2>
      <p>Bonjour,</p>
      <p>Bonne nouvelle : le stock pour votre demande de devis <strong>n°${quoteNumber}</strong> est entièrement disponible pour les dates demandées.</p>
      ${recapHtml}
      <p><strong>Acompte à verser :</strong> ${depositAmount.toFixed(2)} € (30%)</p>
      <p>Pour confirmer votre réservation, veuillez vous acquitter de l'acompte via le lien de paiement qui vous sera envoyé prochainement, ou contactez-nous à <a href="mailto:papillonrosebertha@gmail.com">papillonrosebertha@gmail.com</a>.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })
}

export async function sendQuoteStockRefused(to: string, quoteNumber: string, unavailableProducts: string[]) {
  const transport = getTransport()
  const productList = unavailableProducts.map((p) => `<li>${p}</li>`).join("")

  // Email au client
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Devis n°${quoteNumber} — Indisponibilité de stock - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Indisponibilité de stock</h2>
      <p>Bonjour,</p>
      <p>Nous avons le regret de vous informer que certains articles de votre demande de devis <strong>n°${quoteNumber}</strong> ne sont pas disponibles pour les dates demandées :</p>
      <ul style="background:#fef2f2;padding:12px 20px;border-radius:8px;color:#b91c1c">${productList}</ul>
      <p>Nous vous invitons à nous contacter pour étudier des dates alternatives ou des articles de remplacement.</p>
      <p>Email : <a href="mailto:papillonrosebertha@gmail.com">papillonrosebertha@gmail.com</a></p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })

  // Copie admin
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: TO,
    subject: `⚠️ Devis n°${quoteNumber} — Stock refusé`,
    text: `Devis n°${quoteNumber} refusé. Articles indisponibles : ${unavailableProducts.join(", ")}. Client : ${to}`,
  })
}

export async function sendPaymentConfirmation(to: string, bookingId: string, recapHtml: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Confirmation de votre réservation n°${bookingId} - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Réservation confirmée</h2>
      <p>Votre acompte a bien été reçu.</p>
      ${recapHtml}
      <p>Le solde restant (70%) vous sera rappelé 7 jours avant votre événement.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })
}

export async function sendAdminBookingNotification(bookingId: string, clientName: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: TO,
    subject: `Nouvelle réservation confirmée n°${bookingId} - ${clientName}`,
    text: `Réservation n°${bookingId} confirmée par ${clientName}. Les dates sont maintenant bloquées.`,
  })
}

export async function sendQuoteBalancePaid(to: string, quoteNumber: string, totalTtc: number) {
  const transport = getTransport()
  const deposit = Math.round(totalTtc * 0.3 * 100) / 100
  const balance = Math.round(totalTtc * 0.7 * 100) / 100

  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Devis n°${quoteNumber} — Solde payé ✓ - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Paiement confirmé</h2>
      <p>Bonjour,</p>
      <p>Nous avons bien reçu le règlement du solde pour votre devis <strong>n°${quoteNumber}</strong>.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px;border-bottom:1px solid #eee">Total TTC</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${totalTtc.toFixed(2)} €</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee">Acompte (30%)</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${deposit.toFixed(2)} €</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee">Solde (70%)</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${balance.toFixed(2)} €</td></tr>
        <tr><td style="padding:8px;font-weight:700">Montant réglé</td><td style="padding:8px;text-align:right;font-weight:700;color:#C8A97E">${totalTtc.toFixed(2)} €</td></tr>
      </table>
      <p>Votre réservation est maintenant <strong>entièrement soldée</p>
      <p>Pour toute question, contactez-nous à <a href="mailto:papillonrosebertha@gmail.com">papillonrosebertha@gmail.com</a>.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })

  // Notification admin
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: TO,
    subject: `💰 Devis n°${quoteNumber} — Solde payé`,
    text: `Le solde du devis n°${quoteNumber} a été réglé (${totalTtc.toFixed(2)} € TTC). Réservation entièrement soldée.`,
  })
}

export async function sendBalancePaymentLink(to: string, quoteNumber: string, paymentUrl: string, amount: number) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Devis n°${quoteNumber} — Lien de paiement du solde - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Paiement du solde</h2>
      <p>Bonjour,</p>
      <p>Votre acompte pour le devis <strong>n°${quoteNumber}</strong> a bien été reçu. Il ne reste plus qu'à régler le solde.</p>
      <p><strong>Montant du solde :</strong> ${amount.toFixed(2)} € TTC</p>
      <p>Pour régler, cliquez sur le bouton ci-dessous :</p>
      <p style="text-align:center;margin:24px 0">
        <a href="${paymentUrl}" style="background:#C8A97E;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Payer le solde — ${amount.toFixed(2)} €</a>
      </p>
      <p style="color:#888;font-size:12px">Ce lien est valable 24h. En cas de problème, contactez-nous à <a href="mailto:papillonrosebertha@gmail.com">papillonrosebertha@gmail.com</a>.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })
}

export async function sendChatbotLead(data: {
  nom: string
  prenom: string
  email: string
  telephone: string
  typeEvenement: string
  dateEvenement: string
  nbInvites: string
  budget: string
  lieu: string
  notes: string
}) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose Chat" <${FROM}>`,
    to: TO,
    subject: `💬 Nouveau lead chatbot - ${data.prenom} ${data.nom}`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px">
      <h2 style="color:#C8A97E">Nouveau lead depuis le chatbot</h2>
      <table style="width:100%;border-collapse:collapse;margin-top:16px">
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Prénom</td><td style="padding:8px;border-bottom:1px solid #eee">${data.prenom}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Nom</td><td style="padding:8px;border-bottom:1px solid #eee">${data.nom}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Email</td><td style="padding:8px;border-bottom:1px solid #eee">${data.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Téléphone</td><td style="padding:8px;border-bottom:1px solid #eee">${data.telephone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Type d'événement</td><td style="padding:8px;border-bottom:1px solid #eee">${data.typeEvenement}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Date</td><td style="padding:8px;border-bottom:1px solid #eee">${data.dateEvenement}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Nombre d'invités</td><td style="padding:8px;border-bottom:1px solid #eee">${data.nbInvites}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Budget</td><td style="padding:8px;border-bottom:1px solid #eee">${data.budget}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">Lieu</td><td style="padding:8px;border-bottom:1px solid #eee">${data.lieu}</td></tr>
      </table>
      <h3 style="margin-top:20px;color:#2E2E2E">Notes</h3>
      <p style="background:#f8f5f0;padding:12px;border-radius:8px">${data.notes || "—"}</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
    </div>`,
  })
}
