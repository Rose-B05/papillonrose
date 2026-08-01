import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { saveBooking, getBooking, blockDates } from "@/lib/db"
import { calcTotalHt, calcTtc, calcDeposit, DEPOSIT_RATE } from "@/lib/utils"
import { SEUIL_LIVRAISON } from "@/lib/pricing"
import { calcDeliveryFee } from "@/lib/delivery"
import { createPaymentIntent } from "@/lib/stripe"
import { getAvailableStock } from "@/lib/stock"
import { sendBookingConfirmation } from "@/lib/order-confirmation"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { COOKIE_NAME } from "@/lib/auth"
import { sanitizeError } from "@/lib/security"
import type { Booking, CartItem } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Require customer session
    const session = request.cookies.get(CUSTOMER_COOKIE)
    if (!session?.value) {
      return NextResponse.json({ error: "Vous devez être connecté pour envoyer une demande de devis" }, { status: 401 })
    }
    const customer = await getCustomer(session.value)
    if (!customer) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 })
    }

    const body = await request.json()
    const { items, client } = body as { items: CartItem[]; client?: any }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    if (items.length > 50) {
      return NextResponse.json({ error: "Panier trop volumineux (max 50 articles)" }, { status: 400 })
    }

    for (const item of items) {
      if (!item.productId || typeof item.productId !== "number") {
        return NextResponse.json({ error: "ID produit invalide" }, { status: 400 })
      }
      if (!item.qty || item.qty < 1 || item.qty > 100 || typeof item.qty !== "number") {
        return NextResponse.json({ error: "Quantité invalide" }, { status: 400 })
      }
      if (!item.dateStart || !item.dateEnd) {
        return NextResponse.json({ error: "Dates de location requises pour chaque article" }, { status: 400 })
      }
    }

    // Parallel stock check for all items
    const stockResults = await Promise.all(
      items.map(async (item) => {
        const product = produits.find((p) => p.id === item.productId)
        if (!product) return { error: `Produit ${item.productId} introuvable` }
        if (product.badge === "epuise") return { error: `${product.nom} n'est plus disponible` }
        if (item.dateStart && item.dateEnd) {
          const available = await getAvailableStock(item.productId, item.dateStart, item.dateEnd)
          if (available <= 0) return { error: `Aucune disponibilité pour ${product.nom} sur la période ${item.dateStart} → ${item.dateEnd}` }
          if (item.qty > available) return { error: `Stock insuffisant pour ${product.nom} : demandé ${item.qty}, disponible ${available}` }
        } else {
          if (product.stock < item.qty) return { error: `Stock insuffisant pour ${product.nom} : demandé ${item.qty}, stock maximum ${product.stock}` }
        }
        return { ok: true, item, product }
      })
    )

    const firstError = stockResults.find((r) => "error" in r)
    if (firstError) return NextResponse.json({ error: (firstError as any).error }, { status: 409 })

    const finalItems = stockResults.map((r) => (r as any).item)

    const itemsWithPrix = finalItems.map((item) => {
      const p = produits.find((pp) => pp.id === item.productId)!
      return { ...item, prix: p.prix }
    })

    const totalHt = calcTotalHt(itemsWithPrix)
    const totalTtc = calcTtc(totalHt)

    let deliveryFee = 0
    if (client?.besoinLivraison && client?.codePostalLivraison) {
      const deliveryResult = calcDeliveryFee(client.codePostalLivraison, totalTtc)
      if (deliveryResult.allowed) deliveryFee = deliveryResult.totalFee
    }

    const totalTtcWithDelivery = Math.round((totalTtc + deliveryFee) * 100) / 100
    const needsDeposit = totalTtcWithDelivery >= SEUIL_LIVRAISON
    const depositAmount = needsDeposit ? calcDeposit(totalTtcWithDelivery) : 0

    const booking: Booking = {
      id: uuidv4().slice(0, 8).toUpperCase(),
      items: finalItems,
      client: client || {} as any,
      customerEmail: customer.email,
      totalHt,
      totalTtc: totalTtcWithDelivery,
      depositAmount,
      status: needsDeposit ? "deposit-pending" : "pending-quote",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Payment intent only if deposit required (>= 50€)
    const paymentPromise = needsDeposit && client ? createPaymentIntent(depositAmount, booking.id) : null
    await saveBooking(booking)

    // Parallel: block dates for all items
    await Promise.all(
      finalItems.map((item) => {
        const dates = getDatesBetween(item.dateStart, item.dateEnd)
        return blockDates(item.productId, dates, booking.id)
      })
    )

    let paymentIntent = null
    if (paymentPromise) {
      paymentIntent = await paymentPromise
      booking.paymentIntentId = paymentIntent.id
      await saveBooking(booking)
    }

    // Email: fire-and-forget (don't block response)
    sendBookingConfirmation(booking).catch((err) =>
      console.error("Booking confirmation email error:", err)
    )

    return NextResponse.json({
      booking,
      paymentIntent: paymentIntent ? { clientSecret: paymentIntent.client_secret } : null,
    })
  } catch (err: unknown) {
    return NextResponse.json({ error: sanitizeError(err) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  // Only admin can access bookings directly
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const booking = await getBooking(id)
  if (!booking) return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  return NextResponse.json(booking)
}

function getDatesBetween(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start)
  const endDate = new Date(end)
  while (current <= endDate) {
    dates.push(current.toISOString().split("T")[0])
    current.setDate(current.getDate() + 1)
  }
  return dates
}
