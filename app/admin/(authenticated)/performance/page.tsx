"use client"

import { useState, useEffect, useCallback } from "react"
import { Gauge, RefreshCcw, AlertTriangle, Clock, Zap, Image, ArrowDown, ExternalLink } from "lucide-react"

// ─── Types ───────────────────────────────────────────────────────────────────
interface PageSpeedResult {
  url: string
  strategy: "mobile" | "desktop"
  score: number
  lcp: number | null
  fcp: number | null
  tbt: number | null
  cls: number | null
  ttfb: number | null
  totalWeight: number | null
  imageWeight: number | null
  opportunities: { id: string; title: string; description: string; savings: string }[]
}

interface PerformanceData {
  results: PageSpeedResult[]
  errors?: string[]
  cached: boolean
  timestamp: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function scoreColor(score: number): string {
  if (score >= 90) return "text-green-500"
  if (score >= 50) return "text-amber-500"
  return "text-red-500"
}

function scoreBg(score: number): string {
  if (score >= 90) return "bg-green-500/10 border-green-500/20"
  if (score >= 50) return "bg-amber-500/10 border-amber-500/20"
  return "bg-red-500/10 border-red-500/20"
}

function vitalsColor(metric: string, value: number | null): string {
  if (value == null) return "text-gray-400"
  const thresholds: Record<string, [number, number]> = {
    lcp: [2500, 4000],
    fcp: [1800, 3000],
    tbt: [200, 600],
    cls: [0.1, 0.25],
    ttfb: [800, 1800],
  }
  const [good, poor] = thresholds[metric] || [0, 0]
  if (metric === "cls") {
    if (value <= good) return "text-green-500"
    if (value <= poor) return "text-amber-500"
    return "text-red-500"
  }
  if (value <= good) return "text-green-500"
  if (value <= poor) return "text-amber-500"
  return "text-red-500"
}

function formatMs(v: number | null): string {
  if (v == null) return "—"
  return v < 1000 ? `${v} ms` : `${(v / 1000).toFixed(1)} s`
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1048576).toFixed(1)} Mo`
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) +
    " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function ScoreCard({ label, score }: { label: string; score: number }) {
  return (
    <div className={`rounded-2xl border p-4 ${scoreBg(score)}`}>
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/60 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${scoreColor(score)}`}>{score}</span>
        <span className="text-xs text-gray-400 dark:text-white/60">/ 100</span>
      </div>
    </div>
  )
}

function VitalCard({ label, value, unit, metric }: { label: string; value: number | null; unit: string; metric: string }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-3 border border-black/[0.07] dark:border-white/[0.08]">
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/60 mb-1">{label}</p>
      <p className={`text-lg font-semibold ${vitalsColor(metric, value)}`}>
        {value != null ? (metric === "cls" ? value.toFixed(3) : formatMs(value)) : "—"}
      </p>
    </div>
  )
}

function UrlSection({ results }: { results: PageSpeedResult[] }) {
  const mobile = results.find((r) => r.strategy === "mobile")
  const desktop = results.find((r) => r.strategy === "desktop")
  const label = results[0]?.url?.replace(/https?:\/\/[^/]+/, "") || "/"
  const displayLabel = label === "/" ? "Accueil" : label.replace(/^\//, "").replace(/\//g, " › ")

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm mb-4">
      <div className="flex items-center gap-2 mb-4">
        <ExternalLink size={14} className="text-[#C9948E] dark:text-[#E8B4AE]" />
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">{displayLabel}</h3>
        <a href={results[0]?.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-[#C9948E] dark:text-[#E8B4AE] hover:underline">
          Ouvrir
        </a>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {mobile && <ScoreCard label="Mobile" score={mobile.score} />}
        {desktop && <ScoreCard label="Desktop" score={desktop.score} />}
      </div>

      {/* Core Web Vitals */}
      <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/60 font-medium mb-2">Core Web Vitals</p>
      <div className="grid grid-cols-5 gap-2 mb-4">
        <VitalCard label="LCP" value={mobile?.lcp ?? desktop?.lcp} unit="ms" metric="lcp" />
        <VitalCard label="FCP" value={mobile?.fcp ?? desktop?.fcp} unit="ms" metric="fcp" />
        <VitalCard label="TBT" value={mobile?.tbt ?? desktop?.tbt} unit="ms" metric="tbt" />
        <VitalCard label="CLS" value={mobile?.cls ?? desktop?.cls} unit="" metric="cls" />
        <VitalCard label="TTFB" value={mobile?.ttfb ?? desktop?.ttfb} unit="ms" metric="ttfb" />
      </div>

      {/* Weight */}
      {(mobile?.totalWeight != null || desktop?.totalWeight != null) && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/60 font-medium mb-2">Poids de la page</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#C9948E]/10 flex items-center justify-center">
                <ArrowDown size={14} className="text-[#C9948E] dark:text-[#E8B4AE]" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#2E2E2E] dark:text-neutral-100">
                  {formatBytes(mobile?.totalWeight ?? desktop?.totalWeight)}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-white/60">Total</p>
              </div>
            </div>
            {(mobile?.imageWeight != null || desktop?.imageWeight != null) && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#C9948E]/10 flex items-center justify-center">
                  <Image size={14} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#2E2E2E] dark:text-neutral-100">
                    {formatBytes(mobile?.imageWeight ?? desktop?.imageWeight)}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-white/60">Images</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Opportunities */}
      {mobile?.opportunities && mobile.opportunities.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-white/60 font-medium mb-2">
            Actions prioritaires ({mobile.opportunities.length})
          </p>
          <div className="space-y-1.5">
            {mobile.opportunities.slice(0, 5).map((opp) => (
              <div key={opp.id} className="flex items-center justify-between bg-[#F8F5F0] dark:bg-neutral-700/50 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-xs font-medium text-[#2E2E2E] dark:text-neutral-100 truncate">{opp.title}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/60 truncate">{opp.description}</p>
                </div>
                <span className="text-[10px] font-medium text-[#C9948E] dark:text-[#E8B4AE] whitespace-nowrap flex-shrink-0">
                  {opp.savings}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  const fetchData = useCallback(async (refresh = false) => {
    setRefreshing(refresh)
    setError("")
    try {
      const res = await fetch(`/api/admin/performance${refresh ? "?refresh=true" : ""}`)
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Erreur ${res.status}`)
      }
      const result: PerformanceData = await res.json()
      setData(result)
      if (result.errors?.length) {
        setError(result.errors.join(" · "))
      }
    } catch (e: any) {
      setError(e.message || "Erreur inconnue")
    }
    setLoading(false)
    setRefreshing(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  // Group results by URL
  const groupedByURL = new Map<string, PageSpeedResult[]>()
  if (data?.results) {
    for (const r of data.results) {
      const existing = groupedByURL.get(r.url) || []
      existing.push(r)
      groupedByURL.set(r.url, existing)
    }
  }

  return (
    <div className="p-6">
      {/* SEO Audit banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl px-4 py-2.5 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gauge size={14} className="text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Mode Audit SEO</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-800/30 text-blue-600 dark:text-blue-400 font-medium uppercase tracking-wider">
          PHASE 2
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">Performance</h1>
          <p className="text-sm text-gray-400 dark:text-white/60 mt-1">
            Core Web Vitals et vitesse du site
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 bg-[#C9948E] hover:bg-[#B8807A] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Analyse en cours…" : "Actualiser l'analyse"}
        </button>
      </div>

      {/* Last analysis timestamp */}
      {data?.timestamp && (
        <p className="text-xs text-gray-400 dark:text-white/60 mb-4 flex items-center gap-1.5">
          <Clock size={12} />
          Dernière analyse : {formatDate(data.timestamp)}
          {data.cached && <span className="text-[#C9948E] dark:text-[#E8B4AE] ml-1">(cache)</span>}
        </p>
      )}

      {/* Loading state */}
      {loading && !refreshing && (
        <div className="text-center py-20">
          <RefreshCcw size={24} className="animate-spin text-[#C9948E] mx-auto mb-3" />
          <p className="text-sm text-gray-400 dark:text-white/60">Chargement des données…</p>
        </div>
      )}

      {/* Refreshing overlay */}
      {refreshing && (
        <div className="bg-[#F8F5F0] dark:bg-neutral-900/50 rounded-2xl p-8 mb-6 text-center border border-[#C9948E]/20">
          <RefreshCcw size={28} className="animate-spin text-[#C9948E] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
            Analyse en cours…
          </p>
          <p className="text-xs text-gray-400 dark:text-white/60">
            Cela peut prendre 10-30 secondes par URL. Merci de patienter.
          </p>
        </div>
      )}

      {/* Error */}
      {error && !data?.results?.length && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl px-5 py-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-300">Erreur</p>
            <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && !refreshing && data?.results && (
        <div>
          {Array.from(groupedByURL.entries()).map(([url, results]) => (
            <UrlSection key={url} results={results} />
          ))}

          {data.results.length === 0 && !error && (
            <div className="text-center py-16">
              <Zap size={24} className="text-gray-300 dark:text-neutral-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 dark:text-white/60">
                Aucune donnée disponible. Cliquez sur &quot;Actualiser l&apos;analyse&quot; pour lancer un test.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
