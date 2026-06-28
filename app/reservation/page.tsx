"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-context"
import { produits } from "@/data/produits"
import AvailabilityCalendar from "@/components/calendar"
import { parsePrix, calcTotalHt, calcTtc, calcDeposit, formatDateFr } from "@/lib/utils"
import { ShoppingBag, ArrowRight, ArrowLeft, Check, X, Trash2, Plus, Minus, Loader2, CreditCard } from "lucide-react"
import type { ClientInfo, CartItem } from "@/lib/types"

type Step = "panier" | "dates" | "client" | "paiement" | "confirmation"

const DP = { fontFamily: "var(--font-playfair), serif" } as const

export default function ReservationPage() {
  const { items, updateItem, removeItem, clearCart } = useCart()
  const router = useRouter()
  const [step, setStep] = useState<Step>("panier")
  const [dateEdits, setDateEdits] = useState<Record<number, { start: string; end: string }>>({})
  const [client, setClient] = useState<ClientInfo>({
    nom: "", prenom: "", email: "", telephone: "",
    typeEvenement: "", dateEvenement: "", lieuEvenement: "",
    nbInvites: 0, besoinLivraison: false, message: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookingId, setBookingId] = useState<string>("")
  const [paymentClientSecret, setPaymentClientSecret] = useState<string>("")

  const getProduct = (id: number) => produits.find((p) => p.id === id)

  const itemsWithPrix = useMemo(
    () => items.map((i) => ({ ...i, prix: getProduct(i.productId)?.prix || 0 })),
    [items]
  )

  const totalHt = calcTotalHt(itemsWithPrix)
  const totalTtc = calcTtc(totalHt)
  const deposit = calcDeposit(totalTtc)

  const validateDates = () => {
    for (const item of items) {
      const eds = dateEdits[item.productId]
      if (!eds?.start || !eds?.end) return false
      if (eds.end <= eds.start) return false
    }
    return items.length > 0
  }

  const validateClient = () => {
    return client.nom && client.prenom && client.email && client.telephone && client.typeEvenement && client.dateEvenement && client.lieuEvenement
  }

  const handleCreateBooking = async () => {
    setLoading(true); setError("")
    try {
      const cartItems: CartItem[] = items.map((i) => ({
        productId: i.productId, qty: i.qty,
        dateStart: dateEdits[i.productId]?.start || "",
        dateEnd: dateEdits[i.productId]?.end || "",
      }))
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, client }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setBookingId(data.booking.id)
      if (data.paymentIntent?.clientSecret) {
        setPaymentClientSecret(data.paymentIntent.clientSecret)
      }
      setStep("paiement")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    clearCart()
    setStep("confirmation")
  }

  const handleBack = () => {
    if (step === "panier") {
      router.back()
    } else if (step === "dates") {
      setStep("panier")
    } else if (step === "client") {
      setStep("dates")
    } else if (step === "paiement") {
      setStep("client")
    }
  }

  const stepLabels = ["Panier", "Dates", "Client", "Paiement"]
  const stepIndex = ["panier", "dates", "client", "paiement"].indexOf(step)
  const isConfirmation = step === "confirmation"

  if (isConfirmation) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-500" />
          </div>
          <h1 style={DP} className="text-2xl font-semibold text-[#2E2E2E] mb-2">Réservation confirmée</h1>
          <p className="text-gray-500 text-sm mb-1">Votre numéro de réservation :</p>
          <p className="text-[#C8A97E] font-bold text-2xl mb-6">#{bookingId}</p>
          <p className="text-gray-500 text-sm mb-6">
            Un email de confirmation vous a été envoyé. Le solde (70%) vous sera rappelé 7 jours avant votre événement.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#2E2E2E] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#C8A97E] transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="text-sm text-gray-400 hover:text-[#C8A97E] transition-colors">← Retour</button>
          <h1 style={DP} className="text-lg font-semibold text-[#2E2E2E]">Réservation</h1>
          <div className="w-16" />
        </div>
        <div className="max-w-4xl mx-auto px-5 pb-4">
          <div className="flex gap-1 mb-2">
            {stepLabels.map((label, i) => (
              <div key={label} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIndex ? "bg-[#C8A97E]" : "bg-gray-200"}`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider">
            {stepLabels.map((label, i) => (
                            <span key={label} className={i <= stepIndex ? "text-[#C8A97E] font-semibold" : "text-[#999]"}>        {label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-2xl px-5 py-3 mb-6">{error}</div>
        )}

        {step === "panier" && (
          <div>
            <h2 style={DP} className="text-2xl font-semibold text-[#2E2E2E] mb-6">Votre panier</h2>
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-[#C8A97E]/40" />
                </div>
                <p className="text-gray-400 mb-5">Votre panier est vide</p>
                <button onClick={() => router.push("/")} className="bg-[#C8A97E] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors">
                  Découvrir le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {items.map((item) => {
                    const p = getProduct(item.productId)
                    return (
                      <div key={item.productId} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm border border-black/[0.07]">
                        <img src={p?.image || "/placeholder.svg"} alt={p?.nom || ""} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#2E2E2E]">{p?.nom}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">{parsePrix(p?.prix || 0)} € / jour</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateItem(item.productId, { qty: Math.max(1, item.qty - 1) })} className="w-6 h-6 bg-[#C8A97E] text-white rounded-full flex items-center justify-center hover:bg-[#B8926E] transition-colors shadow-sm"><Minus size={10} /></button>
                            <span className="text-sm font-semibold text-[#2E2E2E] w-7 text-center">{item.qty}</span>
                            <button onClick={() => updateItem(item.productId, { qty: item.qty + 1 })} className="w-6 h-6 bg-[#C8A97E] text-white rounded-full flex items-center justify-center hover:bg-[#B8926E] transition-colors shadow-sm"><Plus size={10} /></button>
                          </div>
                        </div>
                        <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-red-400 transition-colors self-start mt-1"><Trash2 size={14} /></button>
                      </div>
                    )
                  })}
                </div>

                <Totals totalHt={totalHt} totalTtc={totalTtc} deposit={deposit} />

                <div className="flex gap-3">
                  <button onClick={clearCart} className="flex-1 border border-[#C8A97E] text-gray-500 py-3 rounded-2xl text-sm font-medium hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">Vider le panier</button>
                  <button onClick={() => setStep("dates")} className="flex-1 bg-[#C8A97E] text-white py-3 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors flex items-center justify-center gap-2">
                    Choisir les dates <ArrowRight size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === "dates" && (
          <div>
            <BackButton onClick={() => setStep("panier")} label="Retour au panier" />
            <h2 style={DP} className="text-2xl font-semibold text-[#2E2E2E] mb-6">Choisir les dates de location</h2>
            <div className="space-y-6">
              {items.map((item) => {
                const p = getProduct(item.productId)
                const eds = dateEdits[item.productId] || { start: "", end: "" }
                return (
                  <div key={item.productId} className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.07]">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={p?.image || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-medium text-sm">{p?.nom}</p>
                        <p className="text-[11px] text-gray-400">Qté: {item.qty}</p>
                      </div>
                    </div>
                    <AvailabilityCalendar
                      productId={item.productId}
                      stock={p?.stock || 0}
                      dateStart={eds.start}
                      dateEnd={eds.end}
                      onDateStartChange={(d) => setDateEdits((prev) => ({ ...prev, [item.productId]: { ...prev[item.productId], start: d, end: "" } }))}
                      onDateEndChange={(d) => setDateEdits((prev) => ({ ...prev, [item.productId]: { ...prev[item.productId], end: d } }))}
                    />
                    {eds.start && eds.end && (
                      <p className="text-xs text-green-500 mt-3 text-center">
                        ✓ {formatDateFr(eds.start)} → {formatDateFr(eds.end)} ({Math.ceil((new Date(eds.end).getTime() - new Date(eds.start).getTime()) / (1000 * 60 * 60 * 24))} jours)
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
            <NextButton onClick={() => setStep("client")} disabled={!validateDates()} label="Continuer" />
          </div>
        )}

        {step === "client" && (
          <div>
            <BackButton onClick={() => setStep("dates")} label="Retour aux dates" />
            <h2 style={DP} className="text-2xl font-semibold text-[#2E2E2E] mb-6">Vos informations</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateBooking() }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Prénom" value={client.prenom} onChange={(v) => setClient((c) => ({ ...c, prenom: v }))} required />
                <InputField label="Nom" value={client.nom} onChange={(v) => setClient((c) => ({ ...c, nom: v }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Email" type="email" value={client.email} onChange={(v) => setClient((c) => ({ ...c, email: v }))} required />
                <InputField label="Téléphone" type="tel" value={client.telephone} onChange={(v) => setClient((c) => ({ ...c, telephone: v }))} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <SelectField label="Type d'événement" value={client.typeEvenement} onChange={(v) => setClient((c) => ({ ...c, typeEvenement: v }))} options={["Mariage", "Anniversaire", "Baptême", "Soirée d'entreprise", "Séminaire", "Autre"]} required />
                <InputField label="Date de l'événement" type="date" value={client.dateEvenement} onChange={(v) => setClient((c) => ({ ...c, dateEvenement: v }))} required />
              </div>
              <InputField label="Lieu de l'événement (adresse)" value={client.lieuEvenement} onChange={(v) => setClient((c) => ({ ...c, lieuEvenement: v }))} required />
              <InputField label="Nombre d'invités" type="number" value={String(client.nbInvites || "")} onChange={(v) => setClient((c) => ({ ...c, nbInvites: Number(v) }))} required />
              <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 border border-black/[0.07] shadow-sm">
                <div
                  className="relative w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    borderColor: client.besoinLivraison ? "#C8A97E" : "#d1d5db",
                    backgroundColor: client.besoinLivraison ? "#C8A97E" : "transparent",
                    borderRadius: "6px",
                  }}
                  onClick={() => setClient((c) => ({ ...c, besoinLivraison: !c.besoinLivraison }))}
                >
                  {client.besoinLivraison && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <input type="checkbox" checked={client.besoinLivraison} onChange={() => {}} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <label htmlFor="livraison" className="text-sm text-[#2E2E2E] cursor-pointer">Besoin de livraison et/ou montage ?</label>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Message (optionnel)</label>
                <textarea value={client.message || ""} onChange={(e) => setClient((c) => ({ ...c, message: e.target.value }))} rows={3} placeholder="Informations complémentaires..." className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors resize-none shadow-sm" />
              </div>

              {/* Recap */}
              <div className="bg-[#F8F5F0] rounded-2xl p-5">
                <p className="text-xs text-gray-400 mb-2">Récapitulatif</p>
                {items.map((i) => {
                  const p = getProduct(i.productId)
                  const eds = dateEdits[i.productId]
                  return (
                    <div key={i.productId} className="flex justify-between text-sm text-[#2E2E2E]">
                      <span>{p?.nom} × {i.qty}</span>
                      <span className="text-gray-500">{eds?.start ? formatDateFr(eds.start) : "..."} → {eds?.end ? formatDateFr(eds.end) : "..."}</span>
                    </div>
                  )
                })}
                <div className="border-t border-black/[0.1] mt-3 pt-3 flex justify-between font-bold">
                  <span className="text-[#666]">Acompte 30%</span>
                  <span className="text-[#C8A97E]">{Number.isFinite(deposit) ? `${deposit.toFixed(2)} €` : "0,00 €"}</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 text-center">
                Vous recevrez votre devis sous <strong className="text-[#C8A97E]">48h ouvrées</strong>
              </p>

              <button type="submit" disabled={!validateClient() || loading}
                className="w-full bg-[#C8A97E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                {loading ? "Traitement..." : `Payer l'acompte (${Number.isFinite(deposit) ? deposit.toFixed(2) : "0,00"} €)`}
              </button>
            </form>
          </div>
        )}

        {step === "paiement" && (
          <div>
            <div className="bg-white rounded-3xl shadow-xl max-w-md mx-auto p-8 text-center">
              <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <CreditCard size={28} className="text-[#C8A97E]" />
              </div>
              <h2 style={DP} className="text-2xl font-semibold text-[#2E2E2E] mb-2">Paiement sécurisé</h2>
              <p className="text-gray-400 text-sm mb-2">Acompte de <strong className="text-[#C8A97E]">{Number.isFinite(deposit) ? `${deposit.toFixed(2)} €` : "0,00 €"}</strong></p>
              <p className="text-gray-400 text-xs mb-6">Carte bancaire (Stripe) — Paiement sécurisé</p>

              <StripePaymentForm
                bookingId={bookingId}
                clientSecret={paymentClientSecret}
                deposit={deposit}
                onSuccess={handlePaymentSuccess}
                onError={(e) => setError(e)}
              />

              <div className="mt-6 pt-4 border-t border-black/[0.07] text-[10px] text-gray-400 space-y-1">
                <p>🔒 Paiement 100% sécurisé</p>
                <p>Annulation -30 jours : remboursement total</p>
                <p>Annulation -15 jours : remboursement 50%</p>
                <p>Annulation -7 jours : aucun remboursement</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C8A97E] transition-colors mb-6">
      <ArrowLeft size={14} /> {label}
    </button>
  )
}

function NextButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full bg-[#C8A97E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors mt-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
      {label} <ArrowRight size={14} />
    </button>
  )
}

function InputField({ label, type = "text", value, onChange, required }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm" />
    </div>
  )
}

function SelectField({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm">
        <option value="">Sélectionner</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

function fmt(n: number) {
  return Number.isFinite(n) ? `${n.toFixed(2)} €` : "0,00 €"
}

function Totals({ totalHt, totalTtc, deposit }: { totalHt: number; totalTtc: number; deposit: number }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.07] mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">Total HT</span>
        <span className="font-semibold">{fmt(totalHt)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-400">TVA (20%)</span>
        <span className="font-semibold">{fmt(totalTtc - totalHt)}</span>
      </div>
      <div className="flex justify-between text-lg font-bold text-[#2E2E2E] pt-2 border-t border-black/[0.07]">
        <span>Total TTC</span>
        <span>{fmt(totalTtc)}</span>
      </div>
      <div className="flex justify-between text-sm mt-1 text-[#C8A97E]">
        <span>Acompte 30%</span>
        <span className="font-semibold">{fmt(deposit)}</span>
      </div>
    </div>
  )
}

function StripePaymentForm({ bookingId, clientSecret, deposit, onSuccess, onError }: {
  bookingId: string; clientSecret: string; deposit: number; onSuccess: () => void; onError: (e: string) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, paymentIntentId: clientSecret }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onSuccess()
    } catch (err: any) {
      onError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Numéro de carte</label>
        <input value="4242 4242 4242 4242" readOnly
          className="w-full bg-gray-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm outline-none text-gray-400 cursor-not-allowed" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">Expiration</label>
          <input value="12/28" readOnly
            className="w-full bg-gray-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm outline-none text-gray-400 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1">CVC</label>
          <input value="123" readOnly
            className="w-full bg-gray-50 border border-black/[0.08] rounded-xl px-4 py-3 text-sm outline-none text-gray-400 cursor-not-allowed" />
        </div>
      </div>
      <p className="text-xs text-gray-400 text-center">Mode test — Carte Stripe de test (4242...)</p>
      <button type="submit" disabled={loading}
        className="w-full bg-[#C8A97E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? "Paiement en cours..." : `Payer ${deposit.toFixed(2)} €`}
      </button>
    </form>
  )
}
