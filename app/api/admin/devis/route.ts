import { NextRequest, NextResponse } from "next/server"
import { getDevis, saveDevis, getNextDevisNumber, calculateDevis } from "@/lib/devis/db"
import { COOKIE_NAME } from "@/lib/auth"
import { logActivity } from "@/lib/db"
import type { Devis, DevisStatut } from "@/lib/devis/types"

// GET — list all devis
export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const devis = await getDevis()
  const sorted = [...devis].sort(
    (a, b) => new Date(b.creeLe).getTime() - new Date(a.creeLe).getTime()
  )
  return NextResponse.json({ devis: sorted })
}

// POST — create new devis (admin-initiated)
export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { client, lignes, dateDebut, dateFin, adresse, fraisLivraison, remise, notesInternes } = body

    if (!client?.nom || !client?.prenom || !client?.email) {
      return NextResponse.json({ error: "Informations client incomplètes" }, { status: 400 })
    }
    if (!lignes || lignes.length === 0) {
      return NextResponse.json({ error: "Aucune ligne" }, { status: 400 })
    }

    const calc = calculateDevis(lignes, remise || 0, fraisLivraison || 0)
    const quoteNumber = await getNextDevisNumber()

    const devis: Devis = {
      id: crypto.randomUUID(),
      quoteNumber,
      client,
      lignes,
      dateDebut: dateDebut || "",
      dateFin: dateFin || "",
      adresse,
      fraisLivraison: fraisLivraison || 0,
      remise: remise || 0,
      notesInternes: notesInternes || "",
      totalHt: calc.totalHt,
      totalTtc: calc.totalTtc,
      statut: "en_attente",
      creeLe: new Date().toISOString(),
    }

    await saveDevis(devis)
    await logActivity({ type: "devis_created", description: `Devis ${quoteNumber} créé pour ${client.prenom} ${client.nom}`, reference: devis.id })
    return NextResponse.json({ devis }, { status: 201 })
  } catch (err) {
    console.error("Error creating admin devis:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// PUT — update devis
export async function PUT(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, statut, client, lignes, dateDebut, dateFin, adresse, fraisLivraison, remise, notesInternes } = body

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 })
    }

    const existing = await getDevis().then((d) => d.find((d) => d.id === id))
    if (!existing) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    }

    const calc = lignes ? calculateDevis(lignes, remise ?? existing.remise, fraisLivraison ?? existing.fraisLivraison) : { totalHt: existing.totalHt, totalTtc: existing.totalTtc }

    const updated: Devis = {
      ...existing,
      client: client || existing.client,
      lignes: lignes || existing.lignes,
      dateDebut: dateDebut ?? existing.dateDebut,
      dateFin: dateFin ?? existing.dateFin,
      adresse: adresse ?? existing.adresse,
      fraisLivraison: fraisLivraison ?? existing.fraisLivraison,
      remise: remise ?? existing.remise,
      notesInternes: notesInternes ?? existing.notesInternes,
      totalHt: calc.totalHt,
      totalTtc: calc.totalTtc,
      statut: statut || existing.statut,
      envoyeLe: statut === "envoye" && !existing.envoyeLe ? new Date().toISOString() : existing.envoyeLe,
      accepteLe: statut === "accepte" && !existing.accepteLe ? new Date().toISOString() : existing.accepteLe,
      refuseLe: statut === "refuse" && !existing.refuseLe ? new Date().toISOString() : existing.refuseLe,
    }

    await saveDevis(updated)
    return NextResponse.json({ devis: updated })
  } catch (err) {
    console.error("Error updating devis:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
