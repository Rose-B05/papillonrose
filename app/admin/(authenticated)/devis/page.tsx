"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import DevisTable from "@/components/admin/devis/DevisTable"

const STATUT_FILTERS: Array<{ label: string; value: string }> = [
  { label: "Tous", value: "all" },
  { label: "En attente", value: "pending-quote" },
  { label: "Devis envoyé", value: "quote-sent" },
  { label: "Acompte en attente", value: "deposit-pending" },
  { label: "Confirmée", value: "confirmed" },
  { label: "Annulée", value: "cancelled" },
  { label: "Restituée", value: "returned" },
]

export default function DevisListePage() {
  const router = useRouter()
  const [devis, setDevis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [returningId, setReturningId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/admin/devis")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login")
          return
        }
        return r.json()
      })
      .then((data) => {
        if (data) setDevis(data.devis || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const filtered = devis.filter((d) => {
    if (filter !== "all" && d.statut !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.quoteNumber.toLowerCase().includes(q) ||
        (d.client?.nom || "").toLowerCase().includes(q) ||
        (d.client?.prenom || "").toLowerCase().includes(q) ||
        (d.client?.email || "").toLowerCase().includes(q)
      )
    }
    return true
  })

  async function handleStatusChange(id: string, statut: string) {
    await fetch(`/api/admin/devis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })
    setDevis((prev) => prev.map((d) => (d.id === id ? { ...d, statut } : d)))
  }

  async function handleDelete(id: string) {
    await fetch(`/api/admin/devis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: "cancelled" }),
    })
    setDevis((prev) => prev.map((d) => (d.id === id ? { ...d, statut: "cancelled" } : d)))
  }

  async function handleSend(id: string) {
    setSendingId(id)
    try {
      const res = await fetch("/api/admin/devis/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        setDevis((prev) =>
          prev.map((d) =>
            d.id === id ? { ...d, statut: "quote-sent" } : d
          )
        )
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de l'envoi")
      }
    } catch {
      alert("Erreur lors de l'envoi")
    }
    setSendingId(null)
  }

  async function handleMarkReturned(id: string) {
    if (!confirm("Confirmer la restitution ? Le stock sera incrémenté.")) return
    setReturningId(id)
    try {
      const res = await fetch("/api/admin/returned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: id }),
      })
      if (res.ok) {
        setDevis((prev) =>
          prev.map((d) => (d.id === id ? { ...d, statut: "returned" } : d))
        )
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de la restitution")
      }
    } catch {
      alert("Erreur lors de la restitution")
    }
    setReturningId(null)
  }

  return (
    <AdminShell title="Devis">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-white/60">
              {filtered.length} réservation{filtered.length > 1 ? "s" : ""}{filter !== "all" ? ` (filtré)` : ""}
            </p>
          </div>
          <button
            onClick={() => router.push("/admin/devis/new")}
            className="px-4 py-2 bg-[#C9948E] text-white rounded-xl text-sm font-medium hover:bg-[#B8807A] transition-colors"
          >
            + Nouvelle réservation
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Rechercher une réservation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/30"
          />
          <div className="flex gap-1 flex-wrap">
            {STATUT_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "bg-[#C9948E] text-white"
                    : "bg-white dark:bg-neutral-800 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-neutral-700"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-white/60">Chargement…</div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] overflow-hidden">
            <DevisTable
              devis={filtered}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onSend={handleSend}
              onMarkReturned={handleMarkReturned}
              sendingId={sendingId}
            />
          </div>
        )}
      </div>
    </AdminShell>
  )
}
