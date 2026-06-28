import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { saveQuote, getBooking } from "@/lib/db"
import { calcTotalHt, calcTtc, formatDateFr } from "@/lib/utils"
import { sendQuoteConfirmation, sendAdminQuoteNotification } from "@/lib/email"
import type { QuoteRequest, ClientInfo, CartItem } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client, bookingId } = body as { client: ClientInfo; bookingId?: string }

    if (!client?.nom || !client?.email) {
      return NextResponse.json({ error: "Nom et email requis" }, { status: 400 })
    }

    let items: CartItem[] = []
    if (bookingId) {
      const booking = getBooking(bookingId)
      if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
      items = booking.items
    } else {
      return NextResponse.json({ error: "ID de réservation requis" }, { status: 400 })
    }

    const itemsWithPrix = items.map((i) => {
      const p = produits.find((prod) => prod.id === i.productId)!
      return { ...i, prix: p?.prix || 0 }
    })

    const totalHt = calcTotalHt(itemsWithPrix)
    const totalTtc = calcTtc(totalHt)

    const quoteNumber = `DEV-${uuidv4().slice(0, 6).toUpperCase()}`

    const quoteRequest: QuoteRequest = {
      id: uuidv4(),
      bookingId,
      client,
      items,
      totalHt,
      status: "received",
      quoteNumber,
      createdAt: new Date().toISOString(),
    }

    saveQuote(quoteRequest)

    // Build recap HTML
    const itemsHtml = items
      .map((i) => {
        const p = produits.find((prod) => prod.id === i.productId)
        return `<tr><td style="padding:8px;border-bottom:1px solid #eee">${p?.nom || "Article"}</td><td style="padding:8px;border-bottom:1px solid #eee">${i.qty}</td><td style="padding:8px;border-bottom:1px solid #eee">${formatDateFr(i.dateStart)} - ${formatDateFr(i.dateEnd)}</td></tr>`
      })
      .join("")

    const recapHtml = `
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><th style="text-align:left;padding:8px;border-bottom:2px solid #C8A97E">Article</th><th style="text-align:left;padding:8px;border-bottom:2px solid #C8A97E">Qté</th><th style="text-align:left;padding:8px;border-bottom:2px solid #C8A97E">Dates</th></tr>
        ${itemsHtml}
      </table>
      <p><strong>Total estimé :</strong> ${totalTtc.toFixed(2)} € TTC</p>
      <p><strong>Événement :</strong> ${client.typeEvenement} — ${formatDateFr(client.dateEvenement)}</p>
      <p><strong>Lieu :</strong> ${client.lieuEvenement} — ${client.nbInvites} invités</p>
      <p><strong>Livraison :</strong> ${client.besoinLivraison ? "Oui" : "Non"}</p>
    `

    try {
      await sendQuoteConfirmation(client.email, quoteNumber, recapHtml)
      await sendAdminQuoteNotification(quoteNumber, `${client.prenom} ${client.nom}`)
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr)
    }

    return NextResponse.json({
      success: true,
      quoteNumber,
      message: "Votre demande de devis a été envoyée. Vous recevrez une réponse sous 48h ouvrées.",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
