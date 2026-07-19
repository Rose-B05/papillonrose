"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { produits } from "@/data/produits"

interface BookingItem {
  productId: number
  qty: number
  dateStart: string
  dateEnd: string
  variantLabel?: string
}

interface Booking {
  id: string
  items: BookingItem[]
  client: {
    nom: string
    prenom: string
    email: string
  }
  totalTtc: number
  status: string
  createdAt: string
  updatedAt: string
  returnedAt?: string
}

export default function RestitutionsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [returningId, setReturningId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
  }, [])

  async function fetchBookings() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/active-bookings")
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch {
      // ignore
    }
    setLoading(false)
  }

  async function handleReturn(bookingId: string) {
    if (!confirm("Confirmer la restitution ? Le stock sera incrémenté.")) return
    setReturningId(bookingId)
    try {
      const res = await fetch("/api/admin/returned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      })
      if (res.ok) {
        await fetchBookings()
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de la restitution")
      }
    } catch {
      alert("Erreur lors de la restitution")
    }
    setReturningId(null)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function getProductName(id: number) {
    return produits.find((p) => p.id === id)?.nom || `Produit #${id}`
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">Restitutions</h1>
          <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
            {bookings.length} location{bookings.length !== 1 ? "s" : ""} en cours
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-neutral-500">Chargement…</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 dark:text-neutral-500 text-lg mb-2">Aucune location en cours</p>
            <p className="text-sm text-gray-400 dark:text-neutral-500">Toutes les réservations ont été restituées.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-[#2E2E2E] dark:text-neutral-100">
                      #{booking.id}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-neutral-500">
                      {booking.client.prenom} {booking.client.nom}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-medium">
                    En cours
                  </span>
                </div>

                <div className="space-y-1.5 mb-4">
                  {booking.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-[#2E2E2E] dark:text-neutral-100">
                        {getProductName(item.productId)}
                        {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                        {" × "}{item.qty}
                      </span>
                      <span className="text-gray-400 dark:text-neutral-500 text-xs">
                        {formatDate(item.dateStart)} → {formatDate(item.dateEnd)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-black/[0.05]">
                  <p className="text-sm text-gray-500 dark:text-neutral-500">
                    Total : <span className="font-semibold text-[#2E2E2E] dark:text-neutral-100">{booking.totalTtc.toFixed(2)} €</span>
                  </p>
                  <button
                    onClick={() => handleReturn(booking.id)}
                    disabled={returningId === booking.id}
                    className="px-4 py-2 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-xl hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors disabled:opacity-50"
                  >
                    {returningId === booking.id ? "Restitution…" : "Valider la restitution"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}