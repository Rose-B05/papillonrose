"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"
import { ArrowLeft, Plus, X } from "lucide-react"

interface LigneForm {
  productId: number
  nom: string
  quantite: number
  prixUnitaire: number
}

export default function NewDevisPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [client, setClient] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  })
  const [lignes, setLignes] = useState<LigneForm[]>([
    { productId: 0, nom: "", quantite: 1, prixUnitaire: 0 },
  ])

  function updateLigne(index: number, field: keyof LigneForm, value: string | number) {
    setLignes((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    )
  }

  function removeLigne(index: number) {
    setLignes((prev) => prev.filter((_, i) => i !== index))
  }

  function addLigne() {
    setLignes((prev) => [
      ...prev,
      { productId: 0, nom: "", quantite: 1, prixUnitaire: 0 },
    ])
  }

  const totalHt = lignes.reduce((s, l) => s + l.prixUnitaire * l.quantite, 0)
  const tva = totalHt * 0.2
  const totalTtc = totalHt + tva

  async function handleCreate() {
    if (!client.nom || !client.prenom || !client.email) {
      alert("Informations client requises")
      return
    }
    if (lignes.every((l) => !l.nom)) {
      alert("Ajoutez au moins un article")
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/admin/devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client,
          items: lignes
            .filter((l) => l.nom)
            .map((l) => ({
              productId: l.productId || 0,
              qty: l.quantite,
              prixUnitaire: l.prixUnitaire,
            })),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/admin/devis/${data.devis.id}`)
      } else {
        const data = await res.json()
        alert(data.error || "Erreur")
      }
    } catch {
      alert("Erreur lors de la création")
    }
    setSaving(false)
  }

  return (
    <AdminShell title="Nouvelle réservation">
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => router.push("/admin/devis")}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/60 hover:text-[#C9948E] transition-colors"
        >
          <ArrowLeft size={15} /> Retour à la liste
        </button>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Informations client</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/60 mb-1">Prénom *</label>
              <input
                value={client.prenom}
                onChange={(e) => setClient((p) => ({ ...p, prenom: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/60 mb-1">Nom *</label>
              <input
                value={client.nom}
                onChange={(e) => setClient((p) => ({ ...p, nom: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/60 mb-1">Email *</label>
              <input
                type="email"
                value={client.email}
                onChange={(e) => setClient((p) => ({ ...p, email: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-white/60 mb-1">Téléphone</label>
              <input
                value={client.telephone}
                onChange={(e) => setClient((p) => ({ ...p, telephone: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Articles</h3>
            <button onClick={addLigne} className="text-xs text-[#C9948E] hover:underline flex items-center gap-1">
              <Plus size={13} /> Ajouter un article
            </button>
          </div>
          <div className="space-y-3">
            {lignes.map((ligne, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-xl">
                <input
                  value={ligne.nom}
                  onChange={(e) => updateLigne(i, "nom", e.target.value)}
                  placeholder="Nom de l'article"
                  className="flex-1 px-3 py-2 bg-white dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
                />
                <input
                  type="number"
                  min={1}
                  value={ligne.quantite}
                  onChange={(e) => updateLigne(i, "quantite", Number(e.target.value))}
                  className="w-20 px-3 py-2 bg-white dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm text-center"
                />
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={ligne.prixUnitaire}
                  onChange={(e) => updateLigne(i, "prixUnitaire", Number(e.target.value))}
                  placeholder="Prix unitaire"
                  className="w-28 px-3 py-2 bg-white dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm text-right"
                />
                <span className="w-24 text-right text-sm font-medium text-[#C9948E] dark:text-[#E8B4AE] py-2">
                  {(ligne.prixUnitaire * ligne.quantite).toFixed(2)} €
                </span>
                {lignes.length > 1 && (
                  <button onClick={() => removeLigne(i)} className="text-gray-400 hover:text-red-500 py-2">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Totaux</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60">Total HT</span>
              <span>{totalHt.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-white/60">TVA (20%)</span>
              <span>{tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-black/[0.06] dark:border-white/[0.08] font-semibold text-[#C9948E] dark:text-[#E8B4AE]">
              <span>Total TTC</span>
              <span>{totalTtc.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => router.push("/admin/devis")}
            className="px-5 py-2.5 text-sm bg-gray-100 dark:bg-neutral-700 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleCreate}
            disabled={saving}
            className="px-5 py-2.5 text-sm bg-[#C9948E] text-white rounded-xl hover:bg-[#B8807A] transition-colors disabled:opacity-50"
          >
            {saving ? "Création…" : "Créer la réservation"}
          </button>
        </div>
      </div>
    </AdminShell>
  )
}
