"use client"

import { BarChart3, ExternalLink } from "lucide-react"

const VERCEL_ANALYTICS_URL = "https://vercel.com/rosedigitalcampus-4666s-projects/papillon-rose/analytics"

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#C8A97E] dark:text-amber-400" />
            Analytics
          </h1>
          <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
            Trafic et visiteurs — Vercel Web Analytics
          </p>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-10 shadow-sm border border-black/[0.07] dark:border-white/[0.08] text-center">
          <BarChart3 className="w-12 h-12 text-[#C8A97E] dark:text-amber-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-[#2E2E2E] dark:text-neutral-100 mb-2">
            Tableau de bord Vercel Analytics
          </h2>
          <p className="text-sm text-gray-500 dark:text-neutral-500 mb-6 max-w-md mx-auto">
            Les données de trafic sont collectées automatiquement par Vercel Web Analytics.
            Consulte le dashboard Vercel pour voir les statistiques détaillées.
          </p>
          <a
            href={VERCEL_ANALYTICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C8A97E] dark:bg-amber-600 text-white rounded-xl font-medium hover:bg-[#b8996e] dark:hover:bg-amber-500 transition-colors"
          >
            Ouvrir le dashboard
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}
