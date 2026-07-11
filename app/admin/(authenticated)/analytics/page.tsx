"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { BarChart3, Users, Eye, MousePointerClick, RefreshCw, AlertTriangle } from "lucide-react"

interface Ga4Data {
  totals: { activeUsers: number; sessions: number; screenPageViews: number; keyEvents: number }
  timeline: { date: string; sessions: number }[]
  channels: { channel: string; sessions: number; keyEvents: number }[]
  pages: { pagePath: string; pageTitle: string; screenPageViews: number; activeUsers: number }[]
}

type Period = "7" | "30" | "90"

const PERIOD_OPTIONS: { value: Period; label: string }[] = [
  { value: "7", label: "7 jours" },
  { value: "30", label: "30 jours" },
  { value: "90", label: "90 jours" },
]

function formatDate(dateStr: string) {
  if (dateStr.length !== 8) return dateStr
  return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}`
}

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
  const [data, setData] = useState<Ga4Data | null>(null)
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
              Trafic, sessions et comportement visiteurs — Google Analytics 4
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
              Vérifiez la configuration GA4 dans les variables d&apos;environnement.
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
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <KpiCard
                label="Utilisateurs actifs"
                value={formatNumber(data.totals.activeUsers)}
                icon={Users}
              />
              <KpiCard
                label="Sessions"
                value={formatNumber(data.totals.sessions)}
                icon={MousePointerClick}
              />
              <KpiCard
                label="Pages vues"
                value={formatNumber(data.totals.screenPageViews)}
                icon={Eye}
              />
              <KpiCard
                label="Événements clés"
                value={formatNumber(data.totals.keyEvents)}
                icon={BarChart3}
              />
            </div>

            {/* Sessions Timeline */}
            <div className={`${CARD_STYLES} mb-8`}>
              <h2 className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-4">
                Évolution des sessions
              </h2>
              {data.timeline.length > 0 ? (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.timeline}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C8A97E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#C8A97E" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={formatDate}
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        labelFormatter={(v: string) => formatDate(String(v))}
                        contentStyle={{
                          background: "#fff",
                          border: "1px solid rgba(0,0,0,0.08)",
                          borderRadius: 12,
                          fontSize: 13,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="sessions"
                        stroke="#C8A97E"
                        strokeWidth={2}
                        fill="url(#colorSessions)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center py-10 text-gray-400 dark:text-neutral-500 text-sm">
                  Aucune donnée de trafic sur cette période.
                </p>
              )}
            </div>

            {/* Tables grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Channels */}
              <div className={CARD_STYLES}>
                <h2 className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-4">
                  Canaux d&apos;acquisition
                </h2>
                {data.channels.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                          <th className={`text-left ${TABLE_CELL} ${TABLE_HEADER}`}>Canal</th>
                          <th className={`text-right ${TABLE_CELL} ${TABLE_HEADER}`}>Sessions</th>
                          <th className={`text-right ${TABLE_CELL} ${TABLE_HEADER}`}>Événements</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.channels.map((ch) => (
                          <tr
                            key={ch.channel}
                            className="border-b border-black/[0.03] hover:bg-[#F8F5F0] dark:hover:bg-neutral-700/50 transition-colors"
                          >
                            <td className={`${TABLE_CELL} font-medium text-[#2E2E2E] dark:text-neutral-100`}>
                              {ch.channel}
                            </td>
                            <td className={`${TABLE_CELL} text-right text-gray-500 dark:text-neutral-400`}>
                              {formatNumber(ch.sessions)}
                            </td>
                            <td className={`${TABLE_CELL} text-right text-gray-500 dark:text-neutral-400`}>
                              {formatNumber(ch.keyEvents)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-400 dark:text-neutral-500 text-sm">
                    Aucune donnée de canaux.
                  </p>
                )}
              </div>

              {/* Pages */}
              <div className={CARD_STYLES}>
                <h2 className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-4">
                  Top 10 pages
                </h2>
                {data.pages.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                          <th className={`text-left ${TABLE_CELL} ${TABLE_HEADER}`}>Page</th>
                          <th className={`text-right ${TABLE_CELL} ${TABLE_HEADER}`}>Vues</th>
                          <th className={`text-right ${TABLE_CELL} ${TABLE_HEADER}`}>Visiteurs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.pages.map((p) => (
                          <tr
                            key={p.pagePath}
                            className="border-b border-black/[0.03] hover:bg-[#F8F5F0] dark:hover:bg-neutral-700/50 transition-colors"
                          >
                            <td className={`${TABLE_CELL} max-w-[200px] truncate`}>
                              <span className="font-medium text-[#2E2E2E] dark:text-neutral-100 block truncate">
                                {p.pageTitle || p.pagePath}
                              </span>
                              {p.pageTitle && p.pagePath !== p.pageTitle && (
                                <span className="text-xs text-gray-400 dark:text-neutral-500 block truncate">
                                  {p.pagePath}
                                </span>
                              )}
                            </td>
                            <td className={`${TABLE_CELL} text-right text-gray-500 dark:text-neutral-400`}>
                              {formatNumber(p.screenPageViews)}
                            </td>
                            <td className={`${TABLE_CELL} text-right text-gray-500 dark:text-neutral-400`}>
                              {formatNumber(p.activeUsers)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-8 text-gray-400 dark:text-neutral-500 text-sm">
                    Aucune donnée de pages.
                  </p>
                )}
              </div>
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
