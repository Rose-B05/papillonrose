"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { produits } from "@/data/produits"
import { formatDateFr } from "@/lib/utils"
import type { QuoteRequest } from "@/lib/types"

const STATUT_LABELS: Record<string, string> = {
  recu: "Reçu",
  en_traitement: "En traitement",
  confirme_stock: "Stock confirmé",
  refuse_stock: "Stock refusé",
  envoye: "Devis envoyé",
  acompte_paye: "Acompte payé",
  solde_paye: "Soldé",
}

const STATUT_COLORS: Record<string, string> = {
  recu: "bg-gray-100 text-gray-600",
  en_traitement: "bg-blue-50 text-blue-700",
  confirme_stock: "bg-green-50 text-green-700",
  refuse_stock: "bg-red-50 text-red-700",
  envoye: "bg-purple-50 text-purple-700",
  acompte_paye: "bg-amber-50 text-amber-700",
  solde_paye: "bg-emerald-50 text-emerald-700",
}

function getProduct(id: number) {
  return produits.find((p) => p.id === id)
}

function getPrix(product: { prix: number | string; variants?: { label: string; prix: number | string }[] }, variantLabel?: string): number {
  if (variantLabel && product.variants) {
    const v = product.variants.find((x) => x.label === variantLabel)
    if (v) return typeof v.prix === "number" ? v.prix : parseFloat(v.prix) || 0
  }
  return typeof product.prix === "number" ? product.prix : parseFloat(product.prix) || 0
}

export default function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quote, setQuote] = useState<QuoteRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`/api/customer/quotes/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Devis introuvable" : "Erreur de chargement")
        return r.json()
      })
      .then((data) => {
        setQuote(data.quote)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-gray-400">Chargement…</p>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">{error || "Devis introuvable"}</p>
        <Link href="/compte" className="text-[#C9948E] hover:underline text-sm">← Retour à mon compte</Link>
      </div>
    )
  }

  const { client } = quote

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <Link href="/compte" className="text-sm text-gray-400 hover:text-[#C9948E] transition-colors mb-6 inline-block">
          ← Retour à mon compte
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl font-bold text-[#2E2E2E] dark:text-neutral-100">{quote.quoteNumber}</h1>
              <p className="text-sm text-gray-400 dark:text-white/60 mt-1">
                Créé le {formatDateFr(quote.createdAt)}
              </p>
            </div>
            <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium w-fit ${STATUT_COLORS[quote.statut] || "bg-gray-100 text-gray-600"}`}>
              {STATUT_LABELS[quote.statut] || quote.statut}
            </span>
          </div>

          {/* Client info */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6 p-4 bg-[#F8F5F0] dark:bg-neutral-900/60 rounded-xl">
            <span className="text-gray-400">Client</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.prenom} {client.nom}</span>
            <span className="text-gray-400">Email</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.email}</span>
            {client.telephone && (
              <>
                <span className="text-gray-400">Téléphone</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.telephone}</span>
              </>
            )}
            <span className="text-gray-400">Type d'événement</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.typeEvenement}</span>
            <span className="text-gray-400">Date de l'événement</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{formatDateFr(client.dateEvenement)}</span>
            {client.lieuEvenement && (
              <>
                <span className="text-gray-400">Lieu</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.lieuEvenement}</span>
              </>
            )}
            {client.nbInvites > 0 && (
              <>
                <span className="text-gray-400">Nombre d'invités</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.nbInvites}</span>
              </>
            )}
            {client.besoinLivraison && (
              <>
                <span className="text-gray-400">Livraison</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">
                  {client.adresseLivraison || "Oui"}{client.fraisLivraison ? ` (${client.fraisLivraison.toFixed(2)} €)` : ""}
                </span>
              </>
            )}
            {client.message && (
              <>
                <span className="text-gray-400">Message</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.message}</span>
              </>
            )}
          </div>

          {/* Items */}
          <h2 className="text-base font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
            Articles ({quote.items.length})
          </h2>
          <div className="space-y-3">
            {quote.items.map((item, idx) => {
              const product = getProduct(item.productId)
              if (!product) return null
              const prixUnitaire = getPrix(product, item.variantLabel)
              const nbJours = Math.max(1, Math.ceil(
                (new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()) / (1000 * 60 * 60 * 24)
              ))
              return (
                <div key={idx} className="flex gap-3 bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl p-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-800 shrink-0">
                    <img src={product.image} alt={product.nom} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 truncate">
                      {product.nom}
                      {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-white/60 mt-0.5">
                      {formatDateFr(item.dateStart)} → {formatDateFr(item.dateEnd)}
                      <br />× {item.qty} &middot; {prixUnitaire.toFixed(2)} € / jour
                    </p>
                    <p className="text-sm font-semibold text-[#C9948E] dark:text-[#E8B4AE] mt-1">
                      {(prixUnitaire * item.qty * nbJours).toFixed(2)} €
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08] space-y-1 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Total HT</span>
              <span>{quote.totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>TVA (20 %)</span>
              <span>{(quote.totalTtc - quote.totalHt).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2E2E2E] dark:text-neutral-100 pt-1">
              <span>Total TTC</span>
              <span>{quote.totalTtc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-white/60">
          <Link href="/compte" className="hover:text-[#C9948E] dark:hover:text-[#E8B4AE] transition-colors">← Retour à mon compte</Link>
        </p>
      </div>
    </div>
  )
}
