import { NextRequest, NextResponse } from "next/server"
import { saveDevis, getNextDevisNumber, buildDevisLignes, calculateDevis } from "@/lib/devis/db"
import type { Devis, DevisStatut } from "@/lib/devis/types"
import { produits } from "@/data/produits"
import { getAdminProducts } from "@/lib/db"
import { mergeAdminProduct } from "@/lib/product-helpers"

// Public POST — create devis from cart (customer or admin-initiated)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client, items, remise, fraisLivraison, notesInternes } = body

    if (!client?.nom || !client?.prenom || !client?.email || !client?.telephone) {
      return NextResponse.json({ error: "Informations client incomplètes" }, { status: 400 })
    }
    if (!client?.dateDebut || !client?.dateFin) {
      return NextResponse.json({ error: "Dates manquantes" }, { status: 400 })
    }
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // Build merged product list
    const adminProducts = await getAdminProducts()
    const adminMap = new Map<number, (typeof adminProducts)[0]>()
    for (const ap of adminProducts) {
      if (ap.status === "publie") adminMap.set(ap.id, ap)
    }

    const mergedProducts = produits.map((sp) => {
      const adminOverride = adminMap.get(sp.id)
      return adminOverride ? mergeAdminProduct(sp, adminOverride) : sp
    })

    const lignes = buildDevisLignes(items, mergedProducts)
    const calc = calculateDevis(lignes, remise || 0, fraisLivraison || 0)
    const quoteNumber = await getNextDevisNumber()

    const devis: Devis = {
      id: crypto.randomUUID(),
      quoteNumber,
      client: {
        nom: client.nom,
        prenom: client.prenom,
        email: client.email,
        telephone: client.telephone,
      },
      lignes,
      dateDebut: client.dateDebut,
      dateFin: client.dateFin,
      adresse: client.adresse ? { rue: client.adresse } : undefined,
      fraisLivraison: fraisLivraison || 0,
      remise: remise || 0,
      notesInternes: notesInternes || "",
      totalHt: calc.totalHt,
      totalTtc: calc.totalTtc,
      statut: "en_attente" as DevisStatut,
      creeLe: new Date().toISOString(),
    }

    await saveDevis(devis)

    return NextResponse.json({ devis }, { status: 201 })
  } catch (err) {
    console.error("Error creating devis:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
