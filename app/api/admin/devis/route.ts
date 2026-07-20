import { NextRequest, NextResponse } from "next/server"
import { getBookings, saveBooking, getNextAdminProductId, logActivity } from "@/lib/db"
import { COOKIE_NAME } from "@/lib/auth"
import { produits } from "@/data/produits"
import type { Booking, ClientInfo } from "@/lib/types"

function formatDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

function mapBooking(b: Booking) {
  const dates = b.items
    .filter((i) => i.dateStart && i.dateEnd)
    .map((i) => ({ start: i.dateStart, end: i.dateEnd }))
  const dateDebut = dates.length > 0 ? dates.reduce((a, b) => (a.start < b.start ? a : b)).start : ""
  const dateFin = dates.length > 0 ? dates.reduce((a, b) => (a.end > b.end ? a : b)).end : ""
  return {
    id: b.id,
    quoteNumber: b.quoteNumber || `BK-${b.id}`,
    client: b.client,
    itemCount: b.items.length,
    dateDebut,
    dateFin,
    totalHt: b.totalHt,
    totalTtc: b.totalTtc,
    statut: b.status,
    creeLe: b.createdAt,
  }
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const bookings = await getBookings()
  const sorted = [...bookings].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return NextResponse.json({ devis: sorted.map(mapBooking) })
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { client, items } = body

    if (!client?.nom || !client?.prenom || !client?.email) {
      return NextResponse.json({ error: "Informations client incomplètes" }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Aucun article" }, { status: 400 })
    }

    const itemsWithPrix = items.map((item: any) => {
      const p = produits.find((prod) => prod.id === item.productId)
      return { ...item, prix: p?.prix || item.prixUnitaire || 0 }
    })

    const totalHt = itemsWithPrix.reduce((s: number, i: any) => s + (i.prixUnitaire || i.prix || 0) * i.qty, 0)
    const totalTtc = Math.round(totalHt * 1.2 * 100) / 100
    const depositAmount = Math.round(totalTtc * 0.3 * 100) / 100

    const nextNum = await getNextAdminProductId()
    const quoteNumber = `DEV-${new Date().getFullYear()}-${String(nextNum).padStart(4, "0")}`

    const booking: Booking = {
      id: crypto.randomUUID(),
      items: items.map((i: any) => ({
        productId: i.productId,
        qty: i.qty || 1,
        dateStart: i.dateStart || "",
        dateEnd: i.dateEnd || "",
        variantLabel: i.variantLabel,
      })),
      client: {
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone || "",
        typeEvenement: client.typeEvenement || "Devis manuel",
        dateEvenement: client.dateEvenement || "",
        lieuEvenement: client.lieuEvenement || "",
        nbInvites: client.nbInvites || 0,
        besoinLivraison: client.besoinLivraison || false,
        message: client.message || "",
      },
      totalHt,
      totalTtc,
      depositAmount,
      status: "pending-quote",
      quoteNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await saveBooking(booking)
    await logActivity({ type: "devis_created", description: `Devis ${quoteNumber} créé pour ${client.prenom} ${client.nom}`, reference: booking.id })
    return NextResponse.json({ devis: mapBooking(booking) }, { status: 201 })
  } catch (err) {
    console.error("Error creating admin devis:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
