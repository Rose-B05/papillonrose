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
