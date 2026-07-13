"use client"

import { useState, useEffect } from "react"
import { Search, Globe, Lock, AlertTriangle, CheckCircle, ExternalLink, FileText, Download, BarChart3 } from "lucide-react"
import SeoAlerts from "@/components/admin/seo/SeoAlerts"
import SecurityChecks from "@/components/admin/seo/SecurityChecks"
import ScoreDisplay from "@/components/admin/seo/ScoreDisplay"
import RobotsEditor from "@/components/admin/seo/RobotsEditor"
import SitemapPanel from "@/components/admin/seo/SitemapPanel"
import PageControl from "@/components/admin/seo/PageControl"
import QuickActions from "@/components/admin/seo/QuickActions"
import HistoryPanel from "@/components/admin/seo/HistoryPanel"

type SiteMode = "development" | "production"

interface SeoData {
  mode: SiteMode
  score: {
    total: number
    seo: number
    performance: number
    accessibility: number
    security: number
    indexation: number
    blockingIssues: string[]
    recommendations: string[]
  }
  alerts: Array<{
    id: string
    type: "error" | "warning" | "info"
    category: string
    message: string
    page?: string
    action?: string
    timestamp: string
  }>
  indexation: {
    totalPages: number
    indexablePages: number
    noindexPages: number
    indexedPages: number
    nonIndexedPages: number
    excludedPages: number
    blockedPages: number
    lastIndexation: string
    lastSitemapGeneration: string
    lastRobotsModification: string
  }
  robots: {
    content: string
    lastModified: string
    isValid: boolean
    errors: string[]
    warnings: string[]
  }
  sitemap: {
    urlCount: number
    lastGenerated: string
    sizeBytes: number
    status: "valid" | "empty" | "error"
    content: string
  }
  security: Array<{
    name: string
    label: string
    passed: boolean
    message: string
  }>
  pages: Array<{
    path: string
    label: string
    critical: boolean
    title: string
    description: string
    canonical: string
    robots: string
    h1: string
    h2: string
    statusCode: number
    indexable: boolean
    lastModified: string
    lastCrawl: string
  }>
}

interface HistoryEntry {
  id: string
  date: string
  user: string
  action: string
  result: string
  rollbackAvailable: boolean
}

const SITE_URL = "https://www.papillonrose.fr"

export default function SeoPage() {
  const [data, setData] = useState<SeoData | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [activeTab, setActiveTab] = useState<"overview" | "robots" | "sitemap" | "pages" | "history">("overview")

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/seo").then((r) => r.json()),
      fetch("/api/admin/seo/history").then((r) => r.json()),
    ])
      .then(([seoData, histData]) => {
        setData(seoData)
        setHistory(histData.history || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function toggleMode() {
    if (!data) return
    const newMode: SiteMode = data.mode === "production" ? "development" : "production"
    setSaving(true)
    setMsg("")
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      })
      const result = await res.json()
      if (res.ok) {
        setData((prev) => prev ? { ...prev, mode: result.mode } : prev)
        setMsg(result.mode === "production" ? "Mode Production activé." : "Mode Développement activé.")
        // Refresh data
        const fresh = await fetch("/api/admin/seo").then((r) => r.json())
        setData(fresh)
        const hist = await fetch("/api/admin/seo/history").then((r) => r.json())
        setHistory(hist.history || [])
      } else {
        if (result.blocking) {
          setMsg(`Blocé : ${result.blocking.map((b: { label: string }) => b.label).join(", ")}`)
        } else {
          setMsg(result.error || "Erreur")
        }
      }
    } catch {
      setMsg("Erreur de connexion")
    }
    setSaving(false)
  }

  async function handleExport(format: string) {
    try {
      const res = await fetch(`/api/admin/seo/report?format=${format}`)
      if (format === "csv" || format === "json") {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `rapport-seo-${new Date().toISOString().split("T")[0]}.${format}`
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 dark:text-neutral-500">Chargement…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">Erreur de chargement des données SEO</p>
      </div>
    )
  }

  const isProduction = data.mode === "production"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Mode Toggle Card — EXISTING DESIGN KEPT */}
      <div className={`rounded-2xl border p-6 ${isProduction ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {isProduction ? (
              <Globe size={22} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            ) : (
              <Lock size={22} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
                {isProduction ? "Mode Production" : "Mode Développement"}
              </h2>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
                {isProduction
                  ? "Le site est visible par les moteurs de recherche (Google, Bing, etc.)."
                  : "Le site est masqué des moteurs de recherche. Aucune page n'est indexée."}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMode}
            disabled={saving}
            className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isProduction
                ? "bg-green-600 focus:ring-green-500"
                : "bg-gray-300 dark:bg-neutral-600 focus:ring-amber-500"
            } disabled:opacity-50`}
            role="switch"
            aria-checked={isProduction}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isProduction ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Banner */}
        <div className={`mt-4 px-3 py-2 rounded-lg text-sm font-medium ${isProduction ? "bg-green-100/50 dark:bg-green-950/20 text-green-700 dark:text-green-400" : "bg-amber-100/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400"}`}>
          {isProduction
            ? "✓ Le site est prêt à être indexé."
            : "⚠ Le site est invisible des moteurs de recherche."}
        </div>

        {msg && (
          <p className={`text-sm mt-3 px-3 py-2 rounded-lg ${msg.includes("Erreur") || msg.includes("Blocé") ? "text-red-600 bg-red-50 dark:bg-red-950/30" : "text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-950/20"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* Status Grid — EXISTING DESIGN KEPT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatusCard
          label="robots.txt"
          value={isProduction ? "Allow All" : "Disallow All"}
          ok={isProduction}
        />
        <StatusCard
          label="sitemap.xml"
          value={isProduction ? `${data.sitemap.urlCount} pages` : "Vide"}
          ok={isProduction}
        />
        <StatusCard
          label="Meta robots"
          value={isProduction ? "index, follow" : "noindex"}
          ok={isProduction}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 rounded-xl p-1 overflow-x-auto">
        {[
          { id: "overview" as const, label: "Vue d'ensemble" },
          { id: "robots" as const, label: "robots.txt" },
          { id: "sitemap" as const, label: "Sitemap" },
          { id: "pages" as const, label: "Pages" },
          { id: "history" as const, label: "Historique" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] text-xs px-3 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-neutral-700 text-[#2E2E2E] dark:text-neutral-100 shadow-sm font-medium"
                : "text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:hover:text-neutral-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <ScoreDisplay score={data.score} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IndexationStats stats={data.indexation} />
            <SecurityChecks checks={data.security} />
          </div>

          <SeoAlerts alerts={data.alerts} />

          <QuickActions mode={data.mode} onToggleMode={toggleMode} />

          {/* Export */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-neutral-700">
                <Download size={16} className="text-gray-600 dark:text-neutral-300" />
              </div>
              <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Rapport exportable</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExport("json")}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                <FileText size={12} /> JSON
              </button>
              <button
                onClick={() => handleExport("csv")}
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                <FileText size={12} /> CSV
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "robots" && (
        <div className="space-y-6">
          <RobotsEditor info={data.robots} />

          {/* Preview Links */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
              Vérification rapide
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`${SITE_URL}/robots.txt`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
              >
                robots.txt <ExternalLink size={12} />
              </a>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
              >
                Google Search Console <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === "sitemap" && (
        <div className="space-y-6">
          <SitemapPanel info={data.sitemap} />

          {/* Preview Links */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
              Vérification rapide
            </h3>
            <div className="flex flex-wrap gap-3">
              <a
                href={`${SITE_URL}/sitemap.xml`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
              >
                sitemap.xml <ExternalLink size={12} />
              </a>
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
              >
                Google Search Console <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}

      {activeTab === "pages" && (
        <PageControl pages={data.pages} />
      )}

      {activeTab === "history" && (
        <HistoryPanel history={history} />
      )}

      {/* Quick Test Links — EXISTING DESIGN KEPT */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
            Vérification rapide
          </h3>
          <div className="flex flex-wrap gap-3">
            <a
              href={`${SITE_URL}/robots.txt`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
            >
              robots.txt <ExternalLink size={12} />
            </a>
            <a
              href={`${SITE_URL}/sitemap.xml`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
            >
              sitemap.xml <ExternalLink size={12} />
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
            >
              Google Search Console <ExternalLink size={12} />
            </a>
            <a
              href="https://pagespeed.web.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-[#C8A97E] hover:text-[#B8926E] transition-colors"
            >
              PageSpeed Insights <ExternalLink size={12} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusCard({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${ok ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"}`}>
      <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${ok ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-400"}`}>
        {value}
      </p>
    </div>
  )
}

function IndexationStats({ stats }: { stats: SeoData["indexation"] }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 dark:bg-blue-950/50">
          <BarChart3 size={16} className="text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Indexation</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <StatItem label="Total pages" value={stats.totalPages} />
        <StatItem label="Indexables" value={stats.indexablePages} color="text-green-600 dark:text-green-400" />
        <StatItem label="Noindex" value={stats.noindexPages} color="text-amber-600 dark:text-amber-400" />
        <StatItem label="Indexées" value={stats.indexedPages} color="text-green-600 dark:text-green-400" />
        <StatItem label="Non indexées" value={stats.nonIndexedPages} color="text-gray-600 dark:text-neutral-400" />
        <StatItem label="Exclues" value={stats.excludedPages} color="text-amber-600 dark:text-amber-400" />
        <StatItem label="Bloquées" value={stats.blockedPages} color="text-red-600 dark:text-red-400" />
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Dernière indexation : {stats.lastIndexation === "—" ? "—" : new Date(stats.lastIndexation).toLocaleDateString("fr-FR")}
        </p>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Dernière génération sitemap : {new Date(stats.lastSitemapGeneration).toLocaleDateString("fr-FR")}
        </p>
        <p className="text-xs text-gray-500 dark:text-neutral-400">
          Dernière modification robots.txt : {new Date(stats.lastRobotsModification).toLocaleDateString("fr-FR")}
        </p>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg p-2.5">
      <p className="text-xs text-gray-500 dark:text-neutral-400">{label}</p>
      <p className={`text-lg font-bold ${color || "text-[#2E2E2E] dark:text-neutral-100"}`}>{value}</p>
    </div>
  )
}
