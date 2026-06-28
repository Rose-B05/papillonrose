import { NextRequest, NextResponse } from "next/server"
import { getBooking, saveBooking, getPaymentByBookingId, savePayment } from "@/lib/db"
import { retrievePaymentIntent } from "@/lib/stripe"
import { sendPaymentConfirmation, sendAdminBookingNotification } from "@/lib/email"
import { formatDateFr, calcTotalHt, calcTtc } from "@/lib/utils"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import type { PaymentRecord } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, paymentIntentId } = body

    if (!bookingId || !paymentIntentId) {
      return NextResponse.json({ error: "bookingId et paymentIntentId requis" }, { status: 400 })
    }

    const booking = getBooking(bookingId)
    if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })

    const paymentIntent = await retrievePaymentIntent(paymentIntentId)
    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json({ error: "Paiement non confirmé" }, { status: 400 })
    }

    const existingPayment = getPaymentByBookingId(bookingId)

    const payment: PaymentRecord = {
      id: existingPayment?.id || uuidv4(),
      bookingId,
      amount: paymentIntent.amount / 100,
      stripePaymentIntentId: paymentIntentId,
      status: "succeeded",
      createdAt: existingPayment?.createdAt || new Date().toISOString(),
    }

    savePayment(payment)

    booking.status = "confirmed"
    booking.depositPaidAt = new Date().toISOString()
    saveBooking(booking)

    // Send confirmations
    try {
      const itemsHtml = booking.items
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
        <p><strong>Réservation n°${bookingId}</strong></p>
        <p><strong>Acompte payé :</strong> ${payment.amount.toFixed(2)} €</p>
        <p><strong>Statut :</strong> Confirmée</p>
      `

      await sendPaymentConfirmation(booking.client?.email || "", bookingId, recapHtml)
      await sendAdminBookingNotification(bookingId, `${booking.client?.prenom || ""} ${booking.client?.nom || ""}`)
    } catch (err) {
      console.error("Email notification failed:", err)
    }

    return NextResponse.json({
      success: true,
      bookingId,
      message: "Paiement confirmé. Votre réservation est validée.",
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
