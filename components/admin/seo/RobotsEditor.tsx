"use client"

import { FileText, RefreshCw, Download, CheckCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"
import type { RobotsInfo } from "@/lib/seo-center"

export default function RobotsEditor({ info }: { info: RobotsInfo }) {
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState(info.content)

  async function handleAction(action: string) {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/seo/robots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.content) setContent(data.content)
    } catch {}
    setLoading(false)
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-neutral-700">
            <FileText size={16} className="text-gray-600 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">robots.txt</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400">
              Modifié le {new Date(info.lastModified).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {info.isValid ? (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
              <CheckCircle size={12} /> Valide
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded-full">
              <AlertTriangle size={12} /> Erreur
            </span>
          )}
        </div>
      </div>

      <pre className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg p-4 text-sm font-mono text-[#2E2E2E] dark:text-neutral-100 overflow-x-auto mb-4 whitespace-pre-wrap">
        {content}
      </pre>

      {info.warnings.length > 0 && (
        <div className="mb-4 space-y-1">
          {info.warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 dark:text-amber-400">⚠ {w}</p>
          ))}
        </div>
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
          onClick={() => handleAction("restore")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          Restaurer
        </button>
        <button
          onClick={() => handleAction("download")}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors disabled:opacity-50"
        >
          <Download size={12} /> Télécharger
        </button>
      </div>
    </div>
  )
}
