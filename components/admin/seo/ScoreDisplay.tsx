"use client"

import type { SeoScore } from "@/lib/seo-center"
import { TrendingUp, AlertTriangle, Lightbulb } from "lucide-react"

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const circumference = 2 * Math.PI * 36
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="4"
            className="text-gray-200 dark:text-neutral-700" />
          <circle cx="40" cy="40" r="36" fill="none" strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset}
            className={color} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-[#2E2E2E] dark:text-neutral-100">{score}</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-neutral-400 text-center">{label}</span>
    </div>
  )
}

export default function ScoreDisplay({ score }: { score: SeoScore }) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          score.total >= 80 ? "bg-green-100 dark:bg-green-950/50" :
          score.total >= 50 ? "bg-amber-100 dark:bg-[#3A1E1E]/50" :
          "bg-red-100 dark:bg-red-950/50"
        }`}>
          <TrendingUp size={16} className={
            score.total >= 80 ? "text-green-600 dark:text-green-400" :
            score.total >= 50 ? "text-amber-600 dark:text-[#E8B4AE]" :
            "text-red-600 dark:text-red-400"
          } />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">
            Score global
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400">
            {score.total}/100
          </p>
        </div>
      </div>

      <div className="flex justify-around mb-5">
        <ScoreRing score={score.seo} label="SEO" color="stroke-blue-500" />
        <ScoreRing score={score.performance} label="Perf." color="stroke-green-500" />
        <ScoreRing score={score.accessibility} label="A11y" color="stroke-purple-500" />
        <ScoreRing score={score.security} label="Sécurité" color="stroke-orange-500" />
        <ScoreRing score={score.indexation} label="Indexation" color="stroke-cyan-500" />
      </div>

      {score.blockingIssues.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Points bloquants</span>
          </div>
          <div className="space-y-1">
            {score.blockingIssues.map((issue, i) => (
              <p key={i} className="text-sm text-[#2E2E2E] dark:text-neutral-100 pl-5">
                • {issue}
              </p>
            ))}
          </div>
        </div>
      )}

      {score.recommendations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-[#E8B4AE] uppercase tracking-wide">Recommandations</span>
          </div>
          <div className="space-y-1">
            {score.recommendations.map((rec, i) => (
              <p key={i} className="text-sm text-gray-600 dark:text-neutral-300 pl-5">
                • {rec}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
