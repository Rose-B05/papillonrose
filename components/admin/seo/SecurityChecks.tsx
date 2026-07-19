"use client"

import { Shield, CheckCircle, AlertTriangle } from "lucide-react"
import type { SecurityCheck } from "@/lib/seo-center"

export default function SecurityChecks({ checks }: { checks: SecurityCheck[] }) {
  const passed = checks.filter((c) => c.passed).length
  const failed = checks.filter((c) => !c.passed).length
  const allPassed = failed === 0

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${allPassed ? "bg-green-100 dark:bg-green-950/50" : "bg-red-100 dark:bg-red-950/50"}`}>
          <Shield size={16} className={allPassed ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"} />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">
            Vérifications pré-production
          </h3>
          <p className="text-xs text-gray-500 dark:text-white/70">
            {passed}/{checks.length} vérifications passées
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.name}
            className={`flex items-center gap-3 p-2.5 rounded-lg ${
              check.passed
                ? "bg-green-50 dark:bg-green-950/20"
                : "bg-red-50 dark:bg-red-950/20"
            }`}
          >
            {check.passed ? (
              <CheckCircle size={14} className="text-green-500 flex-shrink-0" />
            ) : (
              <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#2E2E2E] dark:text-neutral-100">{check.label}</p>
              <p className="text-xs text-gray-500 dark:text-white/70">{check.message}</p>
            </div>
          </div>
        ))}
      </div>

      {!allPassed && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">
            Le passage en Production est bloqué. Corrigez les erreurs ci-dessus.
          </p>
        </div>
      )}
    </div>
  )
}
