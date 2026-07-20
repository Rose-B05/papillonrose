"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAdminHeader } from "@/components/admin/AdminHeaderContext"
import DevisStatutBadge from "@/components/admin/devis/DevisStatutBadge"
import { produits } from "@/data/produits"
import { ArrowLeft, Send, XCircle } from "lucide-react"
import type { Booking } from "@/lib/types"

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

function getProductName(productId: number): string {
  return produits.find((p) => p.id === productId)?.nom || `Produit #${productId}`
}

function getProductPrice(productId: number, variantLabel?: string): number {
  const p = produits.find((prod) => prod.id === productId)
  if (!p) return 0
  if (variantLabel && p.variants) {
    const v = p.variants.find((x) => x.label === variantLabel)
    if (v) return typeof v.prix === "number" ? v.prix : parseFloat(v.prix) || 0
  }
  return typeof p.prix === "number" ? p.prix : parseFloat(String(p.prix)) || 0
}

export default function DevisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const headerTitle = loading ? "Réservation" : !booking ? "Réservation introuvable" : booking.quoteNumber || booking.id
  const headerAction = booking && !loading ? (
    <div className="flex items-center gap-2">
      {(booking.status === "pending-quote") && (
        <button
          onClick={handleSend}
          disabled={sending}
          className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
        >
          <Send size={13} className="inline mr-1" />
          {sending ? "Envoi…" : "Envoyer le devis"}
        </button>
      )}
      {booking.status !== "cancelled" && (
        <button
          onClick={handleCancel}
          className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
          title="Annuler"
        >
          <XCircle size={15} />
        </button>
      )}
    </div>
  ) : null

  useAdminHeader(headerTitle, headerAction)

  const loadBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/devis/${id}`)
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      if (data.devis) {
        setBooking(data.devis)
      }
    } catch {}
    setLoading(false)
  }, [id, router])

  useEffect(() => { loadBooking() }, [loadBooking])

  async function handleStatusChange(statut: string) {
    const res = await fetch(`/api/admin/devis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })
    if (res.ok) {
      await loadBooking()
    }
  }

  async function handleSend() {
    setSending(true)
    try {
      const res = await fetch("/api/admin/devis/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        await loadBooking()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur")
      }
    } catch {
      alert("Erreur lors de l'envoi")
    }
    setSending(false)
  }

  async function handleCancel() {
    if (!confirm("Annuler cette réservation ?")) return
    await handleStatusChange("cancelled")
  }

  if (loading) {
    return (
        <div className="text-center py-16 text-gray-400 dark:text-white/60">Chargement…</div>
    )
  }

  if (!booking) {
    return (
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-white/60 mb-4">Cette réservation n&apos;existe pas.</p>
          <button onClick={() => router.push("/admin/devis")} className="text-[#C9948E] hover:underline">
            ← Retour à la liste
          </button>
        </div>
    )
  }

  return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <div className="flex items-center gap-3 mb-4">
            <DevisStatutBadge statut={booking.status} />
            <span className="text-xs text-gray-400 dark:text-white/50">
              Créé le {formatDate(booking.createdAt)}
            </span>
            {booking.customerEmail && (
              <span className="text-xs text-gray-400 dark:text-white/50">
                · {booking.customerEmail}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Client</h3>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <span className="text-gray-400">Nom</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100">{booking.client.prenom} {booking.client.nom}</span>
            <span className="text-gray-400">Email</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100">{booking.client.email}</span>
            <span className="text-gray-400">Téléphone</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100">{booking.client.telephone || "—"}</span>
            <span className="text-gray-400">Événement</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100">{booking.client.typeEvenement || "—"}</span>
            <span className="text-gray-400">Date événement</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100">{booking.client.dateEvenement ? formatDate(booking.client.dateEvenement) : "—"}</span>
            <span className="text-gray-400">Lieu</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100">{booking.client.lieuEvenement || "—"}</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Articles ({booking.items.length})</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="text-left py-2 text-xs text-gray-500 dark:text-white/60">Article</th>
                  <th className="text-center py-2 text-xs text-gray-500 dark:text-white/60">Qté</th>
                  <th className="text-left py-2 text-xs text-gray-500 dark:text-white/60 hidden sm:table-cell">Dates</th>
                  <th className="text-right py-2 text-xs text-gray-500 dark:text-white/60">Total</th>
                </tr>
              </thead>
              <tbody>
                {booking.items.map((item, i) => {
                  const prix = getProductPrice(item.productId, item.variantLabel)
                  const nbJours = item.dateStart && item.dateEnd
                    ? Math.max(1, Math.ceil((new Date(item.dateEnd).getTime() - new Date(item.dateStart).getTime()) / (1000 * 60 * 60 * 24)))
                    : 1
                  return (
                    <tr key={i} className="border-b border-black/[0.04] dark:border-white/[0.05]">
                      <td className="py-2">
                        <span className="text-[#2E2E2E] dark:text-neutral-100">
                          {getProductName(item.productId)}
                          {item.variantLabel && <span className="text-[#C9948E]"> — {item.variantLabel}</span>}
                        </span>
                      </td>
                      <td className="py-2 text-center">{item.qty}</td>
                      <td className="py-2 hidden sm:table-cell text-xs text-gray-500 dark:text-white/60">
                        {item.dateStart ? `${formatDate(item.dateStart)} → ${formatDate(item.dateEnd)}` : "—"}
                      </td>
                      <td className="py-2 text-right font-medium text-[#C9948E] dark:text-[#E8B4AE]">
                        {(prix * item.qty * nbJours).toFixed(2)} €
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Totaux</h3>
          <div className="space-y-2 text-sm max-w-xs">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60">Total HT</span>
              <span>{booking.totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60">TVA (20%)</span>
              <span>{(booking.totalTtc - booking.totalHt).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#C9948E] dark:text-[#E8B4AE]">
              <span>Total TTC</span>
              <span>{booking.totalTtc.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-xs text-gray-400 dark:text-white/50">
              <span>Acompte 30%</span>
              <span>{booking.depositAmount.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Changer le statut</h3>
          <div className="flex flex-wrap gap-2">
            {(["pending-quote", "quote-sent", "deposit-pending", "confirmed", "cancelled", "returned"] as const).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={booking.status === s}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  booking.status === s
                    ? "bg-[#C9948E] text-white"
                    : "bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-neutral-600"
                }`}
              >
                {s === "pending-quote" ? "En attente" : s === "quote-sent" ? "Devis envoyé" : s === "deposit-pending" ? "Acompte en attente" : s === "confirmed" ? "Confirmée" : s === "cancelled" ? "Annulée" : "Restituée"}
              </button>
            ))}
          </div>
        </div>
      </div>
  )
}
