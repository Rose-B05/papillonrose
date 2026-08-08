import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getEmailLog, getBooking, saveEmailLog } from "@/lib/db"
import { getTransport, sendMailWithRetry } from "@/lib/order-confirmation"
import { produits } from "@/data/produits"
import { formatPrix, formatDateFr } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"

export const runtime = "nodejs"

function parsePrix(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = String(prix).match(/[\d.]+/)
  return m ? parseFloat(m[0]) : 0
}

function buildResendHtml(booking: any, SITE_URL: string): string {
  const prenom = booking.client?.prenom || ""
  const rows = booking.items
    .map((item: any) => {
      const product = produits.find((p: any) => p.id === item.productId)
      const nom = product?.nom || `Produit #${item.productId}`
      const days =
        item.dateStart && item.dateEnd
          ? Math.max(1, Math.ceil((new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()) / (1000 * 60 * 60 * 24)))
          : 1
      const lineTotal = Math.round(parsePrix(product?.prix || 0) * item.qty * days * 1.2 * 100) / 100
      const period = item.dateStart && item.dateEnd
        ? `${formatDateFr(item.dateStart)} → ${formatDateFr(item.dateEnd)}`
        : "Non défini"
      return `<tr>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-weight:600">${nom}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">${item.qty}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px">${period}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;color:#c27a72;font-weight:700">${formatPrix(lineTotal)} €</td>
      </tr>`
    })
    .join("")

  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:650px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c27a72">
    <h1 style="color:#c27a72;font-size:24px;margin:0"><img src="https://www.papillonrose.fr/papillon-rose-logo.png" alt="Papillon Rose" height="40" style="vertical-align:middle"></h1>
    <p style="color:#544f4f;font-size:12px;margin:4px 0 0">Location mobilier &amp; décoration événements</p>
  </div>
  <div style="background:#fdf8f0;border-radius:12px;padding:24px;margin:20px 0;text-align:center">
    <h2 style="color:#2E2E2E;font-size:20px;margin:0 0 8px">${prenom ? `Merci ${prenom} !` : "Merci pour votre commande !"}</h2>
    <p style="color:#c27a72;font-size:14px;margin:0">Réservation #${booking.id}</p>
    <p style="color:#544f4f;font-size:12px;margin:4px 0 0">Reçue le ${formatDateFr(new Date().toISOString())}</p>
  </div>
  <h3 style="color:#2E2E2E;font-size:16px;margin:20px 0 8px">🛒 Vos articles réservés</h3>
  <table style="width:100%;border-collapse:collapse;background:#f8f5f0;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#2E2E2E;color:white">
        <th style="padding:10px 12px;text-align:left">Produit</th>
        <th style="padding:10px 12px;text-align:center">Qté</th>
        <th style="padding:10px 12px;text-align:left">Période</th>
        <th style="padding:10px 12px;text-align:right">Sous-total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="background:#2E2E2E;border-radius:12px;padding:20px;margin:20px 0;color:white">
    <div style="display:flex;justify-content:space-between;margin-bottom:8px">
      <span style="opacity:0.7">Total TTC</span>
      <span style="font-weight:700;font-size:18px;color:#c27a72">${formatPrix(booking.totalTtc)} €</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1)">
      <span style="opacity:0.7">Acompte à verser (30%)</span>
      <span style="font-weight:700;color:#c27a72">${formatPrix(booking.depositAmount)} €</span>
    </div>
  </div>
  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#544f4f;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#c27a72;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ logId: string }> }
) {
  const session = _request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { logId } = await params

  const log = await getEmailLog(logId)
  if (!log) {
    return NextResponse.json({ error: "Log introuvable" }, { status: 404 })
  }

  if (!log.bookingId) {
    return NextResponse.json({ error: "Ce log n'est pas associé à une réservation" }, { status: 400 })
  }

  const booking = await getBooking(log.bookingId)
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  }

  const transport = getTransport()
  const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
  const TO_ADMIN = process.env.CONTACT_EMAIL || "papillonrosebertha@gmail.com"
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"
  const now = new Date()

  const isAdmin = log.type.includes("_admin")
  const to = isAdmin ? TO_ADMIN : booking.client?.email

  if (!to) {
    return NextResponse.json({ error: "Destinataire introuvable" }, { status: 400 })
  }

  const prenom = booking.client?.prenom || ""
  const subject = isAdmin
    ? `Nouvelle réservation #${booking.id} — ${prenom}`
    : prenom
      ? `${prenom}, votre réservation Papillon Rose #${booking.id} est enregistrée ✓`
      : `Réservation Papillon Rose #${booking.id} enregistrée ✓`

  const result = await sendMailWithRetry(transport, {
    from: `"Papillon Rose" <${FROM}>`,
    to,
    replyTo: booking.client?.email || FROM,
    subject,
    html: buildResendHtml(booking, SITE_URL),
  })

  const newLog = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    to,
    type: log.type,
    subject,
    status: (result.ok ? "sent" : "failed") as "sent" | "failed",
    bookingId: booking.id,
    error: result.error,
    sentAt: now.toISOString(),
  }

  await saveEmailLog(newLog)

  return NextResponse.json({
    ok: result.ok,
    message: result.ok ? "Email renvoyé avec succès" : "Échec du renvoi après 3 tentatives",
    log: newLog,
  })
}
