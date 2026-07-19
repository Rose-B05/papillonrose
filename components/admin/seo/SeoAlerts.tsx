"use client"

import { AlertTriangle, CheckCircle, Info, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { SeoAlert } from "@/lib/seo-center"

export default function SeoAlerts({ alerts }: { alerts: SeoAlert[] }) {
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState<"all" | "error" | "warning" | "info">("all")

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.type === filter)
  const errors = alerts.filter((a) => a.type === "error").length
  const warnings = alerts.filter((a) => a.type === "warning").length

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${errors > 0 ? "bg-red-100 dark:bg-red-950/50" : warnings > 0 ? "bg-amber-100 dark:bg-[#3A1E1E]/50" : "bg-green-100 dark:bg-green-950/50"}`}>
            {errors > 0 ? (
              <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
            ) : warnings > 0 ? (
              <AlertTriangle size={16} className="text-amber-600 dark:text-[#E8B4AE]" />
            ) : (
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Alertes
            </h3>
            <p className="text-xs text-gray-500 dark:text-white/70">
              {errors} erreur(s), {warnings} avertissement(s)
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-3">
          <div className="flex gap-2">
            {(["all", "error", "warning", "info"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                  filter === f
                    ? "bg-[#C9948E] text-white"
                    : "bg-gray-100 dark:bg-neutral-700 text-gray-600 dark:text-neutral-300 hover:bg-gray-200 dark:hover:bg-neutral-600"
                }`}
              >
                {f === "all" ? "Toutes" : f === "error" ? "Erreurs" : f === "warning" ? "Avertissements" : "Infos"}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-white/60 text-center py-4">
              Aucune alerte
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    alert.type === "error"
                      ? "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
                      : alert.type === "warning"
                      ? "bg-amber-50 dark:bg-[#3A1E1E]/20 border border-amber-200 dark:border-[#4A2828]"
                      : "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {alert.type === "error" ? (
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
                  ) : alert.type === "warning" ? (
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#2E2E2E] dark:text-neutral-100">
                      {alert.message}
                    </p>
                    {alert.page && (
                      <p className="text-xs text-gray-500 dark:text-white/70 mt-0.5">
                        {alert.page}
                      </p>
                    )}
                    {alert.action && (
                      <p className="text-xs text-[#C9948E] mt-1">
                        {alert.action}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
