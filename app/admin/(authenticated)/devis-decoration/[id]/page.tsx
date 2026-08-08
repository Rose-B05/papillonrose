"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Download, FileText, Calendar, User, Mail, Phone } from "lucide-react"

interface DecorationLigne {
  description: string
  quantite: number
  prix_unitaire: number
}

interface DecorationDevis {
  id: string
  numero: string
  token_public: string
  client_nom: string
  client_email: string
  client_telephone?: string
  titre_projet: string
  date_evenement_debut: string
  date_evenement_fin?: string
  total_ht: number
  pourcentage_main_oeuvre: number
  montant_accompte: number
  date_echeance_accompte?: string
  montant_solde: number
  date_echeance_solde?: string
  iban: string
  bic: string
  date_creation: string
  statut: string
  notes_internes?: string
  lignes: DecorationLigne[]
}

function formatEUR(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`
}

function formatDateFr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function DecorationDevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [devis, setDevis] = useState<DecorationDevis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch(`/api/devis-decoration/${id}`)
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/admin/login")
          return
        }
        if (!res.ok) {
          const data = await res.json().catch(() => null)
          setError(data?.error || "Devis introuvable")
          return
        }
        const data = await res.json()
        setDevis(data.devis)
      })
      .catch(() => setError("Erreur de chargement"))
      .finally(() => setLoading(false))
  }, [id, router])

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
      a.download = `Devis-${devis?.numero || id}.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      a.remove()
    } catch {
      alert("Erreur lors du téléchargement")
    }
    setDownloading(false)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-32" />
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-64" />
          <div className="h-64 bg-neutral-200 dark:bg-neutral-700 rounded" />
        </div>
      </div>
    )
  }

  if (error || !devis) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href="/admin/devis-decoration"
          className="flex items-center gap-1.5 text-sm text-secondary-text dark:text-white/60 hover:text-[#c27a72] transition-colors"
        >
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8 text-center">
          <p className="text-secondary-text dark:text-white/60">{error || "Devis introuvable"}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/devis-decoration"
        className="flex items-center gap-1.5 text-sm text-secondary-text dark:text-white/60 hover:text-[#c27a72] transition-colors"
      >
        <ArrowLeft size={15} /> Retour à la liste
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Devis {devis.numero}
            </h2>
            <p className="text-sm text-secondary-text dark:text-white/60 mt-1">
              {devis.titre_projet}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-secondary-text dark:text-white/50">
              <span>Créé le {formatDateFr(devis.date_creation)}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300">
                {devis.statut}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#c27a72] rounded-xl hover:bg-[#a86660] transition-colors disabled:opacity-50"
            >
              <Download size={15} />
              {downloading ? "Génération…" : "PDF"}
            </button>
            <a
              href={`/devis/${devis.token_public}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#c27a72] bg-[#c27a72]/10 rounded-xl hover:bg-[#c27a72]/20 transition-colors"
            >
              <FileText size={15} />
              Vue client
            </a>
          </div>
        </div>
      </div>

      {/* Client + dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4 flex items-center gap-2">
            <User size={14} className="text-[#c27a72]" />
            Client
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <User size={13} className="text-secondary-text" />
              <span className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{devis.client_nom}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={13} className="text-secondary-text" />
              <a href={`mailto:${devis.client_email}`} className="text-[#c27a72] hover:underline">{devis.client_email}</a>
            </div>
            {devis.client_telephone && (
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-secondary-text" />
                <a href={`tel:${devis.client_telephone}`} className="text-[#c27a72] hover:underline">{devis.client_telephone}</a>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Calendar size={14} className="text-[#c27a72]" />
            Événement
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-secondary-text text-xs mb-1">Début</p>
              <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{formatDateFr(devis.date_evenement_debut)}</p>
            </div>
            {devis.date_evenement_fin && (
              <div>
                <p className="text-secondary-text text-xs mb-1">Fin</p>
                <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{formatDateFr(devis.date_evenement_fin)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
          Prestations
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                <th className="text-left py-2 text-xs text-secondary-text font-medium">Description</th>
                <th className="text-center py-2 text-xs text-secondary-text font-medium">Qté</th>
                <th className="text-right py-2 text-xs text-secondary-text font-medium">Prix unit.</th>
                <th className="text-right py-2 text-xs text-secondary-text font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {devis.lignes.map((l, i) => (
                <tr key={i} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                  <td className="py-3 text-[#2E2E2E] dark:text-neutral-100 font-medium">{l.description}</td>
                  <td className="py-3 text-center text-secondary-text">{l.quantite}</td>
                  <td className="py-3 text-right text-secondary-text">{formatEUR(l.prix_unitaire)}</td>
                  <td className="py-3 text-right font-semibold text-[#c27a72]">{formatEUR(l.prix_unitaire * l.quantite)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totaux */}
      <div className="bg-[#2E2E2E] dark:bg-neutral-800 rounded-2xl p-6 text-white">
        <div className="text-center mb-6">
          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total HT</p>
          <p className="text-3xl font-bold text-[#c27a72]">{formatEUR(devis.total_ht)}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-white/70">Main d&apos;œuvre ({devis.pourcentage_main_oeuvre}%)</span>
            <span className="font-medium">{formatEUR(devis.total_ht * (devis.pourcentage_main_oeuvre / 100))}</span>
          </div>
          <div className="border-t border-white/10" />
          <div className="flex justify-between">
            <span className="text-white/70">Acompte (25%)</span>
            <span className="font-bold text-[#c27a72]">{formatEUR(devis.montant_accompte)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Solde (75%)</span>
            <span className="font-bold text-[#c27a72]">{formatEUR(devis.montant_solde)}</span>
          </div>
        </div>
      </div>

      {/* Notes internes */}
      {devis.notes_internes && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Notes internes
          </h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-line">
            {devis.notes_internes}
          </p>
        </div>
      )}
    </div>
  )
}
