import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { produits } from "@/data/produits"
import { saveBooking, getBooking, blockDates, getBlockedDates } from "@/lib/db"
import { calcTotalHt, calcTtc, calcDeposit, DEPOSIT_RATE } from "@/lib/utils"
import { createPaymentIntent } from "@/lib/stripe"
import type { Booking, CartItem } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { items, client } = body as { items: CartItem[]; client?: any }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // Verify product exists & stock
    for (const item of items) {
      const product = produits.find((p) => p.id === item.productId)
      if (!product) return NextResponse.json({ error: `Produit ${item.productId} introuvable` }, { status: 400 })
      if (product.stock < item.qty) return NextResponse.json({ error: `Stock insuffisant pour ${product.nom}` }, { status: 400 })
    }

    // Verify dates not blocked
    const blockedAll = getBlockedDates()
    for (const item of items) {
      const dates = getDatesBetween(item.dateStart, item.dateEnd)
      const blocked = blockedAll.filter((b) => b.productId === item.productId)
      const conflict = dates.some((d) => blocked.some((b) => b.date === d))
      if (conflict) {
        const product = produits.find((p) => p.id === item.productId)
        return NextResponse.json({ error: `Dates non disponibles pour ${product?.nom}` }, { status: 409 })
      }
    }

    const itemsWithPrix = items.map((item) => {
      const p = produits.find((p) => p.id === item.productId)!
      return { ...item, prix: p.prix }
    })

    const totalHt = calcTotalHt(itemsWithPrix)
    const totalTtc = calcTtc(totalHt)
    const depositAmount = calcDeposit(totalTtc)

    const booking: Booking = {
      id: uuidv4().slice(0, 8).toUpperCase(),
      items,
      client: client || {} as any,
      totalHt,
      totalTtc,
      depositAmount,
      status: client ? "deposit-pending" : "pending-quote",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    saveBooking(booking)

    // Block dates temporarily (pending payment)
    for (const item of items) {
      const dates = getDatesBetween(item.dateStart, item.dateEnd)
      blockDates(item.productId, dates, booking.id)
    }

    let paymentIntent = null
    if (client) {
      paymentIntent = await createPaymentIntent(depositAmount, booking.id)
      booking.paymentIntentId = paymentIntent.id
      saveBooking(booking)
    }

    return NextResponse.json({
      booking,
      paymentIntent: paymentIntent ? { clientSecret: paymentIntent.client_secret } : null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })
  const booking = getBooking(id)
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
