import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { saveBooking, getBooking, blockDates, getBlockedDates } from "@/lib/db"
import { calcTotalHt, calcTtc, calcDeposit, DEPOSIT_RATE } from "@/lib/utils"
import { calcDeliveryFee } from "@/lib/delivery"
import { createPaymentIntent } from "@/lib/stripe"
import { getAvailableStock } from "@/lib/stock"
import { sendBookingConfirmation } from "@/lib/order-confirmation"
import { COOKIE_NAME } from "@/lib/auth"
import { sanitizeError } from "@/lib/security"
import type { Booking, CartItem } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, client } = body as { items: CartItem[]; client?: any }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // Limit cart size
    if (items.length > 50) {
      return NextResponse.json({ error: "Panier trop volumineux (max 50 articles)" }, { status: 400 })
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || typeof item.productId !== "number") {
        return NextResponse.json({ error: "ID produit invalide" }, { status: 400 })
      }
      if (!item.qty || item.qty < 1 || item.qty > 100 || typeof item.qty !== "number") {
        return NextResponse.json({ error: "Quantité invalide" }, { status: 400 })
      }
    }

    // Verify product exists & enforce stock limits per date range
    const validatedItems: CartItem[] = []

    for (const item of items) {
      const product = produits.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Produit ${item.productId} introuvable` }, { status: 400 })

      if (item.dateStart && item.dateEnd) {
        const available = await getAvailableStock(item.productId, item.dateStart, item.dateEnd)
        if (available <= 0) {
          return NextResponse.json(
            { error: `Aucune disponibilité pour ${product.nom} sur la période ${item.dateStart} → ${item.dateEnd}` },
            { status: 409 }
          )
        }
        if (item.qty > available) {
          return NextResponse.json(
            { error: `Stock insuffisant pour ${product.nom} : demandé ${item.qty}, disponible ${available} sur cette période` },
            { status: 409 }
          )
        }
        validatedItems.push(item)
      } else {
        if (product.stock < item.qty) {
          return NextResponse.json(
            { error: `Stock insuffisant pour ${product.nom} : demandé ${item.qty}, stock maximum ${product.stock}` },
            { status: 409 }
          )
        }
        validatedItems.push(item)
      }
    }

    const finalItems = validatedItems

    // Verify dates not blocked
    const blockedAll = await getBlockedDates()
    for (const item of finalItems) {
      const dates = getDatesBetween(item.dateStart, item.dateEnd)
      const blocked = blockedAll.filter((b) => b.productId === item.productId)
      const conflict = dates.some((d) => blocked.some((b) => b.date === d))
      if (conflict) {
        const product = produits.find((p) => p.id === item.productId)
        return NextResponse.json({ error: `Dates non disponibles pour ${product?.nom}` }, { status: 409 })
      }
    }

    const itemsWithPrix = finalItems.map((item) => {
      const p = produits.find((p) => p.id === item.productId)!
      return { ...item, prix: p.prix }
    })

    const totalHt = calcTotalHt(itemsWithPrix)
    const totalTtc = calcTtc(totalHt)

    // Calcul des frais de livraison si applicable
    let deliveryFee = 0
    if (client?.besoinLivraison && client?.codePostalLivraison) {
      const deliveryResult = calcDeliveryFee(client.codePostalLivraison, totalTtc)
      if (deliveryResult.allowed) {
        deliveryFee = deliveryResult.totalFee
      }
    }

    const totalTtcWithDelivery = Math.round((totalTtc + deliveryFee) * 100) / 100
    const depositAmount = calcDeposit(totalTtcWithDelivery)

    const booking: Booking = {
      id: uuidv4().slice(0, 8).toUpperCase(),
      items: finalItems,
      client: client || {} as any,
      totalHt,
      totalTtc: totalTtcWithDelivery,
      depositAmount,
      status: client ? "deposit-pending" : "pending-quote",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await saveBooking(booking)

    // Block dates temporarily (pending payment)
    for (const item of finalItems) {
      const dates = getDatesBetween(item.dateStart, item.dateEnd)
      await blockDates(item.productId, dates, booking.id)
    }

    let paymentIntent = null
    if (client) {
      paymentIntent = await createPaymentIntent(depositAmount, booking.id)
      booking.paymentIntentId = paymentIntent.id
      await saveBooking(booking)
    }

    // Send confirmation email (admin + client)
    let emailStatus = null
    try {
      emailStatus = await sendBookingConfirmation(booking)
    } catch (err) {
      console.error("Booking confirmation email error:", err)
    }

    return NextResponse.json({
      booking,
      paymentIntent: paymentIntent ? { clientSecret: paymentIntent.client_secret } : null,
      email: emailStatus,
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
