"use client"

import { useState, useEffect } from "react"
import { Search, Globe, Lock, AlertTriangle, CheckCircle, ExternalLink, FileText, Download, BarChart3, Shield } from "lucide-react"
import SeoAlerts from "@/components/admin/seo/SeoAlerts"
import SecurityChecks from "@/components/admin/seo/SecurityChecks"
import ScoreDisplay from "@/components/admin/seo/ScoreDisplay"
import RobotsEditor from "@/components/admin/seo/RobotsEditor"
import SitemapPanel from "@/components/admin/seo/SitemapPanel"
import PageControl from "@/components/admin/seo/PageControl"
import QuickActions from "@/components/admin/seo/QuickActions"
import HistoryPanel from "@/components/admin/seo/HistoryPanel"

type SiteMode = "development" | "seo_audit" | "production"

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
  const [showConfirmProd, setShowConfirmProd] = useState(false)
  const [pendingMode, setPendingMode] = useState<SiteMode | null>(null)

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

  async function switchMode(newMode: SiteMode) {
    if (!data) return
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
        const labels: Record<SiteMode, string> = {
          development: "Mode Développement activé.",
          seo_audit: "Mode Audit SEO activé.",
          production: "Mode Production activé.",
        }
        setMsg(labels[result.mode as SiteMode] || "Mode changé.")
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
    setShowConfirmProd(false)
    setPendingMode(null)
  }

  function handleModeChange(newMode: SiteMode) {
    if (newMode === "production" && data?.mode !== "production") {
      setPendingMode(newMode)
      setShowConfirmProd(true)
    } else {
      switchMode(newMode)
    }
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

  const modeConfig: Record<SiteMode, { label: string; description: string; color: string; bgColor: string; borderColor: string; icon: typeof Globe }> = {
    development: {
      label: "Développement",
      description: "Le site est totalement invisible. Aucun crawl, aucune indexation.",
      color: "text-amber-700 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      borderColor: "border-amber-200 dark:border-amber-800",
      icon: Lock,
    },
    seo_audit: {
      label: "Audit SEO",
      description: "Crawl autorisé (Screaming Frog, Lighthouse), indexation désactivée.",
      color: "text-blue-700 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      icon: Search,
    },
    production: {
      label: "Production",
      description: "Le site est visible par les moteurs de recherche (Google, Bing, etc.).",
      color: "text-green-700 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-200 dark:border-green-800",
      icon: Globe,
    },
  }

  const currentMode = data.mode as SiteMode
  const cfg = modeConfig[currentMode]
  const ModeIcon = cfg.icon

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Confirmation Dialog */}
      {showConfirmProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-black/[0.07] dark:border-white/[0.08]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-950/50 flex items-center justify-center">
                <Shield size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">Activer le mode Production</h3>
                <p className="text-sm text-gray-500 dark:text-neutral-400">Cette action est irréversible sans intervention manuelle.</p>
              </div>
            </div>
            <p className="text-sm text-[#2E2E2E]/70 dark:text-neutral-300 mb-6 leading-relaxed">
              Le site deviendra <strong>indexable par Google</strong> et tous les moteurs de recherche. Les pages seront crawlées et référencées dans les résultats de recherche.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowConfirmProd(false); setPendingMode(null) }}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-neutral-400 hover:text-[#2E2E2E] dark:hover:text-neutral-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => pendingMode && switchMode(pendingMode)}
                disabled={saving}
                className="px-5 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Activation…" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode Toggle Card */}
      <div className={`rounded-2xl border p-6 ${cfg.bgColor} ${cfg.borderColor}`}>
        <div className="flex items-start gap-3 mb-5">
          <ModeIcon size={22} className={`${cfg.color} mt-0.5 flex-shrink-0`} />
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Mode {cfg.label}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">
              {cfg.description}
            </p>
          </div>
        </div>

        {/* 3 Radio Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {(["development", "seo_audit", "production"] as SiteMode[]).map((m) => {
            const mc = modeConfig[m]
            const McIcon = mc.icon
            const isActive = currentMode === m
            return (
              <button
                key={m}
                onClick={() => handleModeChange(m)}
                disabled={saving || isActive}
                className={`flex-1 flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  isActive
                    ? `${mc.borderColor} ${mc.bgColor}`
                    : "border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-gray-300 dark:hover:border-neutral-600"
                } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? mc.bgColor : "bg-gray-100 dark:bg-neutral-700"}`}>
                  <McIcon size={16} className={isActive ? mc.color : "text-gray-400 dark:text-neutral-500"} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${isActive ? "text-[#2E2E2E] dark:text-neutral-100" : "text-gray-600 dark:text-neutral-400"}`}>
                    {mc.label}
                  </p>
                  {isActive && (
                    <p className="text-[10px] text-[#2E2E2E]/50 dark:text-neutral-500 mt-0.5">Actif</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {msg && (
          <p className={`text-sm mt-3 px-3 py-2 rounded-lg ${msg.includes("Erreur") || msg.includes("Blocé") ? "text-red-600 bg-red-50 dark:bg-red-950/30" : "text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-950/20"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard
          label="robots.txt"
          value={currentMode === "development" ? "Disallow All" : "Allow All"}
          ok={currentMode !== "development"}
        />
        <StatusCard
          label="sitemap.xml"
          value={currentMode === "development" ? "Vide" : `${data.sitemap.urlCount} pages`}
          ok={currentMode !== "development"}
        />
        <StatusCard
          label="Meta Robots"
          value={currentMode === "production" ? "index, follow" : "noindex, nofollow"}
          ok={currentMode === "production"}
        />
        <StatusCard
          label="Crawl Google"
          value={currentMode === "production" ? "Autorisé" : currentMode === "seo_audit" ? "Bloqué*" : "Bloqué"}
          ok={currentMode === "production"}
        />
      </div>

      {/* Mode Summary Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Tableau récapitulatif</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-neutral-700">
                <th className="text-left py-2 pr-4 text-xs text-gray-500 dark:text-neutral-400 font-medium">État</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-amber-700 dark:text-amber-400">Développement</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-blue-700 dark:text-blue-400">Audit SEO</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-green-700 dark:text-green-400">Production</th>
              </tr>
            </thead>
            <tbody className="text-[#2E2E2E]/70 dark:text-neutral-300">
              {[
                { label: "robots.txt", dev: "Disallow /", audit: "Allow /", prod: "Allow /" },
                { label: "Meta Robots", dev: "noindex", audit: "noindex", prod: "index, follow" },
                { label: "Sitemap", dev: "Vide", audit: "Complet", prod: "Complet" },
                { label: "Canonical", dev: "Actif", audit: "Actif", prod: "Actif" },
                { label: "Crawl autorisé", dev: "Non", audit: "Oui", prod: "Oui" },
                { label: "Indexation Google", dev: "Non", audit: "Non", prod: "Oui" },
              ].map((row) => (
                <tr key={row.label} className="border-b border-gray-50 dark:border-neutral-800 last:border-0">
                  <td className="py-2.5 pr-4 font-medium text-xs">{row.label}</td>
                  <td className="py-2.5 px-3 text-center text-xs">{row.dev}</td>
                  <td className="py-2.5 px-3 text-center text-xs">{row.audit}</td>
                  <td className="py-2.5 px-3 text-center text-xs">{row.prod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {currentMode === "seo_audit" && (
          <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-3">
            * En mode Audit SEO, le crawl est autorisé pour les outils (Screaming Frog, Lighthouse) mais Google ne peut pas indexer les pages grâce au meta noindex.
          </p>
        )}
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

          <QuickActions mode={data.mode} onToggleMode={() => handleModeChange(currentMode === "production" ? "development" : "production")} />

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
