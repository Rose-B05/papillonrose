"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import DevisStatutBadge from "@/components/admin/devis/DevisStatutBadge"
import type { Devis, DevisStatut, DevisLigne } from "@/lib/devis/types"
import { ArrowLeft, Save, Send, Trash2, Plus, X } from "lucide-react"

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

export default function DevisDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [devis, setDevis] = useState<Devis | null>(null)
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sendingId, setSendingId] = useState<string | null>(null)

  // Editable fields
  const [client, setClient] = useState({ nom: "", prenom: "", email: "", telephone: "" })
  const [dateDebut, setDateDebut] = useState("")
  const [dateFin, setDateFin] = useState("")
  const [fraisLivraison, setFraisLivraison] = useState(0)
  const [remise, setRemise] = useState(0)
  const [notesInternes, setNotesInternes] = useState("")
  const [lignes, setLignes] = useState<DevisLigne[]>([])

  const loadDevis = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/devis/${id}`)
      if (res.status === 401) {
        router.push("/admin/login")
        return
      }
      const data = await res.json()
      if (data.devis) {
        setDevis(data.devis)
        setClient(data.devis.client)
        setDateDebut(data.devis.dateDebut || "")
        setDateFin(data.devis.dateFin || "")
        setFraisLivraison(data.devis.fraisLivraison || 0)
        setRemise(data.devis.remise || 0)
        setNotesInternes(data.devis.notesInternes || "")
        setLignes(data.devis.lignes || [])
      }
    } catch {}
    setLoading(false)
  }, [id, router])

  useEffect(() => { loadDevis() }, [loadDevis])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/devis", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: devis!.id,
          client,
          lignes,
          dateDebut,
          dateFin,
          fraisLivraison,
          remise,
          notesInternes,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setDevis(data.devis)
        setEditMode(false)
      }
    } catch {}
    setSaving(false)
  }

  async function handleStatusChange(statut: DevisStatut) {
    const res = await fetch(`/api/admin/devis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut }),
    })
    if (res.ok) {
      const data = await res.json()
      setDevis(data.devis)
    }
  }

  async function handleSend() {
    setSendingId(id)
    try {
      const res = await fetch("/api/admin/devis/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        await loadDevis()
        alert("Devis envoyé !")
      } else {
        const data = await res.json()
        alert(data.error || "Erreur")
      }
    } catch {
      alert("Erreur lors de l'envoi")
    }
    setSendingId(null)
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce devis ?")) return
    await fetch(`/api/admin/devis/${id}`, { method: "DELETE" })
    router.push("/admin/devis")
  }

  function updateLigne(index: number, field: keyof DevisLigne, value: string | number) {
    setLignes((prev) =>
      prev.map((l, i) => {
        if (i !== index) return l
        const updated = { ...l, [field]: value }
        if (field === "prixUnitaire" || field === "quantite") {
          updated.sousTotal = updated.prixUnitaire * updated.quantite
        }
        return updated
      })
    )
  }

  function removeLigne(index: number) {
    setLignes((prev) => prev.filter((_, i) => i !== index))
  }

  function addLigne() {
    setLignes((prev) => [
      ...prev,
      { productId: 0, nom: "", quantite: 1, prixUnitaire: 0, sousTotal: 0, dimension: "" },
    ])
  }

  const totalHt = lignes.reduce((s, l) => s + l.sousTotal, 0)
  const remiseMontant = totalHt * remise / 100
  const tva = (totalHt - remiseMontant) * 0.2
  const totalTtc = totalHt - remiseMontant + tva + fraisLivraison

  if (loading) {
    return (
      <AdminShell title="Devis">
        <div className="text-center py-16 text-gray-400 dark:text-white/60">Chargement…</div>
      </AdminShell>
    )
  }

  if (!devis) {
    return (
      <AdminShell title="Devis introuvable">
        <div className="text-center py-16">
          <p className="text-gray-400 dark:text-white/60 mb-4">Ce devis n&apos;existe pas.</p>
          <button onClick={() => router.push("/admin/devis")} className="text-[#C9948E] hover:underline">
            ← Retour à la liste
          </button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell
      title={devis.quoteNumber}
      action={
        <div className="flex items-center gap-2">
          {!editMode ? (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Modifier
              </button>
              {(devis.statut === "en_attente" || devis.statut === "en_preparation") && (
                <button
                  onClick={handleSend}
                  disabled={sendingId === id}
                  className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                >
                  <Send size={13} className="inline mr-1" />
                  Envoyer
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 text-xs bg-[#C9948E] text-white rounded-lg hover:bg-[#B8807A] transition-colors disabled:opacity-50"
              >
                <Save size={13} className="inline mr-1" />
                {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
              <button
                onClick={() => { setEditMode(false); loadDevis() }}
                className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
              >
                Annuler
              </button>
            </>
          )}
        </div>
      }
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Status & Dates */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <div className="flex items-center gap-3 mb-4">
            <DevisStatutBadge statut={devis.statut} />
            <span className="text-xs text-gray-400 dark:text-white/50">
              Créé le {formatDate(devis.creeLe)}
            </span>
            {devis.envoyeLe && (
              <span className="text-xs text-gray-400 dark:text-white/50">
                · Envoyé le {formatDate(devis.envoyeLe)}
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/60 mb-1">Date de début</label>
              {editMode ? (
                <input
                  type="date"
                  value={dateDebut}
                  onChange={(e) => setDateDebut(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">{formatDate(devis.dateDebut)}</p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/60 mb-1">Date de fin</label>
              {editMode ? (
                <input
                  type="date"
                  value={dateFin}
                  onChange={(e) => setDateFin(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
                />
              ) : (
                <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">{formatDate(devis.dateFin)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Client</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(["prenom", "nom", "email", "telephone"] as const).map((field) => (
              <div key={field}>
                <label className="block text-xs text-gray-500 dark:text-white/60 mb-1 capitalize">{field}</label>
                {editMode ? (
                  <input
                    type={field === "email" ? "email" : "text"}
                    value={client[field]}
                    onChange={(e) => setClient((prev) => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
                  />
                ) : (
                  <p className="text-sm text-[#2E2E2E] dark:text-neutral-100">{client[field]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Articles ({lignes.length})</h3>
            {editMode && (
              <button onClick={addLigne} className="text-xs text-[#C9948E] hover:underline flex items-center gap-1">
                <Plus size={13} /> Ajouter
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="text-left py-2 text-xs text-gray-500 dark:text-white/60">Article</th>
                  <th className="text-left py-2 text-xs text-gray-500 dark:text-white/60 hidden sm:table-cell">Dimension</th>
                  <th className="text-center py-2 text-xs text-gray-500 dark:text-white/60">Qté</th>
                  <th className="text-right py-2 text-xs text-gray-500 dark:text-white/60">Prix unit.</th>
                  <th className="text-right py-2 text-xs text-gray-500 dark:text-white/60">Sous-total</th>
                  {editMode && <th className="w-8"></th>}
                </tr>
              </thead>
              <tbody>
                {lignes.map((ligne, i) => (
                  <tr key={i} className="border-b border-black/[0.04] dark:border-white/[0.05]">
                    <td className="py-2">
                      {editMode ? (
                        <input
                          value={ligne.nom}
                          onChange={(e) => updateLigne(i, "nom", e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded text-sm"
                        />
                      ) : (
                        <span className="text-[#2E2E2E] dark:text-neutral-100">{ligne.nom}</span>
                      )}
                    </td>
                    <td className="py-2 hidden sm:table-cell">
                      {editMode ? (
                        <input
                          value={ligne.dimension || ""}
                          onChange={(e) => updateLigne(i, "dimension", e.target.value)}
                          className="w-full px-2 py-1 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded text-sm"
                        />
                      ) : (
                        <span className="text-gray-500 dark:text-white/60">{ligne.dimension || "—"}</span>
                      )}
                    </td>
                    <td className="py-2 text-center">
                      {editMode ? (
                        <input
                          type="number"
                          min={1}
                          value={ligne.quantite}
                          onChange={(e) => updateLigne(i, "quantite", Number(e.target.value))}
                          className="w-16 px-2 py-1 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded text-sm text-center"
                        />
                      ) : (
                        <span>{ligne.quantite}</span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {editMode ? (
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={ligne.prixUnitaire}
                          onChange={(e) => updateLigne(i, "prixUnitaire", Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded text-sm text-right"
                        />
                      ) : (
                        <span>{ligne.prixUnitaire.toFixed(2)} €</span>
                      )}
                    </td>
                    <td className="py-2 text-right font-medium text-[#C9948E] dark:text-[#E8B4AE]">
                      {ligne.sousTotal.toFixed(2)} €
                    </td>
                    {editMode && (
                      <td className="py-2">
                        <button onClick={() => removeLigne(i)} className="text-gray-400 hover:text-red-500">
                          <X size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Totaux</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-white/60">Total HT</span>
                <span>{totalHt.toFixed(2)} €</span>
              </div>
              {editMode ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-white/60">Remise (%)</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={remise}
                    onChange={(e) => setRemise(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded text-sm text-right"
                  />
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Remise</span>
                  <span>{remise > 0 ? `${remise}%` : "—"}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-white/60">TVA (20%)</span>
                <span>{tva.toFixed(2)} €</span>
              </div>
              {editMode ? (
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 dark:text-white/60">Livraison (€)</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={fraisLivraison}
                    onChange={(e) => setFraisLivraison(Number(e.target.value))}
                    className="w-20 px-2 py-1 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded text-sm text-right"
                  />
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-white/60">Livraison</span>
                  <span>{fraisLivraison > 0 ? `${fraisLivraison.toFixed(2)} €` : "Gratuit"}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#C9948E] dark:text-[#E8B4AE]">
                <span>Total TTC</span>
                <span>{totalTtc.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Notes internes</h3>
            {editMode ? (
              <textarea
                value={notesInternes}
                onChange={(e) => setNotesInternes(e.target.value)}
                rows={6}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm resize-none"
                placeholder="Notes visibles uniquement par l'admin…"
              />
            ) : (
              <p className="text-sm text-gray-500 dark:text-white/60 whitespace-pre-wrap">
                {notesInternes || "Aucune note"}
              </p>
            )}
          </div>
        </div>

        {/* Quick status actions */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Changer le statut</h3>
          <div className="flex flex-wrap gap-2">
            {(["en_attente", "en_preparation", "envoye", "accepte", "refuse"] as DevisStatut[]).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={devis.statut === s}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  devis.statut === s
                    ? "bg-[#C9948E] text-white"
                    : "bg-gray-100 dark:bg-neutral-700 text-gray-500 dark:text-white/60 hover:bg-gray-200 dark:hover:bg-neutral-600"
                }`}
              >
                {s === "en_attente" ? "En attente" : s === "en_preparation" ? "En préparation" : s === "envoye" ? "Envoyé" : s === "accepte" ? "Accepté" : "Refusé"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
