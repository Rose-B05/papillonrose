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

const FROM = process.env.SMTP_FROM || "contact@papillonrose.fr"
const TO = process.env.CONTACT_EMAIL || "contact@papillonrose.fr"

export async function sendQuoteConfirmation(to: string, quoteNumber: string, recapHtml: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Votre demande de devis nÂ°${quoteNumber} - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">Demande de devis reÃ§ue</h2>
      <p>Bonjour,</p>
      <p>Nous avons bien reÃ§u votre demande de devis <strong>nÂ°${quoteNumber}</strong>.</p>
      ${recapHtml}
      <p>Vous recevrez votre devis personnalisÃ© sous <strong>48h ouvrÃ©es</strong>.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose â€” Location dÃ©coration Ã©vÃ©nements</p>
    </div>`,
  })
}

export async function sendAdminQuoteNotification(quoteNumber: string, clientName: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: TO,
    subject: `Nouvelle demande de devis nÂ°${quoteNumber} - ${clientName}`,
    text: `Nouvelle demande de devis nÂ°${quoteNumber} de ${clientName}. Connectez-vous pour la consulter.`,
  })
}

export async function sendPaymentConfirmation(to: string, bookingId: string, recapHtml: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to,
    subject: `Confirmation de votre rÃ©servation nÂ°${bookingId} - Papillon Rose`,
    html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
      <h2 style="color:#C8A97E">RÃ©servation confirmÃ©e</h2>
      <p>Votre acompte a bien Ã©tÃ© reÃ§u.</p>
      ${recapHtml}
      <p>Le solde restant (70%) vous sera rappelÃ© 7 jours avant votre Ã©vÃ©nement.</p>
      <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose â€” Location dÃ©coration Ã©vÃ©nements</p>
    </div>`,
  })
}

export async function sendAdminBookingNotification(bookingId: string, clientName: string) {
  const transport = getTransport()
  await transport.sendMail({
    from: `"Papillon Rose" <${FROM}>`,
    to: TO,
    subject: `Nouvelle rÃ©servation confirmÃ©e nÂ°${bookingId} - ${clientName}`,
    text: `RÃ©servation nÂ°${bookingId} confirmÃ©e par ${clientName}. Les dates sont maintenant bloquÃ©es.`,
  })
}

