"use client"

import { Globe, RefreshCw, Download, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"
import type { SitemapInfo } from "@/lib/seo-center"

export default function SitemapPanel({ info }: { info: SitemapInfo }) {
  const [loading, setLoading] = useState(false)
  const [validateMsg, setValidateMsg] = useState("")

  async function handleAction(action: string) {
    setLoading(true)
    setValidateMsg("")
    try {
      const res = await fetch("/api/admin/seo/sitemap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.message) setValidateMsg(data.message)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-neutral-700">
            <Globe size={16} className="text-gray-600 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">sitemap.xml</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              {info.urlCount} URLs • {(info.sizeBytes / 1024).toFixed(1)} Ko
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {info.status === "valid" ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
              <CheckCircle size={12} /> Valide
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-1 rounded-full">
              <AlertTriangle size={12} /> {info.status === "empty" ? "Vide" : "Erreur"}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-neutral-400">URLs</p>
          <p className="text-lg font-bold text-[#2E2E2E] dark:text-neutral-100">{info.urlCount}</p>
        </div>
        <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg p-3">
          <p className="text-xs text-gray-500 dark:text-neutral-400">Dernière génération</p>
          <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">
            {new Date(info.lastGenerated).toLocaleDateString("fr-FR")}
          </p>
        </div>
      </div>

      {validateMsg && (
        <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/20 p-2 rounded-lg mb-4">
          {validateMsg}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleAction("regenerate")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#C8A97E] text-white hover:bg-[#B8926E] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={12} /> Régénérer
        </button>
        <button
          onClick={() => handleAction("download")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          <Download size={12} /> Télécharger
        </button>
        <a
          href="/sitemap.xml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
        >
          <ExternalLink size={12} /> Ouvrir
        </a>
        <button
          onClick={() => handleAction("validate")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          Valider
        </button>
      </div>
    </div>
  )
}
