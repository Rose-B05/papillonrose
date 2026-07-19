"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Image, Video, FileText, Eye, EyeOff, GripVertical, Trash2, Pencil } from "lucide-react"
import type { Nouveaute } from "@/lib/types"

export default function NouveautesAdminPage() {
  const [items, setItems] = useState<Nouveaute[]>([])
  const [loading, setLoading] = useState(true)

  const fetchItems = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/nouveautes")
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => { fetchItems() }, [])

  const toggleStatut = async (item: Nouveaute) => {
    const newStatut = item.statut === "publie" ? "brouillon" : "publie"
    await fetch("/api/admin/nouveautes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, statut: newStatut }),
    })
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, statut: newStatut } : i)))
  }

  const deleteItem = async (id: string) => {
    if (!confirm("Supprimer cette nouveauté ?")) return
    await fetch(`/api/admin/nouveautes?id=${id}`, { method: "DELETE" })
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const typeIcon = (type: string) => {
    switch (type) {
      case "image": return <Image size={14} />
      case "video": return <Video size={14} />
      case "document": return <FileText size={14} />
      default: return null
    }
  }

  const publieCount = items.filter((i) => i.statut === "publie").length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">Nouveautés</h1>
          <p className="text-sm text-gray-400 dark:text-white/60 mt-1">
            {items.length} élément{items.length !== 1 ? "s" : ""}
            {publieCount > 0 && (
              <span className="ml-2 text-[#C9948E] dark:text-[#E8B4AE] font-medium">
                · {publieCount} publié{publieCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/nouveautes/nouveau"
          className="flex items-center gap-2 bg-[#C9948E] hover:bg-[#B8807A] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nouvelle
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 dark:text-white/60 text-sm">Chargement…</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#C9948E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Image size={24} className="text-[#C9948E]/40" />
          </div>
          <p className="text-gray-400 dark:text-white/60 mb-4">Aucune nouveauté</p>
          <Link
            href="/admin/nouveautes/nouveau"
            className="text-[#C9948E] dark:text-[#E8B4AE] text-sm font-medium hover:underline"
          >
            Créer la première
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white dark:bg-neutral-800 rounded-xl px-4 py-3 border border-black/[0.07] dark:border-white/[0.08] shadow-sm hover:shadow-md transition-shadow"
            >
              <GripVertical size={14} className="text-gray-300 dark:text-neutral-600 flex-shrink-0" />

              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8F5F0] dark:bg-neutral-700 flex-shrink-0 flex items-center justify-center">
                {item.type === "image" && item.mediaUrl ? (
                  <img src={item.mediaUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  typeIcon(item.type)
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 truncate">
                  {item.titre || "Sans titre"}
                </p>
                <p className="text-[11px] text-gray-400 dark:text-white/60 truncate">
                  {item.description || "Pas de description"}
                </p>
              </div>

              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                item.statut === "publie"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-neutral-400"
              }`}>
                {item.statut === "publie" ? "Publié" : "Brouillon"}
              </span>

              <button
                onClick={() => toggleStatut(item)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-gray-400 dark:text-white/60"
                title={item.statut === "publie" ? "Masquer" : "Publier"}
              >
                {item.statut === "publie" ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>

              <Link
                href={`/admin/nouveautes/${item.id}`}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 transition-colors text-gray-400 dark:text-white/60"
              >
                <Pencil size={14} />
              </Link>

              <button
                onClick={() => deleteItem(item.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-300 dark:text-neutral-600 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
