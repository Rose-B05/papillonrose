"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Download, FileText, Calendar, MapPin, CheckCircle, Clock } from "lucide-react"

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
  date_creation: string
  statut: string
  lignes: DecorationLigne[]
}

const DP = { fontFamily: "var(--font-playfair), serif" } as const

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

export default function PublicDevisPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [devis, setDevis] = useState<DecorationDevis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    fetch(`/api/devis/${token}`)
      .then(async (res) => {
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
  }, [token])

  async function handleDownloadPdf() {
    if (!devis) return
    setDownloading(true)
    try {
      const res = await fetch(`/api/devis-decoration/${devis.id}/pdf`)
      if (!res.ok) {
        alert("Erreur lors de la génération du PDF")
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Devis-${devis.numero}.pdf`
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
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#c27a72] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-secondary-text">Chargement de votre devis…</p>
        </div>
      </div>
    )
  }

  if (error || !devis) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-5">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileText size={28} className="text-red-400" />
          </div>
          <h1 style={DP} className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">
            Devis introuvable
          </h1>
          <p className="text-sm text-secondary-text dark:text-white/60 mb-6">
            {error || "Ce lien ne correspond à aucun devis."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#c27a72] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#a86660] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  const isExpired = devis.statut === "expired"
  const isAccepted = devis.statut === "accepte"
  const isSent = devis.statut === "envoye"

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/papillon-rose-logo.png"
              alt="Papillon Rose"
              width={140}
              height={40}
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-[10px] tracking-[0.4em] uppercase text-[#c27a72] dark:text-[#d4968e] font-medium mb-3">
            Devis décoration
          </p>
          <h1 style={DP} className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">
            {devis.titre_projet}
          </h1>
          <p className="text-sm text-secondary-text dark:text-white/60">
            N° {devis.numero} · Créé le {formatDateFr(devis.date_creation)}
          </p>

          {/* Status badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
            {isExpired ? (
              <>
                <Clock size={14} className="text-red-400" />
                <span className="text-red-500">Expiré</span>
              </>
            ) : isAccepted ? (
              <>
                <CheckCircle size={14} className="text-green-500" />
                <span className="text-green-600">Accepté</span>
              </>
            ) : isSent ? (
              <>
                <FileText size={14} className="text-[#c27a72]" />
                <span className="text-[#c27a72]">En attente de réponse</span>
              </>
            ) : (
              <>
                <FileText size={14} className="text-secondary-text" />
                <span className="text-secondary-text">Brouillon</span>
              </>
            )}
          </div>
        </div>

        {/* Client info */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-black/[0.07] dark:border-white/[0.08] shadow-sm mb-6">
          <h2 style={DP} className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
            Vos informations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-text dark:text-white/60 text-xs mb-1">Nom</p>
              <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{devis.client_nom}</p>
            </div>
            <div>
              <p className="text-secondary-text dark:text-white/60 text-xs mb-1">Email</p>
              <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{devis.client_email}</p>
            </div>
            {devis.client_telephone && (
              <div>
                <p className="text-secondary-text dark:text-white/60 text-xs mb-1">Téléphone</p>
                <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{devis.client_telephone}</p>
              </div>
            )}
          </div>
        </div>

        {/* Event info */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-black/[0.07] dark:border-white/[0.08] shadow-sm mb-6">
          <h2 style={DP} className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-[#c27a72]" />
            Dates de l&apos;événement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-secondary-text dark:text-white/60 text-xs mb-1">Début</p>
              <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{formatDateFr(devis.date_evenement_debut)}</p>
            </div>
            {devis.date_evenement_fin && (
              <div>
                <p className="text-secondary-text dark:text-white/60 text-xs mb-1">Fin</p>
                <p className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{formatDateFr(devis.date_evenement_fin)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Lignes */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-black/[0.07] dark:border-white/[0.08] shadow-sm mb-6">
          <h2 style={DP} className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">
            Détail des prestations
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                  <th className="text-left py-2 text-xs text-secondary-text dark:text-white/60 font-medium">Description</th>
                  <th className="text-center py-2 text-xs text-secondary-text dark:text-white/60 font-medium">Qté</th>
                  <th className="text-right py-2 text-xs text-secondary-text dark:text-white/60 font-medium">Prix unit.</th>
                  <th className="text-right py-2 text-xs text-secondary-text dark:text-white/60 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {devis.lignes.map((l, i) => (
                  <tr key={i} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                    <td className="py-3 text-[#2E2E2E] dark:text-neutral-100 font-medium">{l.description}</td>
                    <td className="py-3 text-center text-secondary-text dark:text-white/60">{l.quantite}</td>
                    <td className="py-3 text-right text-secondary-text dark:text-white/60">{formatEUR(l.prix_unitaire)}</td>
                    <td className="py-3 text-right font-semibold text-[#c27a72]">{formatEUR(l.prix_unitaire * l.quantite)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Total + paiement */}
        <div className="bg-[#2E2E2E] dark:bg-neutral-800 rounded-2xl p-6 text-white mb-6">
          <div className="text-center mb-6">
            <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Total de la prestation</p>
            <p style={DP} className="text-3xl font-bold text-[#c27a72]">{formatEUR(devis.total_ht)}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Acompte à la validation (25%)</p>
                {devis.date_echeance_accompte && (
                  <p className="text-white/50 text-xs mt-0.5">Avant le {formatDateFr(devis.date_echeance_accompte)}</p>
                )}
              </div>
              <p className="font-bold text-[#c27a72]">{formatEUR(devis.montant_accompte)}</p>
            </div>
            <div className="border-t border-white/10" />
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">Solde à régler (75%)</p>
                {devis.date_echeance_solde && (
                  <p className="text-white/50 text-xs mt-0.5">Avant le {formatDateFr(devis.date_echeance_solde)}</p>
                )}
              </div>
              <p className="font-bold text-[#c27a72]">{formatEUR(devis.montant_solde)}</p>
            </div>
          </div>
        </div>

        {/* Download */}
        <div className="text-center mb-8">
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center gap-2 bg-[#c27a72] text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-[#a86660] transition-colors disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? "Génération du PDF…" : "Télécharger le PDF"}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-black/[0.07] dark:border-white/[0.08]">
          <Image
            src="/papillon-rose-logo.png"
            alt="Papillon Rose"
            width={100}
            height={28}
            className="h-7 w-auto mx-auto mb-3 opacity-60"
          />
          <p className="text-[11px] text-secondary-text dark:text-white/40">
            Papillon Rose · Location mobilier &amp; décoration événements · Île-de-France
          </p>
          <Link href="/" className="text-[11px] text-[#c27a72] hover:underline mt-2 inline-block">
            papillonrose.fr
          </Link>
        </div>
      </div>
    </div>
  )
}
