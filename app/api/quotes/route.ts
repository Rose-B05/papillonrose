import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { saveQuote, getBooking } from "@/lib/db"
import { getAvailableStock } from "@/lib/stock"
import { calcTotalHt, calcTtc, formatDateFr } from "@/lib/utils"
import { calcDeliveryFee } from "@/lib/delivery"
import { sendQuoteConfirmation, sendAdminQuoteNotification, sendQuoteStockConfirmed, sendQuoteStockRefused } from "@/lib/email"
import { CUSTOMER_COOKIE } from "@/lib/customer-auth"
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
      const booking = await getBooking(bookingId)
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

    // Calcul des frais de livraison si applicable
    let deliveryFee = 0
    let deliveryInfo = ""
    if (client?.besoinLivraison && client?.codePostalLivraison) {
      const deliveryResult = calcDeliveryFee(client.codePostalLivraison)
      if (deliveryResult.allowed && deliveryResult.distanceKm) {
        deliveryFee = deliveryResult.totalFee
        deliveryInfo = `Livraison : ${deliveryResult.baseFee.toFixed(2)}€ + ${deliveryResult.distanceKm} km × 1,50€ = ${deliveryResult.totalFee.toFixed(2)}€`
      }
    }

    const totalTtcWithDelivery = Math.round((totalTtc + deliveryFee) * 100) / 100

    const quoteNumber = `DEV-${uuidv4().slice(0, 6).toUpperCase()}`

    // Associer le devis au compte client si connecté
    const customerSession = request.cookies.get(CUSTOMER_COOKIE)
    const customerEmail = customerSession?.value || undefined

    const quoteRequest: QuoteRequest = {
      id: uuidv4(),
      bookingId,
      client,
      customerEmail,
      items,
      totalHt,
      totalTtc: totalTtcWithDelivery,
      statut: "recu",
      quoteNumber,
      createdAt: new Date().toISOString(),
    }

    await saveQuote(quoteRequest)

    // Vérification du stock pour chaque article
    const unavailableItems: string[] = []
    for (const item of items) {
      const available = await getAvailableStock(item.productId, item.dateStart, item.dateEnd)
      if (available < item.qty) {
        const product = produits.find((p) => p.id === item.productId)
        unavailableItems.push(`${product?.nom || "Article"} (${item.qty} demandé(s), ${available} disponible(s))`)
      }
    }

    const allAvailable = unavailableItems.length === 0
    const newStatut = allAvailable ? "confirme_stock" : "refuse_stock"

    // Mettre à jour le statut du devis
    quoteRequest.statut = newStatut
    await saveQuote(quoteRequest)

    // Calculer le montant de l'acompte (30%)
    const depositAmount = Math.round(totalTtcWithDelivery * 0.3 * 100) / 100

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
      <p><strong>Total location :</strong> ${totalTtc.toFixed(2)} € TTC</p>
      ${deliveryFee > 0 ? `<p><strong>Livraison :</strong> ${deliveryInfo}</p>` : ""}
      ${deliveryFee > 0 ? `<p><strong>Total avec livraison :</strong> ${totalTtcWithDelivery.toFixed(2)} € TTC</p>` : ""}
      <p><strong>Événement :</strong> ${client.typeEvenement} — ${formatDateFr(client.dateEvenement)}</p>
      <p><strong>Lieu :</strong> ${client.lieuEvenement} — ${client.nbInvites} invités</p>
      <p><strong>Livraison :</strong> ${client.besoinLivraison ? "Oui" : "Non"}</p>
    `

    try {
      if (allAvailable) {
        await sendQuoteStockConfirmed(client.email, quoteNumber, recapHtml, depositAmount)
      } else {
        await sendQuoteStockRefused(client.email, quoteNumber, unavailableItems)
      }
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr)
    }

    return NextResponse.json({
      success: true,
      quoteNumber,
      message: "Votre demande de devis a été envoyée. Vous recevrez une réponse sous 24h ouvrées.",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
