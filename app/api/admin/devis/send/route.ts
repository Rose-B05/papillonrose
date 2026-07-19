import { NextRequest, NextResponse } from "next/server"
import { getDevis } from "@/lib/devis/db"
import { generateDevisPdf } from "@/lib/devis/db"
import { COOKIE_NAME } from "@/lib/auth"
import { logActivity } from "@/lib/db"
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

// POST — send devis email to client
export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const all = await getDevis()
    const devis = all.find((d) => d.id === id)
    if (!devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    }

    // Generate PDF
    const pdfBuffer = await generateDevisPdf(devis)

    // Send email with PDF attachment
    const transport = getTransport()
    await transport.sendMail({
      from: `"Papillon Rose" <${FROM}>`,
      to: devis.client.email,
      subject: `Votre devis ${devis.quoteNumber} — Papillon Rose`,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
        <h2 style="color:#C9948E">Votre devis personnalisé</h2>
        <p>Bonjour ${devis.client.prenom},</p>
        <p>Veuillez trouver ci-joint votre devis <strong>${devis.quoteNumber}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border-bottom:1px solid #eee">Date de l&apos;événement</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${new Date(devis.dateDebut).toLocaleDateString("fr-FR")} — ${new Date(devis.dateFin).toLocaleDateString("fr-FR")}</td></tr>
          <tr><td style="padding:8px;border-bottom:1px solid #eee;font-weight:700">Total TTC</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#C9948E">${devis.totalTtc.toFixed(2)} €</td></tr>
        </table>
        <p>Ce devis est valable <strong>30 jours</strong>.</p>
        <p>Si vous souhaitez confirmer votre réservation, répondrez à cet email ou contactez-nous à <a href="mailto:papillonrosebertha@gmail.com">papillonrosebertha@gmail.com</a>.</p>
        <p style="margin-top:24px;color:#888;font-size:12px">Papillon Rose — Location décoration événements</p>
      </div>`,
      attachments: [
        {
          filename: `devis-${devis.quoteNumber}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: "application/pdf",
        },
      ],
    })

    // Update status to "envoye" if currently en_attente or en_preparation
    if (devis.statut === "en_attente" || devis.statut === "en_preparation") {
      devis.statut = "envoye"
      devis.envoyeLe = new Date().toISOString()
      const { saveDevis } = await import("@/lib/devis/db")
      await saveDevis(devis)
    }

    await logActivity({ type: "devis_sent", description: `Devis ${devis.quoteNumber} envoyé à ${devis.client.email}`, reference: devis.id })
    return NextResponse.json({ ok: true, message: "Devis envoyé" })
  } catch (err) {
    console.error("Error sending devis:", err)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
