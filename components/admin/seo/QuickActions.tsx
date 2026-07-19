"use client"

import { Zap, Play, Pause, RefreshCw, Trash2, Search, Link, Image, FileText } from "lucide-react"
import { useState } from "react"

interface QuickActionsProps {
  mode: string | null
  onToggleMode: () => void
}

export default function QuickActions({ mode, onToggleMode }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const isProduction = mode === "production"

  const actions = [
    {
      id: "toggle-mode",
      label: isProduction ? "Passer en Développement" : "Passer en Production",
      icon: isProduction ? Pause : Play,
      color: isProduction ? "bg-amber-500 hover:bg-amber-600" : "bg-green-500 hover:bg-green-600",
      textColor: "text-white",
      action: onToggleMode,
    },
    {
      id: "regen-robots",
      label: "Régénérer robots.txt",
      icon: FileText,
      color: "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
      textColor: "text-gray-700 dark:text-neutral-200",
      apiAction: "/api/admin/seo/robots",
      apiBody: { action: "regenerate" },
    },
    {
      id: "regen-sitemap",
      label: "Régénérer sitemap",
      icon: Globe,
      color: "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
      textColor: "text-gray-700 dark:text-neutral-200",
      apiAction: "/api/admin/seo/sitemap",
      apiBody: { action: "regenerate" },
    },
    {
      id: "clear-cache",
      label: "Vider le cache SEO",
      icon: Trash2,
      color: "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
      textColor: "text-gray-700 dark:text-neutral-200",
    },
    {
      id: "check-pages",
      label: "Vérifier toutes les pages",
      icon: Search,
      color: "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
      textColor: "text-gray-700 dark:text-neutral-200",
    },
    {
      id: "scan-links",
      label: "Scanner les liens cassés",
      icon: Link,
      color: "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
      textColor: "text-gray-700 dark:text-neutral-200",
    },
    {
      id: "scan-alt",
      label: "Scanner les images ALT",
      icon: Image,
      color: "bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600",
      textColor: "text-gray-700 dark:text-neutral-200",
    },
  ]

  async function handleAction(action: typeof actions[0]) {
    if (action.action) {
      action.action()
      return
    }
    if (action.apiAction) {
      setLoading(action.id)
      try {
        await fetch(action.apiAction, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action.apiBody),
        })
      } catch {}
      setLoading(null)
    }
  }

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#C9948E]/10">
          <Zap size={16} className="text-[#C9948E]" />
        </div>
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Actions rapides</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => handleAction(action)}
              disabled={loading !== null}
              className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${action.color} ${action.textColor}`}
            >
              <Icon size={12} />
              {loading === action.id ? "..." : action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Globe({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  )
}
