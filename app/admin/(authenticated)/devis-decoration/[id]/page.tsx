"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft, Download, FileText, Calendar, User, Mail, Phone,
  Plus, CreditCard, CheckCircle, AlertCircle,
} from "lucide-react"

interface DecorationLigne {
  description: string
  quantite: number
  prix_unitaire: number
}

interface Versement {
  id: string
  montant: number
  date_versement: string
  methode: string | null
  type: string | null
  commentaire: string | null
}

interface DecorationDevis {
  id: string
  numero: string
  token_public: string
  type_document: string
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
  versements: Versement[]
  montant_total_verse: number
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

const METHODES = ["Espèces", "Paylib", "Virement"]

const STATUT_LABELS: Record<string, { label: string; color: string }> = {
  brouillon: { label: "Brouillon", color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300" },
  envoye: { label: "Envoyé", color: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  acompte_verse: { label: "Acompte versé", color: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  solde: { label: "Soldé", color: "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400" },
  annule: { label: "Annulé", color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
  expired: { label: "Expiré", color: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
}

export default function DecorationDevisDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [devis, setDevis] = useState<DecorationDevis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)

  // Versement form state
  const [showVersementForm, setShowVersementForm] = useState(false)
  const [versementMontant, setVersementMontant] = useState("")
  const [versementDate, setVersementDate] = useState(new Date().toISOString().split("T")[0])
  const [versementMethode, setVersementMethode] = useState("Virement")
  const [versementCommentaire, setVersementCommentaire] = useState("")
  const [submittingVersement, setSubmittingVersement] = useState(false)
  const [versementError, setVersementError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/devis-decoration/${id}`)
      .then(async (res) => {
        if (res.status === 401) { router.push("/admin/login"); return }
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
      if (res.status === 401) { router.push("/admin/login"); return }
      if (!res.ok) { alert("Erreur lors de la génération du PDF"); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Devis-${devis?.numero || id}.pdf`
      document.body.appendChild(a)
      a.click()
      URL.revokeObjectURL(url)
      a.remove()
    } catch { alert("Erreur lors du téléchargement") }
    setDownloading(false)
  }

  async function handleSubmitVersement(e: React.FormEvent) {
    e.preventDefault()
    setVersementError(null)

    const montant = parseFloat(versementMontant)
    if (!montant || montant <= 0) {
      setVersementError("Le montant doit être supérieur à 0")
      return
    }

    setSubmittingVersement(true)
    try {
      const res = await fetch(`/api/devis-decoration/${id}/versements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          montant,
          date_versement: versementDate,
          methode: versementMethode,
          commentaire: versementCommentaire.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setVersementError(data.error || "Erreur lors de l'enregistrement")
        return
      }
      setDevis(data.devis)
      setVersementMontant("")
      setVersementCommentaire("")
      setVersementDate(new Date().toISOString().split("T")[0])
      setShowVersementForm(false)
    } catch {
      setVersementError("Erreur réseau")
    }
    setSubmittingVersement(false)
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
        <Link href="/admin/devis-decoration" className="flex items-center gap-1.5 text-sm text-secondary-text hover:text-[#c27a72] transition-colors">
          <ArrowLeft size={15} /> Retour à la liste
        </Link>
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8 text-center">
          <p className="text-secondary-text dark:text-white/60">{error || "Devis introuvable"}</p>
        </div>
      </div>
    )
  }

  const totalVerse = devis.montant_total_verse
  const soldeRestant = Math.max(0, devis.total_ht - totalVerse)
  const pctRegle = devis.total_ht > 0 ? Math.min(100, (totalVerse / devis.total_ht) * 100) : 0
  const isFacture = devis.type_document === "facture"
  const docLabel = isFacture ? "Facture" : "Devis"
  const statutInfo = STATUT_LABELS[devis.statut] || { label: devis.statut, color: "bg-neutral-100 text-neutral-600" }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/admin/devis-decoration" className="flex items-center gap-1.5 text-sm text-secondary-text hover:text-[#c27a72] transition-colors">
        <ArrowLeft size={15} /> Retour à la liste
      </Link>

      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
              {docLabel} {devis.numero}
            </h2>
            <p className="text-sm text-secondary-text dark:text-white/60 mt-1">{devis.titre_projet}</p>
            <div className="flex items-center gap-3 mt-2 text-xs text-secondary-text dark:text-white/50">
              <span>Créé le {formatDateFr(devis.date_creation)}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statutInfo.color}`}>
                {statutInfo.label}
              </span>
              {isFacture && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#c27a72]/10 text-[#c27a72]">
                  Facture
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPdf} disabled={downloading}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#c27a72] rounded-xl hover:bg-[#a86660] transition-colors disabled:opacity-50">
              <Download size={15} />
              {downloading ? "Génération…" : "PDF"}
            </button>
            <a href={`/devis/${devis.token_public}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[#c27a72] bg-[#c27a72]/10 rounded-xl hover:bg-[#c27a72]/20 transition-colors">
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
            <User size={14} className="text-[#c27a72]" /> Client
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
            <Calendar size={14} className="text-[#c27a72]" /> Événement
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
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Prestations</h3>
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

      {/* ========== SECTION VERSEMENTS ========== */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 flex items-center gap-2">
            <CreditCard size={14} className="text-[#c27a72]" />
            Versements
          </h3>
          <button
            onClick={() => { setShowVersementForm(!showVersementForm); setVersementError(null) }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#c27a72] bg-[#c27a72]/10 rounded-lg hover:bg-[#c27a72]/20 transition-colors"
          >
            <Plus size={13} />
            Ajouter un versement
          </button>
        </div>

        {/* Récapitulatif */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-[#f8f5f0] dark:bg-neutral-700/50 rounded-xl p-4 text-center">
            <p className="text-[10px] text-secondary-text uppercase tracking-wider mb-1">Total versé</p>
            <p className="text-lg font-bold text-[#c27a72]">{formatEUR(totalVerse)}</p>
          </div>
          <div className="bg-[#f8f5f0] dark:bg-neutral-700/50 rounded-xl p-4 text-center">
            <p className="text-[10px] text-secondary-text uppercase tracking-wider mb-1">Solde restant</p>
            <p className={`text-lg font-bold ${soldeRestant <= 0 ? "text-green-500" : "text-[#2E2E2E] dark:text-neutral-100"}`}>
              {formatEUR(soldeRestant)}
            </p>
          </div>
          <div className="bg-[#f8f5f0] dark:bg-neutral-700/50 rounded-xl p-4 text-center">
            <p className="text-[10px] text-secondary-text uppercase tracking-wider mb-1">% réglé</p>
            <p className="text-lg font-bold text-[#c27a72]">{pctRegle.toFixed(0)}%</p>
          </div>
        </div>

        {/* Barre de progression */}
        <div className="w-full h-2 bg-neutral-100 dark:bg-neutral-700 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-[#c27a72] rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, pctRegle)}%` }}
          />
        </div>

        {/* Formulaire d'ajout */}
        {showVersementForm && (
          <form onSubmit={handleSubmitVersement} className="bg-[#f8f5f0] dark:bg-neutral-700/30 rounded-xl p-5 mb-6 border border-[#c27a72]/20">
            <h4 className="text-xs font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4 uppercase tracking-wider">
              Ajouter un versement
            </h4>

            {versementError && (
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 text-xs p-3 rounded-lg mb-4">
                <AlertCircle size={14} />
                {versementError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-secondary-text mb-1.5">Montant (€)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={versementMontant}
                  onChange={(e) => setVersementMontant(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-black/[0.08] dark:border-white/[0.12] rounded-xl bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c27a72]/30 focus:border-[#c27a72]"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-text mb-1.5">Date du versement</label>
                <input
                  type="date"
                  value={versementDate}
                  onChange={(e) => setVersementDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm border border-black/[0.08] dark:border-white/[0.12] rounded-xl bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c27a72]/30 focus:border-[#c27a72]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-secondary-text mb-1.5">Méthode</label>
                <select
                  value={versementMethode}
                  onChange={(e) => setVersementMethode(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-black/[0.08] dark:border-white/[0.12] rounded-xl bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c27a72]/30 focus:border-[#c27a72]"
                >
                  {METHODES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-text mb-1.5">Commentaire (optionnel)</label>
                <input
                  type="text"
                  value={versementCommentaire}
                  onChange={(e) => setVersementCommentaire(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-black/[0.08] dark:border-white/[0.12] rounded-xl bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-[#c27a72]/30 focus:border-[#c27a72]"
                  placeholder="Ex: Virement reçu"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowVersementForm(false); setVersementError(null) }}
                className="px-4 py-2 text-xs font-medium text-secondary-text hover:text-[#2E2E2E] transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submittingVersement || !versementMontant || parseFloat(versementMontant) <= 0}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-medium text-white bg-[#c27a72] rounded-xl hover:bg-[#a86660] transition-colors disabled:opacity-50"
              >
                <CreditCard size={13} />
                {submittingVersement ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </form>
        )}

        {/* Tableau des versements */}
        {devis.versements.length === 0 ? (
          <div className="text-center py-8 text-sm text-secondary-text dark:text-white/40">
            <CreditCard size={28} className="mx-auto mb-3 opacity-30" />
            <p>Aucun versement enregistré</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                  <th className="text-left py-2 text-xs text-secondary-text font-medium">Date</th>
                  <th className="text-right py-2 text-xs text-secondary-text font-medium">Montant</th>
                  <th className="text-center py-2 text-xs text-secondary-text font-medium">Méthode</th>
                  <th className="text-center py-2 text-xs text-secondary-text font-medium">Type</th>
                  <th className="text-left py-2 text-xs text-secondary-text font-medium">Note</th>
                </tr>
              </thead>
              <tbody>
                {devis.versements.map((v) => (
                  <tr key={v.id} className="border-b border-black/[0.04] dark:border-white/[0.04] last:border-0">
                    <td className="py-3 text-[#2E2E2E] dark:text-neutral-100">{formatDateFr(v.date_versement)}</td>
                    <td className="py-3 text-right font-semibold text-[#c27a72]">{formatEUR(v.montant)}</td>
                    <td className="py-3 text-center text-secondary-text">{v.methode || "—"}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        v.type === "solde" ? "bg-green-50 text-green-600" :
                        v.type === "acompte" ? "bg-amber-50 text-amber-600" :
                        "bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300"
                      }`}>
                        {v.type === "acompte" ? "Acompte" : v.type === "solde" ? "Solde" : "Intermédiaire"}
                      </span>
                    </td>
                    <td className="py-3 text-secondary-text text-xs italic max-w-[200px] truncate">{v.commentaire || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes internes */}
      {devis.notes_internes && (
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2">Notes internes</h3>
          <p className="text-sm text-amber-700 dark:text-amber-300 whitespace-pre-line">{devis.notes_internes}</p>
        </div>
      )}
    </div>
  )
}
