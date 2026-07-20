"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/components/cart-context"
import { produits } from "@/data/produits"
import AvailabilityCalendar from "@/components/calendar"
import { parsePrix, calcTotalHt, calcTtc, calcDeposit, formatDateFr, getPrixForProduct } from "@/lib/utils"
import { calcRentalDates, calculateLateFee, getRuleSummary, formatDateLong, type RentalDates } from "@/lib/rental-dates"
import { calcDeliveryFee, type DeliveryResult } from "@/lib/delivery"
import { ShoppingBag, ArrowRight, ArrowLeft, Check, X, Trash2, Plus, Minus, Loader2, Package, RotateCcw, AlertTriangle, Truck, LogIn, UserPlus } from "lucide-react"
import dynamic from "next/dynamic"
import type { ClientInfo, CartItem } from "@/lib/types"

const DeliveryMap = dynamic(() => import("@/components/delivery-map"), { ssr: false })

type Step = "panier" | "dates" | "client" | "compte" | "confirmation"

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
  const [acceptedConditions, setAcceptedConditions] = useState(false)
  const [availableStock, setAvailableStock] = useState<Record<number, number>>({})
  const [serverWarnings, setServerWarnings] = useState<string[]>([])
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showErrors, setShowErrors] = useState(false)
  const [isDark, setIsDark] = useState(false)
  // Account step
  const [accountMode, setAccountMode] = useState<"register" | "login">("register")
  const [accountPassword, setAccountPassword] = useState("")
  const [accountPasswordConfirm, setAccountPasswordConfirm] = useState("")
  const [accountError, setAccountError] = useState("")
  const [accountLoading, setAccountLoading] = useState(false)
  const [alreadyConnected, setAlreadyConnected] = useState<boolean | null>(null)

  // Restore from sessionStorage after hydration (avoids #418 mismatch)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      const savedStep = sessionStorage.getItem("reservation_step")
      if (savedStep === "panier" || savedStep === "dates" || savedStep === "client" || savedStep === "compte" || savedStep === "confirmation") {
        setStep(savedStep)
      }
      const savedDateEdits = sessionStorage.getItem("reservation_dateEdits")
      if (savedDateEdits) setDateEdits(JSON.parse(savedDateEdits))
      const savedClient = sessionStorage.getItem("reservation_client")
      if (savedClient) setClient(JSON.parse(savedClient))
    } catch {}
    setHydrated(true)
  }, [])

  // Restore from sessionStorage after hydration (avoids #418 mismatch)
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    try {
      const savedStep = sessionStorage.getItem("reservation_step")
      if (savedStep === "panier" || savedStep === "dates" || savedStep === "client" || savedStep === "confirmation") {
        setStep(savedStep)
      }
      const savedDateEdits = sessionStorage.getItem("reservation_dateEdits")
      if (savedDateEdits) setDateEdits(JSON.parse(savedDateEdits))
      const savedClient = sessionStorage.getItem("reservation_client")
      if (savedClient) setClient(JSON.parse(savedClient))
    } catch {}
    setHydrated(true)
  }, [])

  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains("dark"))
    check()
    const obs = new MutationObserver(check)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  // Persist to sessionStorage
  useEffect(() => { sessionStorage.setItem("reservation_step", step) }, [step])
  useEffect(() => { sessionStorage.setItem("reservation_dateEdits", JSON.stringify(dateEdits)) }, [dateEdits])
  useEffect(() => { sessionStorage.setItem("reservation_client", JSON.stringify(client)) }, [client])

  // Clear sessionStorage on successful booking creation
  const clearReservationSession = () => {
    sessionStorage.removeItem("reservation_step")
    sessionStorage.removeItem("reservation_dateEdits")
    sessionStorage.removeItem("reservation_client")
  }

  const getProduct = (id: number) => produits.find((p) => p.id === id)

  const itemsWithPrix = useMemo(
    () => items.map((i) => ({
      ...i,
      dateStart: dateEdits[i.productId]?.start || i.dateStart,
      dateEnd: dateEdits[i.productId]?.end || i.dateEnd,
      prix: getPrixForProduct(getProduct(i.productId) || { prix: 0 }, i.variantLabel) || 0,
    })),
    [items, dateEdits]
  )

  const totalHt = calcTotalHt(itemsWithPrix)
  const totalTtc = calcTtc(totalHt)
  const deliveryFee = deliveryResult?.allowed ? deliveryResult.totalFee : 0
  const totalTtcWithDelivery = Math.round((totalTtc + deliveryFee) * 100) / 100
  const deposit = calcDeposit(totalTtcWithDelivery)

  const rentalDatesMap = useMemo(() => {
    const map: Record<number, RentalDates> = {}
    for (const item of items) {
      const eds = dateEdits[item.productId]
      if (eds?.start && eds?.end) {
        map[item.productId] = calcRentalDates(eds.start, eds.end)
      }
    }
    return map
  }, [items, dateEdits])

  const firstRentalDate = useMemo(() => {
    const keys = Object.keys(rentalDatesMap)
    return keys.length > 0 ? rentalDatesMap[Number(keys[0])] : null
  }, [rentalDatesMap])

  useEffect(() => {
    const fetchAvailability = async () => {
      const newAvailable: Record<number, number> = {}
      for (const item of items) {
        const eds = dateEdits[item.productId]
        if (eds?.start && eds?.end) {
          try {
            const res = await fetch(`/api/availability?productId=${item.productId}&dateStart=${eds.start}&dateEnd=${eds.end}`)
            const data = await res.json()
            newAvailable[item.productId] = data.availableStock ?? getProduct(item.productId)?.stock ?? 0
          } catch {
            newAvailable[item.productId] = getProduct(item.productId)?.stock ?? 0
          }
        } else {
          newAvailable[item.productId] = getProduct(item.productId)?.stock ?? 0
        }
      }
      setAvailableStock(newAvailable)
    }
    fetchAvailability()
  }, [items, dateEdits])

  const getMaxQty = useCallback((productId: number) => {
    return availableStock[productId] ?? getProduct(productId)?.stock ?? 0
  }, [availableStock])

  useEffect(() => {
    for (const item of items) {
      const max = getMaxQty(item.productId)
      if (max > 0 && item.qty > max) {
        updateItem(item.productId, item.variantLabel, { qty: max })
      }
    }
  }, [availableStock])

  // Recalcul des frais de livraison quand le code postal change
  useEffect(() => {
    if (client.besoinLivraison && client.codePostalLivraison && client.codePostalLivraison.length === 5) {
      const result = calcDeliveryFee(client.codePostalLivraison, totalTtc)
      setDeliveryResult(result)
      setClient((c) => ({
        ...c,
        fraisLivraison: result.allowed ? result.totalFee : undefined,
        distanceLivraison: result.allowed && result.distanceKm ? result.distanceKm : undefined,
      }))
    } else {
      setDeliveryResult(null)
      setClient((c) => ({ ...c, fraisLivraison: undefined, distanceLivraison: undefined }))
    }
  }, [client.besoinLivraison, client.codePostalLivraison, totalTtc])

  // Pré-remplir les infos client depuis le profil connecté
  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.customer) {
          setAlreadyConnected(true)
          const res = await fetch("/api/customer/profile")
          const profData = await res.json()
          if (profData.customer) {
            const p = profData.customer
            setClient((c) => ({
              ...c,
              prenom: c.prenom || p.prenom || "",
              nom: c.nom || p.nom || "",
              email: c.email || p.email || "",
              telephone: c.telephone || p.telephone || "",
              lieuEvenement: c.lieuEvenement || p.adresse || "",
            }))
          }
        } else {
          setAlreadyConnected(false)
        }
      })
      .catch(() => setAlreadyConnected(false))
  }, [])

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

  const validateClientFields = (): Record<string, string> => {
    const errors: Record<string, string> = {}
    if (!client.prenom) errors.prenom = "Le prénom est requis"
    if (!client.nom) errors.nom = "Le nom est requis"
    if (!client.email) errors.email = "L'email est requis"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) errors.email = "L'email n'est pas valide"
    if (!client.telephone) errors.telephone = "Le téléphone est requis"
    else if (!/^(\+33|0033|0)[1-9](\s?\d{2}){4}$/.test(client.telephone.replace(/[\s.-]/g, ""))) errors.telephone = "Numéro de téléphone invalide (format français attendu)"
    if (!client.typeEvenement) errors.typeEvenement = "Le type d'événement est requis"
    if (!client.dateEvenement) errors.dateEvenement = "La date de l'événement est requise"
    if (!client.lieuEvenement) errors.lieuEvenement = "Le lieu de l'événement est requis"
    return errors
  }

  const handleCreateBooking = async () => {
    setLoading(true); setError(""); setServerWarnings([]); setShowErrors(false)
    try {
      const cartItems: CartItem[] = items.map((i) => ({
        productId: i.productId, qty: i.qty, variantLabel: i.variantLabel,
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
      if (data.warnings) setServerWarnings(data.warnings)
      if (data.booking.items) {
        for (const bi of data.booking.items) {
          const current = items.find((i) => i.productId === bi.productId)
          if (current && current.qty !== bi.qty) {
            updateItem(bi.productId, { qty: bi.qty })
          }
        }
      }
      setBookingId(data.booking.id)
      clearCart()
      clearReservationSession()
      setStep("confirmation")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    if (step === "panier") {
      router.back()
    } else if (step === "dates") {
      setStep("panier")
    } else if (step === "client") {
      setStep("dates")
    } else if (step === "compte") {
      setStep("client")
    }
  }

  const stepLabels = ["Panier", "Dates", "Client", "Compte"]
  const stepIndex = ["panier", "dates", "client", "compte"].indexOf(step)
  const isConfirmation = step === "confirmation"

  if (isConfirmation) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-3xl shadow-xl max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-500" />
          </div>
          <h1 style={DP} className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">Demande envoyée</h1>
          <p className="text-gray-500 dark:text-white/60 text-sm mb-1">Votre numéro de demande :</p>
          <p className="text-[#C9948E] dark:text-[#E8B4AE] font-bold text-2xl mb-6">#{bookingId}</p>
          <p className="text-gray-500 dark:text-white/60 text-sm mb-6">
            Votre demande de devis a bien été enregistrée. Nous vous enverrons votre devis personnalisé sous <strong className="text-[#C9948E] dark:text-[#E8B4AE]">24h ouvrées</strong>.
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-[#2E2E2E] dark:bg-neutral-800 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#C9948E] dark:hover:bg-amber-600 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 pt-16 md:pt-20">
      <div className="bg-white dark:bg-neutral-800 shadow-sm">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <button onClick={handleBack} className="text-sm text-gray-400 dark:text-white/60 hover:text-[#C9948E] dark:hover:text-[#E8B4AE] transition-colors">← Retour</button>
          <h1 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">Réservation</h1>
          <div className="w-16" />
        </div>
        <div className="max-w-4xl mx-auto px-5 pb-4">
          <div className="flex gap-1 mb-2">
            {stepLabels.map((label, i) => (
              <div key={label} className={`flex-1 h-1.5 rounded-full transition-all ${i <= stepIndex ? "bg-[#C9948E] dark:bg-[#C9948E]" : "bg-gray-200"}`} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-wider">
            {stepLabels.map((label, i) => (
                            <span key={label} className={i <= stepIndex ? "text-[#C9948E] dark:text-[#E8B4AE] font-semibold" : "text-[#999]"}>        {label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-2xl px-5 py-3 mb-6">{error}</div>
        )}
        {serverWarnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-600 text-sm rounded-2xl px-5 py-3 mb-6 space-y-1">
            {serverWarnings.map((w, i) => <p key={i}>{w}</p>)}
          </div>
        )}

        {step === "panier" && (
          <div>
            <h2 style={DP} className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-6">Votre panier</h2>
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-[#C9948E]/10 dark:bg-[#C9948E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={24} className="text-[#C9948E]/40" />
                </div>
                <p className="text-gray-400 dark:text-white/60 mb-5">Votre panier est vide</p>
                <a href="/" className="bg-[#C9948E] dark:bg-[#C9948E] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors inline-block">
                  Découvrir le catalogue
                </a>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6">
                  {items.map((item) => {
                    const p = getProduct(item.productId)
                    const maxQty = getMaxQty(item.productId)
                    const atMax = item.qty >= maxQty
                    const itemPrix = getPrixForProduct(p || { prix: 0 }, item.variantLabel)
                    return (
                      <div key={`${item.productId}:${item.variantLabel || ""}`} className="bg-white dark:bg-neutral-800 rounded-2xl p-4 flex gap-4 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                        <img src={p?.image || "/placeholder.svg"} alt={p?.nom || ""} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-[#2E2E2E] dark:text-neutral-100">{p?.nom}</p>
                          {item.variantLabel && <p className="text-[11px] text-[#C9948E] dark:text-[#E8B4AE] font-medium">{item.variantLabel}</p>}
                          <p className="text-[11px] text-gray-400 dark:text-white/60 mt-0.5">{parsePrix(itemPrix)} € / jour</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateItem(item.productId, item.variantLabel, { qty: Math.max(1, item.qty - 1) })} className="w-6 h-6 bg-[#C9948E] dark:bg-[#C9948E] text-white rounded-full flex items-center justify-center hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors shadow-sm"><Minus size={10} /></button>
                            <span className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 w-7 text-center">{item.qty}</span>
                            <button
                              onClick={() => { if (!atMax) updateItem(item.productId, item.variantLabel, { qty: item.qty + 1 }) }}
                              disabled={atMax}
                              className="w-6 h-6 bg-[#C9948E] dark:bg-[#C9948E] text-white rounded-full flex items-center justify-center hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            ><Plus size={10} /></button>
                          </div>
                          {atMax && maxQty > 0 && (
                            <p className="text-[10px] text-amber-500 mt-1 font-medium">Stock maximum atteint</p>
                          )}
                        </div>
                        <button onClick={() => removeItem(item.productId, item.variantLabel)} className="text-gray-300 dark:text-neutral-600 hover:text-red-400 transition-colors self-start mt-1"><Trash2 size={14} /></button>
                      </div>
                    )
                  })}
                </div>

                <Totals totalHt={totalHt} totalTtc={totalTtc} deposit={deposit} deliveryFee={deliveryFee} />

                <div className="flex gap-3">
                  <button onClick={clearCart} className="flex-1 border border-[#C9948E] text-gray-500 dark:text-white/60 py-3 rounded-2xl text-sm font-medium hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-colors">Vider le panier</button>
                  <button onClick={() => setStep("dates")} className="flex-1 bg-[#C9948E] dark:bg-[#C9948E] text-white py-3 rounded-2xl text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors flex items-center justify-center gap-2">
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
            <h2 style={DP} className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-6">Choisir les dates de location</h2>
            <div className="space-y-6">
              {items.map((item) => {
                const p = getProduct(item.productId)
                const eds = dateEdits[item.productId] || { start: "", end: "" }
                const maxQty = getMaxQty(item.productId)
                const atMax = item.qty >= maxQty
                const itemPrix = getPrixForProduct(p || { prix: 0 }, item.variantLabel)
                return (
                  <div key={`${item.productId}:${item.variantLabel || ""}`} className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                    <div className="flex items-center gap-3 mb-4">
                      <img src={p?.image || "/placeholder.svg"} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-medium text-sm text-[#2E2E2E] dark:text-neutral-100">{p?.nom}</p>
                        {item.variantLabel && <p className="text-[11px] text-[#C9948E] dark:text-[#E8B4AE] font-medium">{item.variantLabel}</p>}
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { if (item.qty > 1) updateItem(item.productId, item.variantLabel, { qty: item.qty - 1 }) }} className="w-5 h-5 bg-[#C9948E] dark:bg-[#C9948E] text-white rounded-full flex items-center justify-center hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors shadow-sm"><Minus size={9} /></button>
                            <span className="text-xs font-semibold w-5 text-center">{item.qty}</span>
                            <button
                              onClick={() => { if (!atMax) updateItem(item.productId, item.variantLabel, { qty: item.qty + 1 }) }}
                              disabled={atMax}
                              className="w-5 h-5 bg-[#C9948E] dark:bg-[#C9948E] text-white rounded-full flex items-center justify-center hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors shadow-sm disabled:opacity-30 disabled:cursor-not-allowed"
                            ><Plus size={9} /></button>
                          </div>
                          {eds.start && eds.end && maxQty < (p?.stock || 0) && (
                            <span className="text-[10px] text-amber-500 font-medium">
                              Plus que {maxQty} dispo. sur cette période
                            </span>
                          )}
                          {eds.start && eds.end && maxQty >= (p?.stock || 0) && maxQty > 0 && (
                            <span className="text-[10px] text-green-500 font-medium">
                              {maxQty} dispo.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <AvailabilityCalendar
                      productId={item.productId}
                      stock={p?.stock || 0}
                      dateStart={eds.start}
                      dateEnd={eds.end}
                      availableStock={availableStock[item.productId]}
                      onDateStartChange={(d) => setDateEdits((prev) => ({ ...prev, [item.productId]: { ...prev[item.productId], start: d, end: "" } }))}
                      onDateEndChange={(d) => setDateEdits((prev) => ({ ...prev, [item.productId]: { ...prev[item.productId], end: d } }))}
                    />
                    {eds.start && eds.end && (
                      <p className="text-xs text-green-500 mt-3 text-center">
                        ✓ {formatDateFr(eds.start)} → {formatDateFr(eds.end)} ({Math.ceil((new Date(eds.end).getTime() - new Date(eds.start).getTime()) / (1000 * 60 * 60 * 24))} jours)
                      </p>
                    )}
                    {rentalDatesMap[item.productId] && (
                      <RentalDatesCard rd={rentalDatesMap[item.productId]} montantTotal={totalTtc} />
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
            <div className="flex items-center justify-between gap-3 mb-6">
              <h2 style={DP} className="text-xl sm:text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">Vos informations</h2>
              <button onClick={() => router.push("/")} className="text-[10px] sm:text-xs text-[#C9948E] dark:text-[#E8B4AE] hover:text-[#B8807A] transition-colors underline flex-shrink-0">
                Retour à l&apos;accueil
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const errs = validateClientFields(); setFieldErrors(errs); setShowErrors(true); if (Object.keys(errs).length > 0) { const firstKey = Object.keys(errs)[0]; document.getElementById(`field-${firstKey}`)?.scrollIntoView({ behavior: "smooth", block: "center" }); } else { setStep("compte") } }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField fieldId="field-prenom" label="Prénom" value={client.prenom} onChange={(v) => { setClient((c) => ({ ...c, prenom: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.prenom; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} required error={showErrors ? fieldErrors.prenom : undefined} />
                <InputField fieldId="field-nom" label="Nom" value={client.nom} onChange={(v) => { setClient((c) => ({ ...c, nom: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.nom; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} required error={showErrors ? fieldErrors.nom : undefined} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField fieldId="field-email" label="Email" type="email" value={client.email} onChange={(v) => { setClient((c) => ({ ...c, email: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.email; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} required error={showErrors ? fieldErrors.email : undefined} />
                <InputField fieldId="field-telephone" label="Téléphone" type="tel" value={client.telephone} onChange={(v) => { setClient((c) => ({ ...c, telephone: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.telephone; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} required error={showErrors ? fieldErrors.telephone : undefined} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField fieldId="field-typeEvenement" label="Type d'événement" value={client.typeEvenement} onChange={(v) => { setClient((c) => ({ ...c, typeEvenement: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.typeEvenement; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} options={["Mariage", "Anniversaire", "Baptême", "Soirée d'entreprise", "Séminaire", "Autre"]} required error={showErrors ? fieldErrors.typeEvenement : undefined} />
                <InputField fieldId="field-dateEvenement" label="Date de l'événement" type="date" value={client.dateEvenement} onChange={(v) => { setClient((c) => ({ ...c, dateEvenement: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.dateEvenement; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} required error={showErrors ? fieldErrors.dateEvenement : undefined} />
              </div>
              <InputField fieldId="field-lieuEvenement" label="Lieu de l'événement (adresse)" value={client.lieuEvenement} onChange={(v) => { setClient((c) => ({ ...c, lieuEvenement: v })); if (showErrors) setFieldErrors((e) => { const n = { ...e }; delete n.lieuEvenement; return n }) }} onBlur={() => { if (showErrors) { const errs = validateClientFields(); setFieldErrors(errs) } }} required error={showErrors ? fieldErrors.lieuEvenement : undefined} />
              <InputField label="Nombre d'invités" type="number" value={String(client.nbInvites || "")} onChange={(v) => setClient((c) => ({ ...c, nbInvites: Number(v) }))} required />
              <div className="space-y-3">
                {/* Option retrait sur place */}
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
                  <div
                    className="relative w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer"
                    style={{
                      borderColor: !client.besoinLivraison ? "#C9948E" : "#d1d5db",
                      backgroundColor: !client.besoinLivraison ? "#C9948E" : "transparent",
                      borderRadius: "6px",
                    }}
                    onClick={() => setClient((c) => ({ ...c, besoinLivraison: false }))}
                  >
                    {!client.besoinLivraison && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <input type="radio" checked={!client.besoinLivraison} onChange={() => {}} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <label className="text-sm text-[#2E2E2E] dark:text-neutral-100 cursor-pointer flex items-center gap-2 min-w-0">
                    <Package size={16} className="text-[#C9948E] dark:text-[#E8B4AE] flex-shrink-0" />
                    <span className="truncate">Retrait sur place &mdash; <strong className="text-[#C9948E] dark:text-[#E8B4AE]">Gratuit</strong></span>
                  </label>
                </div>

                {/* Option livraison */}
                <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
                  <div
                    className="relative w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer"
                    style={{
                      borderColor: client.besoinLivraison ? "#C9948E" : "#d1d5db",
                      backgroundColor: client.besoinLivraison ? "#C9948E" : "transparent",
                      borderRadius: "6px",
                    }}
                    onClick={() => setClient((c) => ({ ...c, besoinLivraison: true }))}
                  >
                    {client.besoinLivraison && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <input type="radio" checked={client.besoinLivraison} onChange={() => {}} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  <label className="text-sm text-[#2E2E2E] dark:text-neutral-100 cursor-pointer flex items-center gap-2 min-w-0">
                    <Truck size={16} className="text-[#C9948E] dark:text-[#E8B4AE] flex-shrink-0" />
                    <span>Livraison</span>
                  </label>
                </div>

                {totalTtc >= 150 && client.besoinLivraison && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Livraison offerte (commande &ge; 150&euro;)
                  </div>
                )}

                {client.besoinLivraison && (
                  <div className="bg-white dark:bg-neutral-800 rounded-2xl p-4 sm:p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm space-y-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">Code postal de livraison</label>
                      <input
                        type="text"
                        value={client.codePostalLivraison || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 5)
                          setClient((c) => ({ ...c, codePostalLivraison: val }))
                        }}
                        placeholder="ex: 94000"
                        maxLength={5}
                        className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
                      />
                    </div>

                    {deliveryResult && deliveryResult.error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                        {deliveryResult.error}
                        {deliveryResult.error.includes("non disponible") && (
                          <a href="mailto:papillonrosebertha@gmail.com" className="block mt-2 text-[#C9948E] dark:text-[#E8B4AE] underline font-medium hover:text-[#B8807A] transition-colors">
                            Contactez-nous pour un devis personnalisé
                          </a>
                        )}
                      </div>
                    )}

                    {deliveryResult && deliveryResult.allowed && deliveryResult.distanceKm && (
                      <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl p-4 border border-black/[0.05]">
                        {deliveryResult.freeDelivery ? (
                          <div className="text-center py-2">
                            <p className="text-sm font-semibold text-green-600 mb-1">Livraison gratuite</p>
                            <p className="text-xs text-gray-400 dark:text-white/60">Commande &ge; 150&euro; — frais offerts</p>
                            <p className="text-[10px] text-gray-400 dark:text-white/60 mt-1">
                              📍 Depuis Créteil (94) — {deliveryResult.zoneLabel} ({deliveryResult.distanceKm} km)
                            </p>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-gray-400 dark:text-white/60 mb-2">Frais de livraison estimés</p>
                            <div className="space-y-1.5 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[#2E2E2E] dark:text-neutral-100">Forfait de base</span>
                                <span className="font-medium">{deliveryResult.baseFee.toFixed(2)} €</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#2E2E2E] dark:text-neutral-100">{deliveryResult.distanceKm} km × 1,50 €/km</span>
                                <span className="font-medium">{deliveryResult.perKmFee.toFixed(2)} €</span>
                              </div>
                              <div className="flex justify-between pt-2 border-t border-black/[0.1] font-bold text-[#C9948E] dark:text-[#E8B4AE]">
                                <span>Total livraison</span>
                                <span>{deliveryResult.totalFee.toFixed(2)} €</span>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-white/60 mt-2">
                              📍 Depuis Créteil (94) — {deliveryResult.zoneLabel}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    <InputField
                      label="Adresse complète de livraison (optionnel)"
                      value={client.adresseLivraison || ""}
                      onChange={(v) => setClient((c) => ({ ...c, adresseLivraison: v }))}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">Message (optionnel)</label>
                <textarea value={client.message || ""} onChange={(e) => setClient((c) => ({ ...c, message: e.target.value }))} rows={3} placeholder="Informations complémentaires..." className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors resize-none shadow-sm" style={{ WebkitTextFillColor: "#2E2E2E", caretColor: "#2E2E2E" } as React.CSSProperties} />
              </div>

              {/* Recap */}
              <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-2xl p-5">
                <p className="text-xs text-gray-400 dark:text-white/60 mb-2">Récapitulatif</p>
                {items.map((i) => {
                  const p = getProduct(i.productId)
                  const eds = dateEdits[i.productId]
                  return (
                    <div key={`${i.productId}:${i.variantLabel || ""}`} className="flex justify-between text-sm text-[#2E2E2E] dark:text-neutral-100">
                      <span>{p?.nom}{i.variantLabel ? ` (${i.variantLabel})` : ""} × {i.qty}</span>
                      <span className="text-gray-500 dark:text-white/60">{eds?.start ? formatDateFr(eds.start) : "..."} → {eds?.end ? formatDateFr(eds.end) : "..."}</span>
                    </div>
                  )
                })}
                <div className="border-t border-black/[0.1] mt-3 pt-3 flex justify-between font-bold">
                  <span className="text-[#666]">Acompte 30%</span>
                  <span className="text-[#C9948E] dark:text-[#E8B4AE]">{Number.isFinite(deposit) ? `${deposit.toFixed(2)} €` : "0,00 €"}</span>
                </div>
                {client.besoinLivraison && deliveryFee > 0 && (
                  <div className="flex justify-between text-xs text-[#C9948E] dark:text-[#E8B4AE] mt-1">
                    <span className="flex items-center gap-1"><Truck size={11} /> Livraison</span>
                    <span>{deliveryFee.toFixed(2)} €</span>
                  </div>
                )}
                {client.besoinLivraison && deliveryResult?.freeDelivery && (
                  <div className="flex justify-between text-xs text-green-600 mt-1">
                    <span className="flex items-center gap-1"><Truck size={11} /> Livraison</span>
                    <span>Offerte</span>
                  </div>
                )}
                {!client.besoinLivraison && (
                  <div className="flex justify-between text-xs text-green-600 mt-1">
                    <span className="flex items-center gap-1"><Package size={11} /> Retrait</span>
                    <span>Gratuit</span>
                  </div>
                )}
              </div>

              {/* Carte itinéraire livraison */}
              {client.besoinLivraison && client.adresseLivraison && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C9948E] dark:text-[#E8B4AE] mb-3 flex items-center gap-2">
                    <Truck size={13} />
                    Itinéraire de livraison
                  </p>
                  <DeliveryMap
                    destination={client.adresseLivraison}
                    postalCode={client.codePostalLivraison}
                    isDark={isDark}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-gray-400 dark:text-white/60">
                      {deliveryResult?.distanceKm ? `${deliveryResult.distanceKm} km` : ""}
                    </p>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=Cr%C3%A9teil+94000+France&destination=${encodeURIComponent(client.adresseLivraison + (client.codePostalLivraison ? ", " + client.codePostalLivraison : ""))}&travelmode=driving`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-[#C9948E] dark:text-[#E8B4AE] hover:underline"
                    >
                      Ouvrir dans Google Maps
                    </a>
                  </div>
                </div>
              )}

              {/* Dates de retrait / restitution */}
              {firstRentalDate && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#C9948E] dark:text-[#E8B4AE] mb-3 flex items-center gap-2">
                    <Package size={13} />
                    Retrait & Restitution
                  </p>
                  <div className="space-y-3">
                    {Object.entries(rentalDatesMap).map(([productId, rd]) => {
                      const prod = getProduct(Number(productId))
                      return (
                        <div key={productId} className="flex items-start gap-3 text-sm">
                          <div className="flex-1">
                            {prod && <p className="text-[10px] text-gray-400 dark:text-white/60 mb-0.5">{prod.nom}</p>}
                            <div className="flex items-center gap-2 mb-1">
                              <RotateCcw size={12} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                              <span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Retrait</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-white/60 ml-5">{formatDateLong(rd.pickupDate)}</p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <RotateCcw size={12} className="text-red-400" />
                              <span className="font-medium text-[#2E2E2E] dark:text-neutral-100">Restitution</span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-white/60 ml-5">Avant 12h le {formatDateLong(rd.returnDeadline)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Barème des pénalités */}
              {firstRentalDate && (
                <div className="bg-amber-50 rounded-2xl p-5 border border-amber-200">
                  <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-3 flex items-center gap-2">
                    <AlertTriangle size={13} />
                    Barème des pénalités de retard
                  </p>
                  <div className="space-y-2 text-xs text-amber-800">
                    <div className="flex justify-between">
                      <span>Jour 1 de retard</span>
                      <span className="font-semibold">+10% du montant total</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jour 2 de retard</span>
                      <span className="font-semibold">+40% (10% + 30%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jour 3 et au-delà</span>
                      <span className="font-semibold">+30% par jour supplémentaire</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-200">
                      <span>Plafond maximum</span>
                      <span className="font-bold text-amber-600">50% du montant total</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-amber-600/70 mt-3 leading-relaxed">
                    Formule : <code>min(10% + (jours - 1) × 30%, 50%)</code> — La restitution doit intervenir avant 12h à la date limite.
                  </p>
                </div>
              )}

              <p className="text-xs text-gray-400 dark:text-white/60 text-center">
                Vous recevrez votre devis sous <strong className="text-[#C9948E] dark:text-[#E8B4AE]">24h ouvrées</strong>
              </p>

              {/* Encart conditions de location */}
              <div className="bg-[#2E2E2E] dark:bg-neutral-800 rounded-2xl p-5 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#C9948E] dark:text-[#E8B4AE] mb-3">
                  Conditions de location
                </p>
                <ul className="text-xs text-white/60 space-y-1.5 mb-4">
                  <li>&#8226; Un chèque de caution, d&apos;un montant équivalent au prix d&apos;achat du produit loué, sera demandé lors de la remise du matériel et restitué après vérification de son bon état au retour.</li>
                  <li>&#8226; Le materiel loue doit etre restitue en bon etat. Toute casse, perte, vol ou salissure irreversible entrainera des penalites.</li>
                  <li>&#8226; Remplacement a valeur a neuf en cas de casse totale ou de perte.</li>
                  <li>&#8226; Penalite de retard : 10% le 1er jour, puis +30% par jour supplémentaire, plafond 50%.</li>
                  <li>&#8226; Annulation -30j : remboursement total | -15j : 50% | -7j : aucun remboursement.</li>
                </ul>
                <a
                  href="/conditions-location"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#C9948E] dark:text-[#E8B4AE] underline hover:text-white transition-colors"
                >
                  Lire les conditions completes
                </a>
              </div>

              {/* Checkbox obligatoire */}
              <label className="flex items-start gap-3 bg-white dark:bg-neutral-800 rounded-2xl px-5 py-4 border border-black/[0.07] dark:border-white/[0.08] shadow-sm cursor-pointer select-none">
                <div
                  className="relative w-5 h-5 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-colors mt-0.5"
                  style={{
                    borderColor: acceptedConditions ? "#C9948E" : "#d1d5db",
                    backgroundColor: acceptedConditions ? "#C9948E" : "transparent",
                    borderRadius: "6px",
                  }}
                  onClick={() => setAcceptedConditions(!acceptedConditions)}
                >
                  {acceptedConditions && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    checked={acceptedConditions}
                    onChange={() => setAcceptedConditions(!acceptedConditions)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <span className="text-sm text-[#2E2E2E] dark:text-neutral-100">
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <a href="/conditions-location" target="_blank" rel="noopener noreferrer" className="text-[#C9948E] dark:text-[#E8B4AE] underline font-medium">
                    conditions de location
                  </a>
                </span>
              </label>

              <button type="submit" disabled={!validateClient() || !acceptedConditions || loading}
                className="w-full bg-[#C9948E] dark:bg-[#C9948E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
                {loading ? "Envoi en cours..." : "Continuer"}
              </button>
            </form>
          </div>
        )}

        {step === "compte" && (
          <div>
            <BackButton onClick={() => setStep("client")} label="Retour aux informations" />
            <h2 style={DP} className="text-xl sm:text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-6">Créez votre compte</h2>

            {alreadyConnected === null ? (
              <div className="text-center py-12">
                <Loader2 size={24} className="animate-spin mx-auto text-[#C9948E] mb-3" />
                <p className="text-sm text-gray-400">Vérification de votre session…</p>
              </div>
            ) : alreadyConnected === true ? (
              <AccountAutoAdvance onAdvance={handleCreateBooking} />
            ) : (
              <>
                {/* Toggle register / login */}
                <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-neutral-900 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={() => { setAccountMode("register"); setAccountError("") }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${accountMode === "register" ? "bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 shadow-sm" : "text-gray-400 dark:text-white/60 hover:text-[#2E2E2E] dark:hover:text-neutral-100"}`}
                  >
                    <UserPlus size={15} />
                    Créer un compte
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAccountMode("login"); setAccountError("") }}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${accountMode === "login" ? "bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 shadow-sm" : "text-gray-400 dark:text-white/60 hover:text-[#2E2E2E] dark:hover:text-neutral-100"}`}
                  >
                    <LogIn size={15} />
                    Se connecter
                  </button>
                </div>

                {accountError && (
                  <div className="bg-red-50 border border-red-200 text-red-500 text-sm rounded-2xl px-5 py-3 mb-4">{accountError}</div>
                )}

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setAccountError("")
                    if (accountMode === "register" && accountPassword !== accountPasswordConfirm) {
                      setAccountError("Les mots de passe ne correspondent pas")
                      return
                    }
                    if (accountMode === "register" && (accountPassword.length < 6 || accountPassword.length > 128)) {
                      setAccountError("Le mot de passe doit contenir entre 6 et 128 caractères")
                      return
                    }
                    setAccountLoading(true)
                    try {
                      const url = accountMode === "register" ? "/api/customer/register" : "/api/customer/login"
                      const body = accountMode === "register"
                        ? { email: client.email, password: accountPassword, prenom: client.prenom, nom: client.nom }
                        : { email: client.email, password: accountPassword }
                      const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error || "Une erreur est survenue")
                      setAlreadyConnected(true)
                    } catch (err: any) {
                      setAccountError(err.message)
                    } finally {
                      setAccountLoading(false)
                    }
                  }}
                  className="space-y-4"
                >
                  {/* Pré-remplissage : champs en lecture seule */}
                  <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Prénom</span>
                      <span className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{client.prenom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Nom</span>
                      <span className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{client.nom}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Email</span>
                      <span className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{client.email}</span>
                    </div>
                  </div>

                  <InputField
                    label="Mot de passe"
                    type="password"
                    value={accountPassword}
                    onChange={setAccountPassword}
                    required
                  />

                  {accountMode === "register" && (
                    <InputField
                      label="Confirmer le mot de passe"
                      type="password"
                      value={accountPasswordConfirm}
                      onChange={setAccountPasswordConfirm}
                      required
                    />
                  )}

                  <button type="submit" disabled={accountLoading}
                    className="w-full bg-[#C9948E] dark:bg-[#C9948E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {accountLoading ? <Loader2 size={16} className="animate-spin" /> : accountMode === "register" ? <UserPlus size={16} /> : <LogIn size={16} />}
                    {accountLoading ? "En cours..." : accountMode === "register" ? "Créer mon compte" : "Se connecter"}
                  </button>
                </form>

                <p className="text-center text-xs text-gray-400 dark:text-white/60 mt-4">
                  En créant un compte, vous pourrez suivre vos devis et vos réservations depuis votre espace client.
                </p>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Sub-components ───

function AccountAutoAdvance({ onAdvance }: { onAdvance: () => void }) {
  useEffect(() => { onAdvance() }, [])
  return (
    <div className="text-center py-12">
      <Loader2 size={24} className="animate-spin mx-auto text-[#C9948E] mb-3" />
      <p className="text-sm text-gray-400">Compte connecté, préparation de votre devis…</p>
    </div>
  )
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/60 hover:text-[#C9948E] dark:hover:text-[#E8B4AE] transition-colors mb-6">
      <ArrowLeft size={14} /> {label}
    </button>
  )
}

function NextButton({ onClick, disabled, label }: { onClick: () => void; disabled: boolean; label: string }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full bg-[#C9948E] dark:bg-[#C9948E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors mt-6 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
      {label} <ArrowRight size={14} />
    </button>
  )
}

function InputField({ label, type = "text", value, onChange, required, error, fieldId, onBlur }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; required?: boolean; error?: string; fieldId?: string; onBlur?: () => void
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">{label}{required && <span className="text-red-400 dark:text-red-500 ml-0.5">*</span>}</label>
      <input id={fieldId} type={type} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} required={required}
        className={`w-full bg-white dark:bg-neutral-800 border rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm ${error ? 'border-red-400 dark:border-red-500' : 'border-black/[0.08] dark:border-white/[0.08]'}`}
        style={{ color: "#2E2E2E", WebkitTextFillColor: "#2E2E2E", caretColor: "#2E2E2E" } as React.CSSProperties} />
      {error && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function SelectField({ label, value, onChange, options, required, error, fieldId, onBlur }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; required?: boolean; error?: string; fieldId?: string; onBlur?: () => void
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">{label}{required && <span className="text-red-400 dark:text-red-500 ml-0.5">*</span>}</label>
      <select id={fieldId} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} required={required}
        className={`w-full bg-white dark:bg-neutral-800 border rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm ${error ? 'border-red-400 dark:border-red-500' : 'border-black/[0.08] dark:border-white/[0.08]'}`}
        style={{ color: "#2E2E2E", WebkitTextFillColor: "#2E2E2E" } as React.CSSProperties}>
        <option value="">Sélectionner</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      {error && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

function fmt(n: number) {
  return Number.isFinite(n) ? `${n.toFixed(2)} €` : "0,00 €"
}

function Totals({ totalHt, totalTtc, deposit, deliveryFee }: { totalHt: number; totalTtc: number; deposit: number; deliveryFee?: number }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08] mb-6">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500 dark:text-white/70">Total HT</span>
        <span className="font-semibold">{fmt(totalHt)}</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500 dark:text-white/70">TVA (20%)</span>
        <span className="font-semibold">{fmt(totalTtc - totalHt)}</span>
      </div>
      {typeof deliveryFee === "number" && deliveryFee > 0 && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400 dark:text-white/60 flex items-center gap-1.5">
            <Truck size={12} /> Livraison
          </span>
          <span className="font-semibold text-[#C9948E] dark:text-[#E8B4AE]">{fmt(deliveryFee)}</span>
        </div>
      )}
      <div className="flex justify-between text-lg font-bold text-[#2E2E2E] dark:text-neutral-100 pt-2 border-t border-black/[0.07] dark:border-white/[0.08]">
        <span>Total TTC</span>
        <span>{typeof deliveryFee === "number" && deliveryFee > 0 ? fmt(totalTtc + deliveryFee) : fmt(totalTtc)}</span>
      </div>
      <div className="flex justify-between text-sm mt-1 text-[#C9948E] dark:text-[#E8B4AE]">
        <span>Acompte 30%</span>
        <span className="font-semibold">{fmt(deposit)}</span>
      </div>
    </div>
  )
}

function RentalDatesCard({ rd, montantTotal }: { rd: RentalDates; montantTotal: number }) {
  const fee1 = calculateLateFee(1, montantTotal)
  const fee2 = calculateLateFee(2, montantTotal)
  const fee3 = calculateLateFee(3, montantTotal)
  const feeMax = calculateLateFee(10, montantTotal)

  return (
    <div className="mt-3 bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl p-3 border border-black/[0.05]">
      <p className="text-[10px] uppercase tracking-wider text-[#C9948E] dark:text-[#E8B4AE] font-semibold mb-2">{rd.ruleLabel}</p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-400 dark:text-white/60 mb-0.5">Retrait</p>
          <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">{formatDateLong(rd.pickupDate)}</p>
        </div>
        <div>
          <p className="text-gray-400 dark:text-white/60 mb-0.5">Restitution avant 12h</p>
          <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">{formatDateLong(rd.returnDeadline)}</p>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-black/[0.05] text-[10px] text-gray-400 dark:text-white/60">
        <span className="text-amber-600 font-medium">Retard :</span> +{fee1.taux * 100}%jour 1 ({fee1.montant.toFixed(2)}€) → +{fee2.taux * 100}%jour 2 ({fee2.montant.toFixed(2)}€) → plafond {feeMax.taux * 100}% ({feeMax.montant.toFixed(2)}€)
      </div>
    </div>
  )
}
