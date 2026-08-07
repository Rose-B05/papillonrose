"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { produits } from "@/data/produits"
import { formatDateFr } from "@/lib/utils"
import type { Booking } from "@/lib/types"
import QuoteCountdown from "@/components/QuoteCountdown"

const STATUT_LABELS: Record<string, string> = {
  "pending-quote": "En attente de devis",
  "quote-sent": "Devis envoyé",
  signed: "Devis signé",
  "deposit-pending": "En attente de paiement",
  confirmed: "Confirmée",
  cancelled: "Annulée",
  expired: "Expiré",
  returned: "Terminée",
}

const STATUT_COLORS: Record<string, string> = {
  "pending-quote": "bg-gray-100 text-secondary-text",
  "quote-sent": "bg-purple-50 text-purple-700",
  signed: "bg-blue-50 text-blue-700",
  "deposit-pending": "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
  expired: "bg-orange-50 text-orange-700",
  returned: "bg-emerald-50 text-emerald-700",
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

function getDaysUntilEvent(dateEvenement: string): number {
  if (!dateEvenement) return NaN
  const now = new Date()
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const eventDate = new Date(dateEvenement)
  if (isNaN(eventDate.getTime())) return NaN
  const eventUtc = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()))
  const diffMs = eventUtc.getTime() - todayUtc.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false
  return !isNaN(new Date(dateStr).getTime())
}

const CANCELLABLE_STATUSES = ["pending-quote", "quote-sent", "deposit-pending", "confirmed"]

export default function DevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [quote, setQuote] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [cancelling, setCancelling] = useState(false)
  const [cancelMsg, setCancelMsg] = useState("")
  const [signing, setSigning] = useState(false)
  const [signError, setSignError] = useState("")
  const [signSuccess, setSignSuccess] = useState("")
  const [acceptChecked, setAcceptChecked] = useState(false)
  const [signatureName, setSignatureName] = useState("")

  useEffect(() => {
    fetch(`/api/customer/bookings/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? "Devis introuvable" : "Erreur de chargement")
        return r.json()
      })
      .then((data) => {
        setQuote(data.booking)
        setLoading(false)
      })
      .catch((e) => {
        setError(e.message)
        setLoading(false)
      })
  }, [id])

  async function handleCancel() {
    if (!confirm("Êtes-vous sûr de vouloir annuler ce devis ? Cette action est irréversible.")) return
    setCancelling(true)
    setCancelMsg("")
    try {
      const res = await fetch(`/api/customer/quotes/${id}/cancel`, { method: "PATCH" })
      const data = await res.json()
      if (res.ok) {
        setQuote((prev) => prev ? { ...prev, status: "cancelled" } : prev)
        setCancelMsg("Votre devis a été annulé. Les dates ont été libérées.")
      } else {
        setCancelMsg(data.error || "Erreur lors de l'annulation")
      }
    } catch {
      setCancelMsg("Erreur de connexion")
    }
    setCancelling(false)
  }

  async function handleSign() {
    if (!acceptChecked || !signatureName.trim()) {
      setSignError("Veuillez remplir votre nom et accepter les conditions.")
      return
    }
    setSigning(true)
    setSignError("")
    try {
      const signaturePayload = `SIGNED:${signatureName.trim()}:${new Date().toISOString()}`
      const res = await fetch(`/api/customer/quotes/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: signaturePayload, signerName: signatureName.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setQuote((prev) => prev ? { ...prev, status: "signed", signature: data.booking.signature } : prev)
        setSignSuccess("Votre devis a été signé avec succès. Un admin va finaliser votre réservation.")
      } else {
        setSignError(data.error || "Erreur lors de la signature")
      }
    } catch {
      setSignError("Erreur de connexion")
    }
    setSigning(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-950 flex items-center justify-center">
        <p className="text-secondary-text">Chargement…</p>
      </div>
    )
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-950 flex flex-col items-center justify-center gap-4">
        <p className="text-secondary-text">{error || "Devis introuvable"}</p>
        <Link href="/compte" className="text-[#c27a72] hover:underline text-sm">← Retour à mon compte</Link>
      </div>
    )
  }

  const { client } = quote

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-950">
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <Link href="/compte" className="text-sm text-secondary-text hover:text-[#c27a72] transition-colors mb-6 inline-block">
          ← Retour à mon compte
        </Link>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl font-bold text-[#2E2E2E] dark:text-neutral-100">{quote.quoteNumber || `#${quote.id}`}</h1>
              <p className="text-sm text-secondary-text dark:text-white/60 mt-1">
                Créé le {formatDateFr(quote.createdAt)}
              </p>
            </div>
            <span className={`inline-block text-sm px-3 py-1.5 rounded-full font-medium w-fit ${STATUT_COLORS[quote.status] || "bg-gray-100 text-secondary-text"}`}>
              {STATUT_LABELS[quote.status] || quote.status}
            </span>
          </div>

          <QuoteCountdown booking={quote} variant="client" />

          {/* Client info */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm mb-6 p-4 bg-[#F8F5F0] dark:bg-neutral-900/60 rounded-xl">
            <span className="text-secondary-text">Client</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.prenom} {client.nom}</span>
            <span className="text-secondary-text">Email</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.email}</span>
            {client.telephone && (
              <>
                <span className="text-secondary-text">Téléphone</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.telephone}</span>
              </>
            )}
            <span className="text-secondary-text">Type d'événement</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.typeEvenement}</span>
            <span className="text-secondary-text">Date de l'événement</span>
            <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{formatDateFr(client.dateEvenement)}</span>
            {client.lieuEvenement && (
              <>
                <span className="text-secondary-text">Lieu</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.lieuEvenement}</span>
              </>
            )}
            {client.nbInvites > 0 && (
              <>
                <span className="text-secondary-text">Nombre d'invités</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">{client.nbInvites}</span>
              </>
            )}
            {client.besoinLivraison && (
              <>
                <span className="text-secondary-text">Livraison</span>
                <span className="text-[#2E2E2E] dark:text-neutral-100 text-right">
                  {client.adresseLivraison || "Oui"}{client.fraisLivraison ? ` (${client.fraisLivraison.toFixed(2)} €)` : ""}
                </span>
              </>
            )}
            {client.message && (
              <>
                <span className="text-secondary-text">Message</span>
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
              const hasValidDates = item.dateStart && item.dateEnd
              const startMs = hasValidDates ? new Date(item.dateStart).getTime() : NaN
              const endMs = hasValidDates ? new Date(item.dateEnd).getTime() : NaN
              const nbJours = hasValidDates && !isNaN(startMs) && !isNaN(endMs)
                ? Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)))
                : 0
              const totalLigne = nbJours > 0 ? (prixUnitaire * item.qty * nbJours) : NaN
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
                    <p className="text-xs text-secondary-text dark:text-white/60 mt-0.5">
                      {formatDateFr(item.dateStart)} → {formatDateFr(item.dateEnd)}
                      {nbJours > 0 && <><br />× {item.qty} &middot; {prixUnitaire.toFixed(2)} € / jour</>}
                    </p>
                    <p className={`text-sm font-semibold mt-1 ${isNaN(totalLigne) ? "text-secondary-text" : "text-[#c27a72] dark:text-[#d4968e]"}`}>
                      {isNaN(totalLigne) ? "Prix sur devis" : `${totalLigne.toFixed(2)} €`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Payment status */}
          {quote.depositPaidAt && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm">
              <p className="text-green-700 dark:text-green-300 font-medium">
                Acompte payé le {formatDateFr(quote.depositPaidAt)} — {quote.depositAmount.toFixed(2)} €
              </p>
              {quote.balancePaidAt && (
                <p className="text-green-600 dark:text-green-400 mt-1">Soldé le {formatDateFr(quote.balancePaidAt)}</p>
              )}
            </div>
          )}

          {/* Signature section */}
          {quote.status === "quote-sent" && (
            <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
              {signSuccess ? (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-blue-700 dark:text-blue-300 font-medium text-sm">{signSuccess}</p>
                  {quote.signature && (
                    <p className="text-blue-600 dark:text-blue-400 text-xs mt-2">
                      Signé le {formatDateFr(quote.signature.signedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F8F5F0] dark:bg-neutral-900/60 rounded-xl">
                    <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">
                      Récapitulatif avant signature
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-secondary-text">Total TTC</span>
                        <span className="font-semibold text-[#2E2E2E] dark:text-neutral-100">{quote.totalTtc.toFixed(2)} €</span>
                      </div>
                      {quote.depositAmount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-secondary-text">Acompte à verser (30%)</span>
                          <span className="font-semibold text-[#c27a72]">{quote.depositAmount.toFixed(2)} €</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-[#F8F5F0] dark:bg-neutral-900/60 rounded-xl space-y-3">
                    <p className="text-sm text-secondary-text dark:text-white/60">
                      En signant ce devis, vous confirmez avoir lu et accepté les conditions de location.
                    </p>

                    <div>
                      <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                        Nom complet (signature électronique)
                      </label>
                      <input
                        type="text"
                        value={signatureName}
                        onChange={(e) => setSignatureName(e.target.value)}
                        placeholder={`${quote.client.prenom} ${quote.client.nom}`}
                        className="w-full px-3 py-2 rounded-lg border border-black/[0.1] dark:border-white/[0.15] bg-white dark:bg-neutral-800 text-sm text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c27a72]/50"
                      />
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={acceptChecked}
                        onChange={(e) => setAcceptChecked(e.target.checked)}
                        className="mt-0.5 rounded border-gray-300 text-[#c27a72] focus:ring-[#c27a72]"
                      />
                      <span className="text-sm text-secondary-text dark:text-white/60">
                        Je certifie avoir lu les{" "}
                        <a href="/conditions-location" target="_blank" rel="noopener noreferrer" className="text-[#c27a72] dark:text-[#d4968e] underline font-medium hover:text-[#B9807A]">
                          conditions de location
                        </a>{" "}
                        et j&apos;accepte ce devis.
                      </span>
                    </label>

                    {signError && (
                      <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{signError}</p>
                    )}

                    <button
                      onClick={handleSign}
                      disabled={signing || !acceptChecked || !signatureName.trim()}
                      className="w-full px-4 py-2.5 bg-[#c27a72] text-white text-sm font-medium rounded-lg hover:bg-[#B9807A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {signing ? "Signature en cours…" : "Signer et valider mon devis"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Signed info */}
          {quote.status === "signed" && quote.signature && (
            <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-blue-700 dark:text-blue-300 font-medium text-sm">
                  Devis signé électroniquement
                </p>
                <p className="text-blue-600 dark:text-blue-400 text-xs mt-1">
                  Signé par {quote.signature.signerName} le {formatDateFr(quote.signature.signedAt)}
                </p>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08] space-y-1 text-sm">
            <div className="flex justify-between text-secondary-text">
              <span>Total HT</span>
              <span>{quote.totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-secondary-text">
              <span>TVA (20 %)</span>
              <span>{(quote.totalTtc - quote.totalHt).toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#2E2E2E] dark:text-neutral-100 pt-1">
              <span>Total TTC</span>
              <span>{quote.totalTtc.toFixed(2)} €</span>
            </div>
          </div>

          {/* Cancel section */}
          {CANCELLABLE_STATUSES.includes(quote.status) && (() => {
            const dateEvenement = quote.client.dateEvenement
            const hasValidDate = isValidDate(dateEvenement)
            const daysLeft = hasValidDate ? getDaysUntilEvent(dateEvenement) : NaN

            if (!hasValidDate || isNaN(daysLeft) || daysLeft > 7) {
              return (
                <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
                  {cancelMsg && (
                    <p className={`text-sm mb-3 px-3 py-2 rounded-lg ${cancelMsg.includes("Erreur") || cancelMsg.includes("Délai") ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50"}`}>
                      {cancelMsg}
                    </p>
                  )}
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {cancelling ? "Annulation en cours…" : "Annuler mon devis"}
                  </button>
                </div>
              )
            }

            if (daysLeft <= 0) {
              return (
                <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
                  <p className="text-sm text-secondary-text dark:text-white/60 bg-[#F8F5F0] dark:bg-neutral-900/60 px-4 py-3 rounded-xl">
                    Votre événement du <strong>{formatDateFr(dateEvenement)}</strong> est passé. L&apos;annulation en ligne n&apos;est plus disponible.
                  </p>
                </div>
              )
            }

            const deadline = new Date(dateEvenement)
            deadline.setDate(deadline.getDate() - 7)
            const deadlineStr = isValidDate(deadline.toISOString()) ? formatDateFr(deadline.toISOString()) : formatDateFr(dateEvenement)

            return (
              <div className="mt-6 pt-4 border-t border-black/[0.07] dark:border-white/[0.08]">
                <p className="text-sm text-secondary-text dark:text-white/60 bg-[#F8F5F0] dark:bg-neutral-900/60 px-4 py-3 rounded-xl">
                  Votre événement a lieu le <strong>{formatDateFr(dateEvenement)}</strong>, dans <strong>{daysLeft} jour(s)</strong>. L&apos;annulation en ligne n&apos;est plus possible depuis le <strong>{deadlineStr}</strong>. Contactez-nous directement si besoin. Conformément à nos CGV, l&apos;acompte n&apos;est plus remboursable.
                </p>
              </div>
            )
          })()}
        </div>

        <p className="text-center text-xs text-secondary-text dark:text-white/60">
          <Link href="/compte" className="hover:text-[#c27a72] dark:hover:text-[#d4968e] transition-colors">← Retour à mon compte</Link>
        </p>
      </div>
    </div>
  )
}
