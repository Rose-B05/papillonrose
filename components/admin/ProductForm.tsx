"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import {
  Save,
  Upload,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertTriangle,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Library,
} from "lucide-react"
import { CATEGORIES } from "@/lib/product-helpers"

const THEMES_TAGS = ["Mariage", "Anniversaire", "Événement pro", "Baptême", "Baby shower", "Noël"]
const COULEURS_TAGS = ["Blanc", "Doré", "Rose", "Naturel", "Rouge", "Noir", "Bleu", "Vert"]

type ProductStatus = "brouillon" | "publie"

interface ProductFormData {
  id?: number
  nom: string
  categorie: string
  stock: number
  dimension: string
  prix: number | string
  image: string
  gallerie: string[]
  description: string
  pieceUnique: boolean
  tagsThemes: string[]
  tagsCouleurs: string[]
  status: ProductStatus
}

interface MediaItem {
  id: string
  url: string
  nomFichier: string
  dateUpload: string
  utilisePar: number[]
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSave?: (product: ProductFormData) => void
}

const EMPTY_FORM: ProductFormData = {
  nom: "",
  categorie: CATEGORIES[0],
  stock: 1,
  dimension: "",
  prix: "",
  image: "",
  gallerie: [],
  description: "",
  pieceUnique: false,
  tagsThemes: [],
  tagsCouleurs: [],
  status: "brouillon",
}

export default function ProductForm({ initialData, onSave }: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({ ...EMPTY_FORM, ...initialData })
  const [errors, setErrors] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [mediaLibrary, setMediaLibrary] = useState<MediaItem[]>([])
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [uploadError, setUploadError] = useState<string>("")
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateField = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      if (key === "pieceUnique" && value) {
        next.stock = 1
      }
      return next
    })
    setErrors([])
  }

  const toggleThemeTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tagsThemes: prev.tagsThemes.includes(tag)
        ? prev.tagsThemes.filter((t) => t !== tag)
        : [...prev.tagsThemes, tag],
    }))
  }

  const toggleCouleurTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tagsCouleurs: prev.tagsCouleurs.includes(tag)
        ? prev.tagsCouleurs.filter((t) => t !== tag)
        : [...prev.tagsCouleurs, tag],
    }))
  }

  const uploadFile = async (file: File): Promise<MediaItem | null> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || "Erreur upload")
      }
      const data = await res.json()
      return {
        id: data.mediaId,
        url: data.url,
        nomFichier: data.nomFichier,
        dateUpload: new Date().toISOString(),
        utilisePar: [],
      }
    } catch (err: any) {
      console.error("Upload error:", err)
      return null
    }
  }

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const handleFiles = async (files: FileList | File[]) => {
    setUploading(true)
    setUploadError("")
    const fileArray = Array.from(files)

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i]
      setUploadProgress(`Upload de ${file.name} (${i + 1}/${fileArray.length})...`)

      const dataUrl = await fileToDataUrl(file)
      setForm((prev) => {
        const newGallerie = [...prev.gallerie, dataUrl]
        return {
          ...prev,
          gallerie: newGallerie,
          image: prev.image || dataUrl,
        }
      })

      const media = await uploadFile(file)
      if (media) {
        setForm((prev) => {
          const newGallerie = prev.gallerie.map((url) => (url === dataUrl ? media.url : url))
          return {
            ...prev,
            gallerie: newGallerie,
            image: prev.image === dataUrl ? media.url : prev.image,
          }
        })
      } else {
        setUploadError(`Upload cloud échoué pour ${file.name}. L'image est sauvegardée localement.`)
      }
    }

    setUploading(false)
    setUploadProgress("")
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [form]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const openMediaLibrary = async () => {
    try {
      const res = await fetch("/api/admin/media")
      if (res.ok) {
        const data = await res.json()
        setMediaLibrary(data.media || [])
      }
    } catch {}
    setSelectedMedia(new Set())
    setShowMediaLibrary(true)
  }

  const toggleMediaSelection = (id: string) => {
    setSelectedMedia((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const addSelectedMedia = () => {
    const items = mediaLibrary.filter((m) => selectedMedia.has(m.id))
    setForm((prev) => {
      const newUrls = items.map((m) => m.url).filter((url) => !prev.gallerie.includes(url))
      const newGallerie = [...prev.gallerie, ...newUrls]
      return {
        ...prev,
        gallerie: newGallerie,
        image: prev.image || newUrls[0] || prev.image,
      }
    })
    setShowMediaLibrary(false)
  }

  const removePhoto = (index: number) => {
    setForm((prev) => {
      const newGallerie = prev.gallerie.filter((_, i) => i !== index)
      return {
        ...prev,
        gallerie: newGallerie,
        image: prev.image === prev.gallerie[index] ? newGallerie[0] || "" : prev.image,
      }
    })
  }

  const setPrincipal = (url: string) => {
    setForm((prev) => ({ ...prev, image: url }))
  }

  const validate = (): boolean => {
    const errs: string[] = []
    if (!form.nom.trim()) errs.push("Le nom du produit est requis")
    if (form.prix === "" || form.prix === undefined) errs.push("Le prix est requis")
    if (!form.categorie) errs.push("La catégorie est requise")
    setErrors(errs)
    return errs.length === 0
  }

  const handleSave = async (status: ProductStatus) => {
    if (!validate()) return

    setSaving(true)
    try {
      const method = form.id ? "PUT" : "POST"
      const res = await fetch("/api/admin/products", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || body.details?.join(", ") || "Erreur sauvegarde")
      }

      const data = await res.json()
      setForm((prev) => ({
        ...prev,
        id: data.product.id,
        status,
        dateCreation: data.product.dateCreation,
      }))
      onSave?.(data.product)
    } catch (err: any) {
      setErrors([err.message || "Erreur lors de la sauvegarde"])
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">
            {form.id ? "Modifier le produit" : "Nouveau produit"}
          </h1>
          {form.id && (
            <div className="mt-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  form.status === "publie"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-neutral-400"
                }`}
              >
                {form.status === "publie" ? "Publié" : "Brouillon"}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave("brouillon")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] text-gray-600 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            Enregistrer brouillon
          </button>
          <button
            onClick={() => handleSave("publie")}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#C8A97E] dark:bg-amber-600 text-white hover:bg-[#b8996e] dark:hover:bg-amber-500 transition-colors disabled:opacity-50"
          >
            <Eye className="w-4 h-4" />
            Publier au catalogue
          </button>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-1">
            <AlertTriangle className="w-4 h-4" />
            Erreurs de validation
          </div>
          <ul className="text-sm text-red-600 dark:text-red-400 ml-6 list-disc">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1.5">
              Nom du produit *
            </label>
            <input
              type="text"
              value={form.nom}
              onChange={(e) => updateField("nom", e.target.value)}
              placeholder="Ex: Chaise Médaillon"
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C8A97E]/50 transition-colors"
            />
          </div>

          {/* Prix & Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1.5">
                Prix / jour (€) *
              </label>
              <input
                type="number"
                step="0.50"
                min="0"
                value={form.prix}
                onChange={(e) => updateField("prix", e.target.value ? Number(e.target.value) : "")}
                placeholder="25"
                className="w-full px-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C8A97E]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1.5">
                Catégorie *
              </label>
              <select
                value={form.categorie}
                onChange={(e) => updateField("categorie", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C8A97E]/50 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dimensions & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1.5">
                Dimensions
              </label>
              <input
                type="text"
                value={form.dimension}
                onChange={(e) => updateField("dimension", e.target.value)}
                placeholder="90 x 45 cm"
                className="w-full px-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C8A97E]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1.5">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => updateField("stock", Number(e.target.value))}
                disabled={form.pieceUnique}
                className="w-full px-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C8A97E]/50 transition-colors disabled:opacity-50"
              />
            </div>
          </div>

          {/* Pièce unique */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.pieceUnique}
              onChange={(e) => updateField("pieceUnique", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#C8A97E] focus:ring-[#C8A97E]/30"
            />
            <span className="text-sm text-[#2E2E2E] dark:text-neutral-100">
              Pièce unique (quantité = 1)
            </span>
          </label>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1.5">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Description du produit..."
              className="w-full px-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C8A97E]/50 transition-colors resize-none"
            />
          </div>

          {/* Tags Thèmes */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-2">
              Tags Thèmes
            </label>
            <div className="flex flex-wrap gap-2">
              {THEMES_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleThemeTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.tagsThemes.includes(tag)
                      ? "bg-[#C8A97E] dark:bg-amber-600 text-white"
                      : "bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-black/[0.07] dark:border-white/[0.08] hover:border-[#C8A97E]/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Tags Couleurs */}
          <div>
            <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-2">
              Tags Couleurs
            </label>
            <div className="flex flex-wrap gap-2">
              {COULEURS_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleCouleurTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    form.tagsCouleurs.includes(tag)
                      ? "bg-[#C8A97E] dark:bg-amber-600 text-white"
                      : "bg-white dark:bg-neutral-800 text-gray-500 dark:text-neutral-400 border border-black/[0.07] dark:border-white/[0.08] hover:border-[#C8A97E]/50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Photos */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
            <h3 className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-4 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#C8A97E]" />
              Photos du produit
            </h3>

            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 ${
                dragOver
                  ? "border-[#C8A97E] bg-[#C8A97E]/5"
                  : "border-gray-200 dark:border-neutral-700 hover:border-[#C8A97E]/50"
              }`}
            >
              <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-neutral-400">
                Glisser-déposer ou cliquer pour upload
              </p>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500 mt-1">
                JPEG, PNG, WebP • Max 10 Mo
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={(e) => e.target.files && handleFiles(e.target.files)}
              className="hidden"
            />

            {uploading && (
              <div className="text-xs text-[#C8A97E] mb-4 text-center">{uploadProgress}</div>
            )}

            {uploadError && (
              <div className="text-xs text-red-500 mb-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg p-2">
                {uploadError}
                <button onClick={() => setUploadError("")} className="ml-2 underline">Fermer</button>
              </div>
            )}

            {/* Browse Library Button */}
            <button
              type="button"
              onClick={openMediaLibrary}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] text-gray-500 dark:text-neutral-400 hover:border-[#C8A97E]/50 transition-colors mb-4"
            >
              <Library className="w-3.5 h-3.5" />
              Parcourir la bibliothèque
            </button>

            {/* Photo Grid */}
            {form.gallerie.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {form.gallerie.map((url, idx) => (
                  <div
                    key={`g_${idx}`}
                    className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-700"
                  >
                    {imageErrors.has(url) ? (
                      <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 p-1 text-center">
                        Image non disponible
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setImageErrors((prev) => new Set(prev).add(url))}
                      />
                    )}
                    {url === form.image && (
                      <div className="absolute top-1 left-1 bg-[#C8A97E] text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5" fill="currentColor" />
                        Principale
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      {url !== form.image && (
                        <button
                          type="button"
                          onClick={() => setPrincipal(url)}
                          className="p-1 rounded-full bg-white/90 text-gray-700 hover:bg-white"
                          title="Définir comme principale"
                        >
                          <Star className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="p-1 rounded-full bg-white/90 text-red-600 hover:bg-white"
                        title="Retirer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Snapshot Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  Comportement Snapshot
                </p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                  Les devis et paniers existants conservent une copie figée des informations du
                  produit. Modifier cette fiche n&apos;impacte pas les demandes en cours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col mx-4">
            <div className="flex items-center justify-between p-4 border-b border-black/[0.07] dark:border-white/[0.08]">
              <h3 className="font-medium text-[#2E2E2E] dark:text-neutral-100">
                Bibliothèque médias
              </h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {mediaLibrary.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  Aucune image dans la bibliothèque
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {mediaLibrary.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => toggleMediaSelection(item.id)}
                      className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                        selectedMedia.has(item.id)
                          ? "border-[#C8A97E]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={item.url}
                        alt={item.nomFichier}
                        className="w-full h-full object-cover"
                      />
                      {selectedMedia.has(item.id) && (
                        <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#C8A97E] text-white flex items-center justify-center">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between p-4 border-t border-black/[0.07] dark:border-white/[0.08]">
              <span className="text-xs text-gray-400">
                {selectedMedia.size} image(s) sélectionnée(s)
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowMediaLibrary(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-neutral-800 border border-black/[0.07] dark:border-white/[0.08] text-gray-500 dark:text-neutral-400 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={addSelectedMedia}
                  disabled={selectedMedia.size === 0}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-[#C8A97E] dark:bg-amber-600 text-white hover:bg-[#b8996e] dark:hover:bg-amber-500 transition-colors disabled:opacity-50"
                >
                  Ajouter ({selectedMedia.size})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
