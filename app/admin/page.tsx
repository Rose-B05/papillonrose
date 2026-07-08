"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { produits } from "@/data/produits"

interface QuoteItem {
  productId: number
  qty: number
  dateStart: string
  dateEnd: string
  variantLabel?: string
}

interface Quote {
  id: string
  quoteNumber: string
  client: {
    nom: string
    prenom: string
    email: string
    telephone: string
    typeEvenement: string
    dateEvenement: string
    lieuEvenement: string
    nbInvites: number
  }
  items: QuoteItem[]
  totalHt: number
  totalTtc: number
  statut: string
  createdAt: string
}

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
  envoye: "bg-amber-50 text-amber-700",
  acompte_paye: "bg-emerald-50 text-emerald-700",
  solde_paye: "bg-[#C8A97E]/10 text-[#C8A97E]",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function getProductName(productId: number) {
  return produits.find((p) => p.id === productId)?.nom || `Produit #${productId}`
}

export default function AdminPage() {
  const router = useRouter()
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/quotes")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login")
          return
        }
        return r.json()
      })
      .then((data) => {
        if (data) setQuotes(data.quotes || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    router.push("/admin/login")
  }

  async function handleSendPaymentLink(quoteId: string) {
    setSendingId(quoteId)
    try {
      const res = await fetch("/api/admin/send-payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      })
      if (res.ok) {
        alert("Lien de paiement envoyé !")
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de l'envoi")
      }
    } catch {
      alert("Erreur lors de l'envoi")
    }
    setSendingId(null)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#2E2E2E]">Devis</h1>
            <p className="text-sm text-gray-500 mt-1">
              {quotes.length} devis au total
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/stats"
              className="text-sm text-[#C8A97E] hover:underline"
            >
              Statistiques
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 hover:text-[#C8A97E] transition-colors"
            >
              Site
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement…</div>
        ) : quotes.length === 0 ? (
          <div className="text-center py-16 text-gray-400">Aucun devis</div>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="bg-white rounded-2xl shadow-sm border border-black/[0.07] p-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold text-[#2E2E2E]">
                        {q.quoteNumber}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          STATUT_COLORS[q.statut] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUT_LABELS[q.statut] || q.statut}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      {q.client.prenom} {q.client.nom} — {q.client.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                      <span>
                        {q.client.typeEvenement} — {q.client.lieuEvenement}
                      </span>
                      <span>{q.client.nbInvites} invités</span>
                      <span>{formatDate(q.createdAt)}</span>
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      {q.items.map((item, i) => (
                        <span key={i}>
                          {getProductName(item.productId)} ×{item.qty}
                          {i < q.items.length - 1 ? " · " : ""}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:flex-shrink-0">
                    <span className="text-sm font-semibold text-[#C8A97E] whitespace-nowrap">
                      {q.totalTtc.toFixed(2)} € TTC
                    </span>

                    {q.statut === "acompte_paye" && (
                      <button
                        onClick={() => handleSendPaymentLink(q.id)}
                        disabled={sendingId === q.id}
                        className="text-xs px-3 py-1.5 bg-[#C8A97E] text-white rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {sendingId === q.id ? "Envoi…" : "Envoyer lien solde"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
