"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Mail, CheckCircle, XCircle, RefreshCcw, Search, Filter } from "lucide-react"
import type { EmailLog } from "@/lib/types"

const TYPE_LABELS: Record<string, string> = {
  booking_confirmation_admin: "Confirmation réservation (admin)",
  booking_confirmation_client: "Confirmation réservation (client)",
  quote_confirmation: "Devis reçu",
  quote_sent: "Devis envoyé",
  quote_stock_confirmed: "Stock confirmé",
  quote_stock_refused: "Stock refusé",
  payment_confirmation: "Paiement reçu",
  admin_booking_notification: "Nouvelle réservation (admin)",
  balance_paid: "Solde payé",
  balance_payment_link: "Lien de paiement solde",
  welcome: "Bienvenue",
  password_reset: "Réinitialisation mot de passe",
  quote_expiry: "Expiration devis",
  browse_reminder: "Rappel de consultation",
  cancellation: "Annulation",
  cancellation_admin: "Annulation (admin)",
  cancelled_after_event: "Annulation après événement",
  late_alert: "Relance retard",
  quote_signed: "Devis signé",
  quote_signed_admin: "Devis signé (admin)",
  quote_reminder: "Relance devis",
  chatbot_lead: "Lead chatbot",
}

const TYPE_COLORS: Record<string, string> = {
  booking_confirmation_admin: "bg-blue-50 text-blue-600",
  booking_confirmation_client: "bg-blue-50 text-blue-600",
  quote_confirmation: "bg-purple-50 text-purple-600",
  quote_sent: "bg-purple-50 text-purple-600",
  payment_confirmation: "bg-green-50 text-green-600",
  balance_paid: "bg-green-50 text-green-600",
  cancellation: "bg-red-50 text-red-600",
  cancellation_admin: "bg-red-50 text-red-600",
  cancelled_after_event: "bg-red-50 text-red-600",
  late_alert: "bg-orange-50 text-orange-600",
  quote_expiry: "bg-amber-50 text-amber-600",
  browse_reminder: "bg-teal-50 text-teal-600",
  quote_signed: "bg-emerald-50 text-emerald-600",
  quote_signed_admin: "bg-emerald-50 text-emerald-600",
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function NotificationsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("")
  const [search, setSearch] = useState("")

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/email-logs")
      if (res.status === 401) { router.push("/admin/login"); return }
      const data = await res.json()
      setLogs(data.logs || [])
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [router])

  const filtered = logs.filter((log) => {
    if (filter && log.type !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        log.subject.toLowerCase().includes(q) ||
        log.to.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q)
      )
    }
    return true
  })

  const types = [...new Set(logs.map((l) => l.type))].sort()
  const sentCount = logs.filter((l) => l.status === "sent").length
  const failedCount = logs.filter((l) => l.status === "failed").length

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
            Notifications
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/60 mt-1">
            Historique des emails envoyés par le système
          </p>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-500 dark:text-white/70 bg-white dark:bg-neutral-800 rounded-xl border border-black/[0.07] dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        >
          <RefreshCcw size={13} />
          Actualiser
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-black/[0.07] dark:border-white/[0.08]">
          <p className="text-xs text-gray-400 dark:text-white/60 mb-1">Total emails</p>
          <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100">{logs.length}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-black/[0.07] dark:border-white/[0.08]">
          <p className="text-xs text-gray-400 dark:text-white/60 mb-1">Envoyés</p>
          <p className="text-2xl font-bold text-green-600">{sentCount}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-black/[0.07] dark:border-white/[0.08]">
          <p className="text-xs text-gray-400 dark:text-white/60 mb-1">Échoués</p>
          <p className="text-2xl font-bold text-red-500">{failedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] rounded-xl outline-none focus:border-[#C9948E]/50 transition-colors"
          />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] rounded-xl outline-none focus:border-[#C9948E]/50 transition-colors appearance-none cursor-pointer"
          >
            <option value="">Tous les types</option>
            {types.map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-white/60">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Bell size={40} className="mx-auto text-gray-300 dark:text-neutral-600 mb-4" />
          <p className="text-gray-400 dark:text-white/60">
            {logs.length === 0 ? "Aucun email envoyé pour l'instant" : "Aucun résultat pour cette recherche"}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden">
          <div className="divide-y divide-black/[0.05] dark:divide-white/[0.06]">
            {filtered.map((log) => (
              <div key={log.id} className="px-5 py-4 flex items-start gap-4 hover:bg-[#F8F5F0] dark:hover:bg-neutral-700/50 transition-colors">
                <div className="mt-0.5">
                  {log.status === "sent" ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-red-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[log.type] || "bg-gray-100 text-gray-600"}`}>
                      {TYPE_LABELS[log.type] || log.type}
                    </span>
                    {log.bookingId && (
                      <span className="text-[10px] text-gray-400 dark:text-white/50">
                        #{log.bookingId.slice(0, 8)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 truncate">
                    {log.subject}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white/50 mt-0.5">
                    <Mail size={10} className="inline mr-1" />
                    {log.to}
                  </p>
                  {log.error && (
                    <p className="text-xs text-red-500 mt-1">Erreur : {log.error}</p>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 dark:text-white/50 whitespace-nowrap">
                  {formatDate(log.sentAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
