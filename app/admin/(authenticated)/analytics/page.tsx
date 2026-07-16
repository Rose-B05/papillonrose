"use client"

import { useState, useEffect, useCallback } from "react"

import { BarChart3, Users, Eye, RefreshCw, AlertTriangle } from "lucide-react"

interface AnalyticsData {
  visitors: number
  pageViews: number
  topPages: { page: string; views: number }[]
}

type Period = "7" | "30" | "90"

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7", label: "7 jours" },
  { value: "30", label: "30 jours" },
  { value: "90", label: "90 jours" },
]

function formatNumber(n: number) {
  return n.toLocaleString("fr-FR")
}

const CARD_STYLES =
  "bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]"

const TABLE_HEADER =
  "text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium"

const TABLE_CELL = "px-5 py-3 text-sm"

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (p: Period) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?period=${p}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.details || body.error || `Erreur ${res.status}`)
      }
      setData(await res.json())
    } catch (err: any) {
      setError(err?.message || "Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData(period)
  }, [period, fetchData])

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-[#C8A97E] dark:text-amber-400" />
              Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
              Trafic et visiteurs — Vercel Web Analytics
            </p>
          </div>
          <div className="flex items-center gap-2">
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  period === opt.value
                    ? "bg-[#C8A97E] dark:bg-amber-600 text-white"
                    : "bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-black/[0.07] dark:border-white/[0.08] hover:bg-gray-50 dark:hover:bg-neutral-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => fetchData(period)}
              disabled={loading}
              className="p-2 rounded-lg bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] text-gray-400 dark:text-neutral-500 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 mb-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            <p className="text-sm text-red-500 dark:text-red-400 mt-1">
              Vérifiez la configuration Vercel Analytics dans les variables d&apos;environnement.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && !data && (
          <div className="text-center py-16 text-gray-400 dark:text-neutral-500">Chargement…</div>
        )}

        {/* Content */}
        {data && !error && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <KpiCard
                label="Visiteurs"
                value={formatNumber(data.visitors)}
                icon={Users}
              />
              <KpiCard
                label="Pages vues"
                value={formatNumber(data.pageViews)}
                icon={Eye}
              />
            </div>

            {/* Top Pages */}
            <div className={`${CARD_STYLES} mb-8`}>
              <h2 className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-4">
                Top pages visitées
              </h2>
              {data.topPages.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                        <th className={`text-left ${TABLE_CELL} ${TABLE_HEADER}`}>Page</th>
                        <th className={`text-right ${TABLE_CELL} ${TABLE_HEADER}`}>Vues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topPages.map((p) => (
                        <tr
                          key={p.page}
                          className="border-b border-black/[0.03] hover:bg-[#F8F5F0] dark:hover:bg-neutral-700/50 transition-colors"
                        >
                          <td className={`${TABLE_CELL} max-w-[400px] truncate`}>
                            <span className="font-medium text-[#2E2E2E] dark:text-neutral-100 block truncate">
                              {p.page}
                            </span>
                          </td>
                          <td className={`${TABLE_CELL} text-right text-gray-500 dark:text-neutral-400`}>
                            {formatNumber(p.views)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-400 dark:text-neutral-500 text-sm">
                  Aucune donnée de pages sur cette période.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className={CARD_STYLES}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-[#C8A97E] dark:text-amber-400" />
        <p className="text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100">{value}</p>
    </div>
  )
}
