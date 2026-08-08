"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download } from "lucide-react"

export default function DecorationDevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [downloading, setDownloading] = useState(false)

  async function handleDownloadPdf() {
    setDownloading(true)
    try {
      const res = await fetch(`/api/devis-decoration/${id}/pdf`)
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      if (!res.ok) {
        alert("Erreur lors de la génération du PDF")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Devis-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      a.remove()
    } catch {
      alert("Erreur lors du téléchargement")
    }
    setDownloading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/devis"
        className="flex items-center gap-1.5 text-sm text-secondary-text dark:text-white/60 hover:text-[#c27a72] transition-colors"
      >
        <ArrowLeft size={15} /> Retour à la liste
      </Link>

      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Devis décoration
            </h2>
            <p className="text-sm text-secondary-text dark:text-white/60 mt-1">
              ID : <span className="font-mono text-[#c27a72]">{id}</span>
            </p>
          </div>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#c27a72] rounded-xl hover:bg-[#a86660] transition-colors disabled:opacity-50"
          >
            <Download size={15} />
            {downloading ? "Génération…" : "Télécharger le PDF"}
          </button>
        </div>

        <div className="text-center py-8">
          <p className="text-secondary-text dark:text-white/40 text-sm">
            La page de détail complète sera développée dans un prochain prompt.
          </p>
        </div>
      </div>
    </div>
  )
}
