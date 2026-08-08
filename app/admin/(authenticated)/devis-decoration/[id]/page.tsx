"use client"

import { use } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function DecorationDevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/devis"
        className="flex items-center gap-1.5 text-sm text-secondary-text dark:text-white/60 hover:text-[#c27a72] transition-colors"
      >
        <ArrowLeft size={15} /> Retour à la liste
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6 text-center py-16">
        <p className="text-secondary-text dark:text-white/60 text-sm">
          Page de détail du devis décoration <span className="font-mono text-[#c27a72]">{id}</span>
        </p>
        <p className="text-xs text-secondary-text dark:text-white/40 mt-2">
          Cette page sera développée dans un prochain prompt.
        </p>
      </div>
    </div>
  )
}
