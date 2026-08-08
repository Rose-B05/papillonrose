"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, Pencil, Send, XCircle, FileText, Download } from "lucide-react"

interface DevisDecorationRow {
  id: string
  numero: string
  token_public: string
  type_document: string
  client_nom: string
  client_email: string
  client_telephone?: string
  titre_projet: string
  date_evenement_debut: string
  date_evenement_fin?: string
  statut: string
  total_ht: number
  article_count: number
  date_creation: string
  date_envoi?: string
  montant_accompte: number
  date_echeance_solde?: string
  total_verse: number
}

const STATUT_FILTERS = [
  { label: "Tous", value: "all" },
  { label: "Brouillon", value: "brouillon" },
  { label: "Envoyé", value: "envoye" },
  { label: "Acompte reçu", value: "acompte_verse" },
  { label: "Soldée", value: "solde" },
  { label: "Annulée", value: "annule" },
]

const STATUT_LABELS: Record<string, string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé",
  acompte_verse: "Acompte reçu",
  solde: "Soldée",
  annule: "Annulée",
  expired: "Expiré",
}

const STATUT_COLORS: Record<string, string> = {
  brouillon: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300",
  envoye: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-300",
  acompte_verse: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  solde: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  annule: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  expired: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}

function formatEUR(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`
}

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function isUrgent(dateEvenement: string, soldeRestant: number): boolean {
  if (soldeRestant <= 0) return false
  const now = new Date()
  const event = new Date(dateEvenement)
  const diffDays = Math.ceil((event.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return diffDays >= 0 && diffDays <= 7
}

export default function DevisDecorationListePage() {
  const router = useRouter()
  const [devis, setDevis] = useState<DevisDecorationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [sendingId, setSendingId] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/devis-decoration")
      .then((r) => {
        if (r.status === 401) { router.push("/admin/login"); return }
        return r.json()
      })
      .then((data) => { if (data) setDevis(data.devis || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [router])

  const filtered = devis
    .filter((d) => {
      if (filter !== "all" && d.statut !== filter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          d.numero.toLowerCase().includes(q) ||
          d.client_nom.toLowerCase().includes(q) ||
          d.client_email.toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      if (a.date_evenement_debut && b.date_evenement_debut) {
        return new Date(a.date_evenement_debut).getTime() - new Date(b.date_evenement_debut).getTime()
      }
      if (a.date_evenement_debut) return -1
      if (b.date_evenement_debut) return 1
      return new Date(b.date_creation).getTime() - new Date(a.date_creation).getTime()
    })

  async function handleResendEmail(d: DevisDecorationRow) {
    setSendingId(d.id)
    try {
      const res = await fetch(`/api/devis-decoration/${d.id}?action=resend`, { method: "POST" })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        alert(data?.error || "Erreur lors de l'envoi")
      }
    } catch {
      alert("Erreur lors de l'envoi")
    }
    setSendingId(null)
  }

  async function handleCancel(id: string) {
    if (!confirm("Annuler ce devis ?")) return
    try {
      await fetch(`/api/devis-decoration/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "annule" }),
      })
      setDevis((prev) => prev.map((d) => d.id === id ? { ...d, statut: "annule" } : d))
    } catch {}
  }

  async function handleDownloadPdf(d: DevisDecorationRow) {
    try {
      const res = await fetch(`/api/devis-decoration/${d.id}/pdf`)
      if (!res.ok) return
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${d.type_document === "facture" ? "Facture" : "Devis"}-${d.numero}.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      a.remove()
    } catch {}
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <p className="text-sm text-secondary-text dark:text-white/60">
            {filtered.length} devis{filtered.length > 1 ? "" : ""}{filter !== "all" ? ` (filtré)` : ""}
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/devis-decoration/nouveau")}
          className="px-4 py-2 bg-[#c27a72] text-white rounded-xl text-sm font-medium hover:bg-[#a86660] transition-colors"
        >
          + Nouveau devis
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Rechercher un devis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c27a72]/30"
        />
        <div className="flex gap-1 flex-wrap">
          {STATUT_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-[#c27a72] text-white"
                  : "bg-white dark:bg-neutral-800 text-secondary-text dark:text-white/60 hover:bg-gray-100 dark:hover:bg-neutral-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-secondary-text dark:text-white/60">Chargement…</div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] overflow-hidden">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-secondary-text dark:text-white/60">
              Aucun devis pour le moment
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                    <th className="text-left py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider">N°</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider">Client</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider hidden sm:table-cell">Dates</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider hidden md:table-cell">Articles</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider">Total TTC</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider">Statut</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-secondary-text dark:text-white/60 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => {
                    const soldeRestant = d.total_ht - d.total_verse
                    const urgent = isUrgent(d.date_evenement_debut, soldeRestant)
                    return (
                      <tr
                        key={d.id}
                        className="border-b border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-3 px-4">
                          <Link href={`/admin/devis-decoration/${d.id}`} className="font-mono text-xs text-[#c27a72] hover:underline">
                            {d.numero}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">{d.client_nom}</p>
                              <p className="text-xs text-secondary-text dark:text-white/50">{d.client_email}</p>
                            </div>
                            {urgent && (
                              <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" title="Solde impayé, événement dans &lt;7 jours">
                                URGENT
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 hidden sm:table-cell">
                          <p className="text-xs text-secondary-text dark:text-white/60">
                            {formatDate(d.date_evenement_debut)}
                            {d.date_evenement_fin && d.date_evenement_fin !== d.date_evenement_debut && (
                              <> → {formatDate(d.date_evenement_fin)}</>
                            )}
                          </p>
                        </td>
                        <td className="py-3 px-4 hidden md:table-cell">
                          <p className="text-xs text-secondary-text dark:text-white/60">
                            {d.article_count} article{d.article_count > 1 ? "s" : ""}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-[#c27a72] dark:text-[#d4968e] whitespace-nowrap">
                          {formatEUR(d.total_ht)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUT_COLORS[d.statut] || STATUT_COLORS.brouillon}`}>
                              {STATUT_LABELS[d.statut] || d.statut}
                            </span>
                            {d.type_document === "facture" && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#c27a72]/10 text-[#c27a72]">
                                Facture
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              href={`/admin/devis-decoration/${d.id}`}
                              className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-secondary-text hover:text-[#c27a72] transition-colors"
                              title="Voir"
                            >
                              <Eye size={15} />
                            </Link>
                            <Link
                              href={`/admin/devis-decoration/${d.id}?edit=1`}
                              className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-secondary-text hover:text-blue-500 transition-colors"
                              title="Modifier"
                            >
                              <Pencil size={15} />
                            </Link>
                            {d.type_document === "facture" && (
                              <button
                                onClick={() => handleDownloadPdf(d)}
                                className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-secondary-text hover:text-[#c27a72] transition-colors"
                              >
                                <FileText size={15} />
                              </button>
                            )}
                            {d.statut !== "annule" && d.statut !== "brouillon" && (
                              <button
                                onClick={() => handleResendEmail(d)}
                                disabled={sendingId === d.id}
                                className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-secondary-text hover:text-green-600 transition-colors disabled:opacity-50"
                                title="Renvoyer l'email"
                              >
                                <Send size={15} />
                              </button>
                            )}
                            {d.statut !== "annule" && (
                              <button
                                onClick={() => handleCancel(d.id)}
                                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-secondary-text hover:text-red-500 transition-colors"
                                title="Annuler"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
