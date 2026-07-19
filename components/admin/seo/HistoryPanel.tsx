"use client"

import { History, RotateCcw, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { SeoHistoryEntry } from "@/lib/seo-center"

export default function HistoryPanel({ history }: { history: SeoHistoryEntry[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-neutral-700">
            <History size={16} className="text-gray-600 dark:text-neutral-300" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Historique</h3>
            <p className="text-xs text-gray-500 dark:text-white/70">{history.length} entrée(s)</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-white/60 text-center py-4">
              Aucune action enregistrée
            </p>
          ) : (
            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F8F5F0] dark:bg-neutral-900"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2E2E2E] dark:text-neutral-100">{entry.action}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500 dark:text-white/70">
                        {new Date(entry.date).toLocaleDateString("fr-FR")} {new Date(entry.date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-white/60">•</span>
                      <span className="text-xs text-gray-500 dark:text-white/70">{entry.user}</span>
                      <span className="text-xs text-gray-400 dark:text-white/60">•</span>
                      <span className="text-xs text-gray-500 dark:text-white/70">{entry.result}</span>
                    </div>
                  </div>
                  {entry.rollbackAvailable && (
                    <button className="text-gray-400 hover:text-[#C9948E] transition-colors ml-2">
                      <RotateCcw size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
