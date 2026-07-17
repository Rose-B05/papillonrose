"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart3, Download, ExternalLink, RefreshCw, Globe, Monitor, Smartphone, Tablet } from "lucide-react"

type Period = "7d" | "30d" | "90d" | "365d"

interface AnalyticsData {
  period: string
  since: string
  until: string
  totals: any[]
  byDay: any[]
  topPages: any[]
  topReferrers: any[]
  byCountry: any[]
  byDevice: any[]
}

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  "90d": "90 derniers jours",
  "365d": "12 derniers mois",
}

const VERCEL_ANALYTICS_URL = "https://vercel.com/rosedigitalcampus-4666s-projects/papillon-rose/analytics"

function BarHorizontal({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="w-32 md:w-48 truncate text-gray-600 dark:text-neutral-400 text-xs">{label || "—"}</span>
      <div className="flex-1 h-5 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
        <div className="h-full bg-[#C8A97E] dark:bg-amber-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 text-right text-xs font-medium text-[#2E2E2E] dark:text-neutral-100">{value.toLocaleString()}</span>
    </div>
  )
}

function DeviceIcon({ type }: { type: string }) {
  const t = type?.toLowerCase()
  if (t === "desktop" || t === "mobile" || t === "tablet") {
    return t === "mobile" ? <Smartphone size={14} /> : t === "tablet" ? <Tablet size={14} /> : <Monitor size={14} />
  }
  return <Globe size={14} />
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d")
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || `Erreur ${res.status}`)
      }
      setData(await res.json())
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => { fetchData() }, [fetchData])

  const totals = data?.totals || { pageviews: 0, visitors: 0 }
  const publicPages = (data?.topPages || []).filter((p: any) => !p.requestPath?.startsWith("/admin"))
  const byDayFiltered = (data?.byDay || []).filter((d: any) => (d.pageviews || 0) > 0)
  const maxDay = Math.max(...byDayFiltered.map((d: any) => d.pageviews || 0), 1)
  const maxPage = Math.max(...publicPages.map((p: any) => p.pageviews || 0), 1)
  const maxRef = Math.max(...(data?.topReferrers || []).map((r: any) => r.pageviews || 0), 1)

  const exportCSV = () => {
    if (!data) return
    const rows: string[] = []

    rows.push("=== RAPPORT ANALYTICS - Papillon Rose ===")
    rows.push(`Période,${PERIOD_LABELS[period]}`)
    rows.push(`Du,${new Date(data.since).toLocaleDateString("fr-FR")}`)
    rows.push(`Au,${new Date(data.until).toLocaleDateString("fr-FR")}`)
    rows.push("")
    rows.push("=== TOTAUX ===")
    rows.push("Page vues,Visiteurs")
    rows.push(`${totals.pageviews},${totals.visitors}`)
    rows.push("")
    rows.push("=== VISITES PAR JOUR ===")
    rows.push("Date,Page vues,Visiteurs")
    for (const d of byDayFiltered) {
      rows.push(`${d.timestamp?.split("T")[0] || ""},${d.pageviews || 0},${d.visitors || 0}`)
    }
    rows.push("")
    rows.push("=== TOP PAGES ===")
    rows.push("Page,Page vues,Visiteurs")
    for (const p of publicPages) {
      rows.push(`"${(p.requestPath || "").replace(/"/g, '""')}",${p.pageviews || 0},${p.visitors || 0}`)
    }
    rows.push("")
    rows.push("=== TOP REFERRERS ===")
    rows.push("Referrer,Page vues,Visiteurs")
    for (const r of data.topReferrers || []) {
      rows.push(`"${(r.referrerHostname || "").replace(/"/g, '""')}",${r.pageviews || 0},${r.visitors || 0}`)
    }
    rows.push("")
    rows.push("=== PAYS ===")
    rows.push("Pays,Page vues,Visiteurs")
    for (const c of data.byCountry || []) {
      rows.push(`"${(c.country || "").replace(/"/g, '""')}",${c.pageviews || 0},${c.visitors || 0}`)
    }
    rows.push("")
    rows.push("=== APPAREILS ===")
    rows.push("Type,Page vues,Visiteurs")
    for (const dv of data.byDevice || []) {
      rows.push(`${dv.deviceType || ""},${dv.pageviews || 0},${dv.visitors || 0}`)
    }

    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `analytics-papillon-rose-${period}-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
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
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] text-gray-400 hover:text-[#C8A97E] transition-colors disabled:opacity-50"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={exportCSV}
              disabled={!data}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
            <a
              href={VERCEL_ANALYTICS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#C8A97E] dark:bg-amber-600 text-white hover:bg-[#b8996e] dark:hover:bg-amber-500 transition-colors"
            >
              Dashboard Vercel
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex gap-1 bg-white dark:bg-neutral-800 rounded-xl border border-black/[0.07] dark:border-white/[0.08] p-1 mb-6 w-fit">
          {(["7d", "30d", "90d", "365d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                period === p
                  ? "bg-[#C8A97E] dark:bg-amber-600 text-white"
                  : "text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-700"
              }`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {loading && !data && (
          <div className="text-center py-16 text-gray-400">Chargement des données…</div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Totals */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                <p className="text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Page vues</p>
                <p className="text-3xl font-bold text-[#2E2E2E] dark:text-neutral-100">{totals.pageviews?.toLocaleString() || "0"}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                <p className="text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Visiteurs uniques</p>
                <p className="text-3xl font-bold text-[#2E2E2E] dark:text-neutral-100">{totals.visitors?.toLocaleString() || "0"}</p>
              </div>
            </div>

            {/* Chart: by day */}
            {byDayFiltered.length > 0 && (
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Visites par jour</h2>
                <div className="flex items-end gap-1 h-32">
                  {byDayFiltered.map((d: any, i: number) => {
                    const h = maxDay > 0 ? ((d.pageviews || 0) / maxDay) * 100 : 0
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1" title={`${d.timestamp?.split("T")[0]}: ${d.pageviews || 0} vues`}>
                        <div className="w-full bg-[#C8A97E]/20 dark:bg-amber-600/20 rounded-t relative" style={{ height: `${Math.max(h, 2)}%` }}>
                          <div className="absolute bottom-0 w-full bg-[#C8A97E] dark:bg-amber-600 rounded-t transition-all" style={{ height: `${h}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-400 dark:text-neutral-500">
                  <span>{byDayFiltered[0]?.timestamp?.split("T")[0]}</span>
                  <span>{byDayFiltered[byDayFiltered.length - 1]?.timestamp?.split("T")[0]}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Pages */}
              {publicPages.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Top pages</h2>
                  <div className="space-y-2">
                    {publicPages.slice(0, 10).map((p: any, i: number) => (
                      <BarHorizontal key={i} label={p.requestPath} value={p.pageviews || 0} max={maxPage} />
                    ))}
                  </div>
                </div>
              )}

              {/* Top Referrers */}
              {data.topReferrers && data.topReferrers.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Top referrers</h2>
                  <div className="space-y-2">
                    {data.topReferrers.slice(0, 10).map((r: any, i: number) => (
                      <BarHorizontal key={i} label={r.referrerHostname} value={r.pageviews || 0} max={maxRef} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Countries */}
              {data.byCountry && data.byCountry.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Pays</h2>
                  <div className="space-y-2">
                    {data.byCountry.slice(0, 10).map((c: any, i: number) => (
                      <BarHorizontal key={i} label={c.country} value={c.pageviews || 0} max={maxPage} />
                    ))}
                  </div>
                </div>
              )}

              {/* Devices */}
              {data.byDevice && data.byDevice.length > 0 && (
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                  <h2 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Appareils</h2>
                  <div className="space-y-3">
                    {data.byDevice.map((d: any, i: number) => (
                      <div key={i} className="flex items-center gap-3">
                        <DeviceIcon type={d.deviceType} />
                        <span className="text-xs text-gray-600 dark:text-neutral-400 w-20">{d.deviceType || "Inconnu"}</span>
                        <div className="flex-1 h-5 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#C8A97E] dark:bg-amber-600 rounded-full transition-all"
                            style={{ width: `${totals.pageviews > 0 ? ((d.pageviews || 0) / totals.pageviews) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-xs font-medium text-[#2E2E2E] dark:text-neutral-100">
                          {totals.pageviews > 0 ? Math.round(((d.pageviews || 0) / totals.pageviews) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
