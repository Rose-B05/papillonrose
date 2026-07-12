"use client"

import { useState, useEffect } from "react"
import { Search, Globe, Lock, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"

type SiteMode = "development" | "production"

const PAGE_LIST = [
  { path: "/", label: "Accueil", critical: true },
  { path: "/catalogue", label: "Catalogue", critical: true },
  { path: "/reservation", label: "Réservation", critical: true },
  { path: "/a-propos", label: "À propos", critical: false },
  { path: "/conditions-location", label: "Conditions de location", critical: false },
  { path: "/faq", label: "FAQ", critical: false },
  { path: "/mentions-legales", label: "Mentions légales", critical: false },
  { path: "/compte", label: "Mon compte", critical: false },
]

export default function SeoPage() {
  const [mode, setMode] = useState<SiteMode | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")

  const SITE_URL = "https://www.papillonrose.fr"

  useEffect(() => {
    fetch("/api/admin/site-mode")
      .then((r) => r.json())
      .then((data) => {
        setMode(data.mode || "development")
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function toggleMode() {
    if (!mode) return
    const newMode: SiteMode = mode === "production" ? "development" : "production"
    setSaving(true)
    setMsg("")
    try {
      const res = await fetch("/api/admin/site-mode", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode }),
      })
      const data = await res.json()
      if (res.ok) {
        setMode(data.mode)
        setMsg(data.mode === "production" ? "Mode Production activé. Le site est maintenant indexé par les moteurs de recherche." : "Mode Développement activé. Le site est masqué des moteurs de recherche.")
      } else {
        setMsg(data.error || "Erreur")
      }
    } catch {
      setMsg("Erreur de connexion")
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 dark:text-neutral-500">Chargement…</p>
      </div>
    )
  }

  const isProduction = mode === "production"

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode Toggle Card */}
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

        {msg && (
          <p className={`text-sm mt-3 px-3 py-2 rounded-lg ${msg.includes("Erreur") ? "text-red-600 bg-red-50 dark:bg-red-950/30" : "text-green-700 dark:text-green-400 bg-green-100/50 dark:bg-green-950/20"}`}>
            {msg}
          </p>
        )}
      </div>

      {/* Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatusCard
          label="robots.txt"
          value={isProduction ? "Allow All" : "Disallow All"}
          ok={isProduction}
        />
        <StatusCard
          label="sitemap.xml"
          value={isProduction ? "6 pages" : "Vide"}
          ok={isProduction}
        />
        <StatusCard
          label="Meta robots"
          value={isProduction ? "index, follow" : "noindex"}
          ok={isProduction}
        />
      </div>

      {/* Pages Indexation */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <h3 className="text-base font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
          État d&apos;indexation par page
        </h3>
        <div className="space-y-2">
          {PAGE_LIST.map((page) => (
            <div key={page.path} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8F5F0] dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                {isProduction ? (
                  <CheckCircle size={14} className="text-green-500" />
                ) : (
                  <AlertTriangle size={14} className="text-amber-500" />
                )}
                <span className="text-sm text-[#2E2E2E] dark:text-neutral-100">{page.label}</span>
                {page.critical && (
                  <span className="text-[10px] bg-[#C8A97E]/10 text-[#C8A97E] px-1.5 py-0.5 rounded font-medium">
                    Critique
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${isProduction ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                  {isProduction ? "Indexé" : "noindex"}
                </span>
                <a
                  href={`${SITE_URL}${page.path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-[#C8A97E] transition-colors"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Links */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <h3 className="text-base font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
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
        </div>
      </div>
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
