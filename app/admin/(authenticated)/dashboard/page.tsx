"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  FileText,
  Package,
  Euro,
  Activity,
  ArrowRight,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  PackagePlus,
  Mail,
} from "lucide-react"

interface DashboardData {
  devisEnAttente: number
  outOfStock: number
  revenueThisMonth: number
  revenueLastMonth: number
  totalDevis: number
  totalProducts: number
  activity: Array<{
    id: string
    type: string
    description: string
    reference?: string
    createdAt: string
  }>
}

const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  devis_created: FileText,
  devis_sent: Send,
  devis_accepted: CheckCircle,
  devis_refused: XCircle,
  product_created: PackagePlus,
  product_updated: Package,
  product_deleted: Package,
  contact_received: Mail,
  quote_created: FileText,
  quote_sent: Send,
}

const ACTIVITY_COLORS: Record<string, string> = {
  devis_created: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  devis_sent: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
  devis_accepted: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300",
  devis_refused: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  product_created: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
  product_updated: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300",
  product_deleted: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300",
  contact_received: "bg-[#C9948E]/15 text-[#C9948E]",
  quote_created: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300",
  quote_sent: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300",
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return "à l'instant"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `il y a ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `il y a ${diffH}h`
  const diffJ = Math.floor(diffH / 24)
  if (diffJ < 7) return `il y a ${diffJ}j`
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => {
        if (r.status === 401) {
          router.push("/admin/login")
          return
        }
        return r.json()
      })
      .then((d) => {
        if (d) setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/admin/dashboard")
        .then((r) => r.json())
        .then((d) => { if (d && !d.error) setData(d) })
        .catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const revenueVariation = data && data.revenueLastMonth > 0
    ? Math.round(((data.revenueThisMonth - data.revenueLastMonth) / data.revenueLastMonth) * 100)
    : null

  return (
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-white/60">Chargement…</div>
        ) : !data ? (
          <div className="text-center py-16 text-gray-400 dark:text-white/60">Erreur de chargement</div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {/* Devis en attente */}
              <Link
                href="/admin/devis"
                className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-amber-600 dark:text-amber-300" />
                  </div>
                  <ArrowRight size={14} className="text-gray-300 dark:text-white/30 group-hover:text-[#C9948E] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {data.devisEnAttente}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Devis en attente</p>
              </Link>

              {/* Produits en rupture */}
              <Link
                href="/admin/contenu/produits"
                className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                    <Package size={18} className="text-red-600 dark:text-red-300" />
                  </div>
                  <ArrowRight size={14} className="text-gray-300 dark:text-white/30 group-hover:text-[#C9948E] transition-colors" />
                </div>
                <p className="text-3xl font-bold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {data.outOfStock}
                </p>
                <p className="text-xs text-gray-500 dark:text-white/60 mt-1">Produits en rupture</p>
              </Link>

              {/* Chiffre d'affaires */}
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-[#C9948E]/15 dark:bg-[#C9948E]/15 rounded-xl flex items-center justify-center">
                    <Euro size={18} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                  </div>
                  {revenueVariation !== null && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      revenueVariation >= 0
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {revenueVariation >= 0 ? "+" : ""}{revenueVariation}% vs mois dernier
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
                  {data.revenueThisMonth.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
                </p>
                <p className="text-xs text-gray-500 dark:text-white/60 mt-1">CA du mois en cours</p>
              </div>
            </div>

            {/* Activity Feed */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
              <div className="px-5 py-4 border-b border-black/[0.05] dark:border-white/[0.06] flex items-center gap-2">
                <Activity size={16} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Activité récente</h2>
              </div>
              {data.activity.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-white/50">
                  Aucune activité pour le moment
                </div>
              ) : (
                <div className="divide-y divide-black/[0.04] dark:divide-white/[0.05]">
                  {data.activity.map((event) => {
                    const Icon = ACTIVITY_ICONS[event.type] || Activity
                    const colorClass = ACTIVITY_COLORS[event.type] || "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-white/70"
                    return (
                      <div key={event.id} className="px-5 py-3 flex items-center gap-3 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#2E2E2E] dark:text-neutral-100 truncate">{event.description}</p>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-white/50 whitespace-nowrap flex-shrink-0">
                          {relativeTime(event.createdAt)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
  )
}
