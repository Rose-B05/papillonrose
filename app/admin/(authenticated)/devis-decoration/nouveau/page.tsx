"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

interface LigneForm {
  description: string
  quantite: number
  prix_unitaire: number
}

export default function NewDecorationDevisPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const [client, setClient] = useState({
    nom: "",
    email: "",
    telephone: "",
  })

  const [projet, setProjet] = useState({
    titre: "",
    dateDebut: "",
    dateFin: "",
  })

  const [lignes, setLignes] = useState<LigneForm[]>([
    { description: "", quantite: 1, prix_unitaire: 0 },
  ])

  const [pourcentageMO, setPourcentageMO] = useState(45)
  const [notesInternes, setNotesInternes] = useState("")

  function updateLigne(index: number, field: keyof LigneForm, value: string | number) {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function removeLigne(index: number) {
    setLignes((prev) => prev.filter((_, i) => i !== index))
  }

  function addLigne() {
    setLignes((prev) => [...prev, { description: "", quantite: 1, prix_unitaire: 0 }])
  }

  const totalHT = lignes.reduce((s, l) => s + (Number(l.quantite) || 0) * (Number(l.prix_unitaire) || 0), 0)
  const montantMO = Math.round(totalHT * (pourcentageMO / 100) * 100) / 100
  const montantFournitures = Math.round((totalHT - montantMO) * 100) / 100
  const montantAcconpte = Math.round(totalHT * 0.25 * 100) / 100
  const montantSolde = Math.round(totalHT * 0.75 * 100) / 100

  const dateEcheanceSolde = projet.dateDebut
    ? (() => { const d = new Date(projet.dateDebut); d.setDate(d.getDate() - 1); return d.toISOString().split("T")[0] })()
    : ""

  function validate(): string | null {
    if (!client.nom.trim()) return "Le nom du client est requis"
    if (!client.email.trim()) return "L'email du client est requis"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) return "Format d'email invalide"
    if (!projet.titre.trim()) return "Le titre du projet est requis"
    if (!projet.dateDebut) return "La date de début est requise"
    if (lignes.length === 0) return "Ajoutez au moins une ligne"
    if (lignes.every((l) => !l.description.trim())) return "Description requise pour au moins une ligne"
    return null
  }

  async function handleSubmit(statut: "brouillon" | "envoye") {
    const err = validate()
    if (err) { alert(err); return }

    setSaving(true)
    try {
      const res = await fetch("/api/devis-decoration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_nom: client.nom,
          client_email: client.email,
          client_telephone: client.telephone,
          titre_projet: projet.titre,
          date_evenement_debut: projet.dateDebut,
          date_evenement_fin: projet.dateFin || null,
          lignes: lignes.filter((l) => l.description.trim()),
          pourcentage_main_oeuvre: pourcentageMO,
          notes_internes: notesInternes,
          statut,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        router.push(`/admin/devis-decoration/${data.devis.id}`)
      } else {
        const data = await res.json()
        alert(data.error || "Erreur lors de la création")
      }
    } catch {
      alert("Erreur lors de la création")
    }
    setSaving(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => router.push("/admin/devis")}
        className="flex items-center gap-1.5 text-sm text-secondary-text dark:text-white/60 hover:text-[#c27a72] transition-colors"
      >
        <ArrowLeft size={15} /> Retour à la liste
      </button>

      {/* Client */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Informations client</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-secondary-text dark:text-white/60 mb-1">Nom du client *</label>
            <input
              value={client.nom}
              onChange={(e) => setClient((p) => ({ ...p, nom: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-secondary-text dark:text-white/60 mb-1">Email *</label>
            <input
              type="email"
              value={client.email}
              onChange={(e) => setClient((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-secondary-text dark:text-white/60 mb-1">Téléphone</label>
            <input
              value={client.telephone}
              onChange={(e) => setClient((p) => ({ ...p, telephone: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Projet */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Informations projet</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-xs text-secondary-text dark:text-white/60 mb-1">Titre du projet *</label>
            <input
              value={projet.titre}
              onChange={(e) => setProjet((p) => ({ ...p, titre: e.target.value }))}
              placeholder="Ex: Décoration stand Salon du mariage"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-secondary-text dark:text-white/60 mb-1">Date début événement *</label>
            <input
              type="date"
              value={projet.dateDebut}
              onChange={(e) => setProjet((p) => ({ ...p, dateDebut: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-secondary-text dark:text-white/60 mb-1">Date fin événement</label>
            <input
              type="date"
              value={projet.dateFin}
              onChange={(e) => setProjet((p) => ({ ...p, dateFin: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Lignes */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">Lignes du devis</h3>
          <button onClick={addLigne} className="text-xs text-[#c27a72] hover:underline flex items-center gap-1">
            <Plus size={13} /> Ajouter une ligne
          </button>
        </div>
        <div className="space-y-3">
          {lignes.map((ligne, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-3 p-3 bg-gray-50 dark:bg-neutral-700/50 rounded-xl">
              <input
                value={ligne.description}
                onChange={(e) => updateLigne(i, "description", e.target.value)}
                placeholder="Description de la prestation"
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
                step={0.5}
                value={ligne.prix_unitaire}
                onChange={(e) => updateLigne(i, "prix_unitaire", Number(e.target.value))}
                placeholder="Prix unitaire €"
                className="w-28 px-3 py-2 bg-white dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm text-right"
              />
              <span className="w-24 text-right text-sm font-medium text-[#c27a72] dark:text-[#d4968e] py-2">
                {((Number(ligne.quantite) || 0) * (Number(ligne.prix_unitaire) || 0)).toFixed(2)} €
              </span>
              {lignes.length > 1 && (
                <button onClick={() => removeLigne(i)} className="text-secondary-text hover:text-red-500 py-2">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Récapitulatif interne */}
      <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl shadow-sm border border-amber-200 dark:border-amber-800/30 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">Informations internes</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-700 dark:bg-amber-800/40 dark:text-amber-300 font-medium">
            non visibles par le client
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Gauche : totaux */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-700 dark:text-amber-300/70">Total de la prestation</span>
              <span className="font-semibold text-amber-900 dark:text-amber-100">{totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-700 dark:text-amber-300/70">
                Main d&apos;œuvre
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pourcentageMO}
                  onChange={(e) => setPourcentageMO(Number(e.target.value))}
                  className="w-16 px-2 py-1 text-xs text-right bg-white dark:bg-neutral-700 border border-amber-300 dark:border-amber-700 rounded-lg"
                />
                <span className="text-xs text-amber-600 dark:text-amber-400">%</span>
                <span className="w-20 text-right font-medium text-amber-900 dark:text-amber-100">{montantMO.toFixed(2)} €</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-700 dark:text-amber-300/70">Fournitures / Matériel</span>
              <span className="font-medium text-amber-900 dark:text-amber-100">{montantFournitures.toFixed(2)} €</span>
            </div>
            <div className="border-t border-amber-200 dark:border-amber-700/40 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-amber-700 dark:text-amber-300/70">Acompte à la validation (25%)</span>
                <span className="font-semibold text-amber-900 dark:text-amber-100">{montantAcconpte.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-amber-700 dark:text-amber-300/70">Solde restant (75%)</span>
                <span className="font-semibold text-amber-900 dark:text-amber-100">{montantSolde.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Droite : échéances */}
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-white/60 dark:bg-neutral-800/40 rounded-xl">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Échéance acompte</p>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
              <p className="text-[11px] text-amber-500 dark:text-amber-400/60 mt-0.5">Date de validation du devis</p>
            </div>
            <div className="p-3 bg-white/60 dark:bg-neutral-800/40 rounded-xl">
              <p className="text-xs text-amber-600 dark:text-amber-400 mb-1">Échéance solde</p>
              <p className="font-medium text-amber-900 dark:text-amber-100">
                {dateEcheanceSolde
                  ? new Date(dateEcheanceSolde).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
                  : "—"}
              </p>
              <p className="text-[11px] text-amber-500 dark:text-amber-400/60 mt-0.5">Veille de la date de début de l&apos;événement</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notes internes */}
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
        <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">Notes internes</h3>
        <textarea
          value={notesInternes}
          onChange={(e) => setNotesInternes(e.target.value)}
          rows={3}
          placeholder="Notes visibles uniquement par l'équipe admin..."
          className="w-full px-3 py-2 bg-gray-50 dark:bg-neutral-700 border border-black/[0.08] dark:border-white/[0.1] rounded-lg text-sm resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => router.push("/admin/devis")}
          className="px-5 py-2.5 text-sm bg-gray-100 dark:bg-neutral-700 rounded-xl hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors"
        >
          Annuler
        </button>
        <button
          onClick={() => handleSubmit("brouillon")}
          disabled={saving}
          className="px-5 py-2.5 text-sm bg-gray-200 dark:bg-neutral-600 text-[#2E2E2E] dark:text-neutral-100 rounded-xl hover:bg-gray-300 dark:hover:bg-neutral-500 transition-colors disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer en brouillon"}
        </button>
        <button
          onClick={() => handleSubmit("envoye")}
          disabled={saving}
          className="px-5 py-2.5 text-sm bg-[#c27a72] text-white rounded-xl hover:bg-[#a86660] transition-colors disabled:opacity-50"
        >
          {saving ? "Envoi…" : "Valider et envoyer au client"}
        </button>
      </div>
    </div>
  )
}
