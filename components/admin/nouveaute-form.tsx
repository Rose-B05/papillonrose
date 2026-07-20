"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Upload, Image, Video, FileText, Loader2 } from "lucide-react"
import type { Nouveaute, NouveauteType } from "@/lib/types"

interface NouveauteFormProps {
  editId?: string
}

export default function NouveauteForm({ editId }: NouveauteFormProps) {
  const router = useRouter()
  const isEdit = !!editId

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [form, setForm] = useState({
    titre: "",
    description: "",
    type: "image" as NouveauteType,
    statut: "brouillon" as "brouillon" | "publie",
    mediaUrl: "",
    lienAction: "",
    labelAction: "",
    ordre: 0,
  })

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/admin/nouveautes?id=${editId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.item) {
            const i = data.item
            setForm({
              titre: i.titre || "",
              description: i.description || "",
              type: i.type || "image",
              statut: i.statut || "brouillon",
              mediaUrl: i.mediaUrl || "",
              lienAction: i.lienAction || "",
              labelAction: i.labelAction || "",
              ordre: i.ordre ?? 0,
            })
          }
        })
    }
  }, [editId, isEdit])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError("")
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      if (res.ok) {
        const data = await res.json()
        setForm((f) => ({ ...f, mediaUrl: data.url }))
      } else {
        const err = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        setUploadError(err.error || "Échec de l'upload")
      }
    } catch {
      setUploadError("Erreur réseau lors de l'upload")
    }
    setUploading(false)
  }

  const handleSave = async (statut?: "brouillon" | "publie") => {
    setSaving(true)
    setSaveError("")
    try {
      const body = { ...form, statut: statut || form.statut }
      const method = isEdit ? "PUT" : "POST"
      const res = await fetch("/api/admin/nouveautes", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editId, ...body } : body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Erreur inconnue" }))
        setSaveError(err.error || "Échec de l'enregistrement")
        return
      }
      router.push("/admin/nouveautes")
    } catch {
      setSaveError("Erreur réseau lors de l'enregistrement")
    } finally {
      setSaving(false)
    }
  }

  const typeOptions: { value: NouveauteType; label: string; icon: typeof Image }[] = [
    { value: "image", label: "Image", icon: Image },
    { value: "video", label: "Vidéo", icon: Video },
    { value: "document", label: "Document", icon: FileText },
  ]

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-white/60 hover:text-[#C9948E] dark:hover:text-[#E8B4AE] transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Retour
      </button>

      <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-6">
        {isEdit ? "Modifier la nouveauté" : "Nouvelle nouveauté"}
      </h1>

      <div className="space-y-5">
        {/* Titre */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
            Titre *
          </label>
          <input
            type="text"
            value={form.titre}
            onChange={(e) => setForm((f) => ({ ...f, titre: e.target.value }))}
            className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
            placeholder="Ex: Nouveau Photobooth"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
            className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm resize-none"
            placeholder="Description de la nouveauté…"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
            Type de contenu *
          </label>
          <div className="flex gap-2">
            {typeOptions.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setForm((f) => ({ ...f, type: value }))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  form.type === value
                    ? "bg-[#C9948E] text-white"
                    : "bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] text-gray-500 dark:text-white/60 hover:border-[#C9948E]/40"
                }`}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Media */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
            {form.type === "document" ? "Document" : "Média"} *
          </label>
          <div className="flex items-center gap-3">
            <label className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-800 border border-dashed border-black/[0.12] dark:border-white/[0.12] rounded-2xl px-4 py-6 text-sm text-gray-400 dark:text-white/60 hover:border-[#C9948E]/40 transition-colors cursor-pointer">
              {uploading ? (
                <><Loader2 size={16} className="animate-spin" /> Upload en cours…</>
              ) : (
                <><Upload size={16} /> {form.mediaUrl ? "Remplacer" : "Glisser-déposer ou cliquer"}</>
              )}
              <input type="file" accept="image/*,video/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
          </div>
          <p className="text-[10px] text-gray-400 dark:text-white/60 mt-1.5">
            Formats acceptés : images (JPEG, PNG, WebP, GIF) · vidéos (MP4, WebM, MOV). Max 50 Mo pour les vidéos, 10 Mo pour les images.
          </p>
          {uploadError && (
            <p className="text-red-500 dark:text-red-400 text-xs mt-2 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" /> {uploadError}
            </p>
          )}
          {form.mediaUrl && (
            <div className="mt-3">
              {form.type === "image" ? (
                <img src={form.mediaUrl} alt="Aperçu" className="w-40 h-40 object-cover rounded-xl border border-black/[0.07] dark:border-white/[0.08]" />
              ) : form.type === "video" ? (
                <div className="relative">
                  <video src={form.mediaUrl} className="w-40 h-40 object-cover rounded-xl" controls preload="metadata" />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21" /></svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-40 h-40 bg-[#F8F5F0] dark:bg-neutral-700 rounded-xl flex items-center justify-center">
                  <FileText size={32} className="text-[#C9948E]/40" />
                </div>
              )}
            </div>
          )}
          <div className="mt-2">
            <input
              type="url"
              value={form.mediaUrl}
              onChange={(e) => setForm((f) => ({ ...f, mediaUrl: e.target.value }))}
              className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors"
              placeholder="Ou coller une URL directe…"
            />
          </div>
        </div>

        {/* Ordre */}
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
            Ordre d&apos;affichage
          </label>
          <input
            type="number"
            value={form.ordre}
            onChange={(e) => setForm((f) => ({ ...f, ordre: Number(e.target.value) }))}
            className="w-24 bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-xl px-3 py-2 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
          />
        </div>

        {/* Document only: action link */}
        {form.type === "document" && (
          <>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
                Lien d&apos;action
              </label>
              <input
                type="url"
                value={form.lienAction}
                onChange={(e) => setForm((f) => ({ ...f, lienAction: e.target.value }))}
                className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-white/60 mb-1.5">
                Texte du bouton
              </label>
              <input
                type="text"
                value={form.labelAction}
                onChange={(e) => setForm((f) => ({ ...f, labelAction: e.target.value }))}
                className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
                placeholder="Découvrir"
              />
            </div>
          </>
        )}

        {saveError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" /> {saveError}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => handleSave("brouillon")}
            disabled={saving || !form.titre || !form.mediaUrl}
            className="flex-1 border border-[#C9948E]/30 text-[#C9948E] dark:text-[#E8B4AE] py-3 rounded-2xl text-sm font-medium hover:bg-[#C9948E]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSave("publie")}
            disabled={saving || !form.titre || !form.mediaUrl}
            className="flex-1 bg-[#C9948E] hover:bg-[#B8807A] text-white py-3 rounded-2xl text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : null}
            Publier
          </button>
        </div>
      </div>
    </div>
  )
}
