"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Plus, Search, Eye, EyeOff, Edit, Trash2, Filter, Image as ImageIcon, EyeClosed } from "lucide-react"

interface AdminProduct {
  id: number
  nom: string
  categorie: string
  stock: number
  prix: number | string
  image: string
  status: "brouillon" | "publie" | "masque"
  isStatic?: boolean
  dateCreation: string
  dateModification: string
}

type StatusFilter = "tous" | "brouillon" | "publie" | "masque"

export default function ProductsListPage() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("tous")

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/products")
      if (res.ok) {
        const data = await res.json()
        setProducts(data.products || [])
      }
    } catch {}
    setLoading(false)
  }

  const handleDelete = async (id: number, nom: string, isStatic?: boolean) => {
    if (isStatic) return
    if (!confirm(`Supprimer le produit "${nom}" ?`)) return
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch {}
  }

  const handleToggleStatus = async (product: AdminProduct) => {
    const nextStatus = product.status === "publie" ? "masque" : "publie"
    try {
      const res = await fetch("/api/admin/products", {
        method: product.isStatic ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, status: nextStatus }),
      })
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
        )
      }
    } catch {}
  }

  const filtered = products.filter((p) => {
    if (statusFilter !== "tous" && p.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        p.nom.toLowerCase().includes(q) ||
        p.categorie.toLowerCase().includes(q)
      )
    }
    return true
  })

  const counts = {
    tous: products.length,
    brouillon: products.filter((p) => p.status === "brouillon").length,
    publie: products.filter((p) => p.status === "publie").length,
    masque: products.filter((p) => p.status === "masque").length,
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Produits
            </h1>
            <p className="text-sm text-gray-500 dark:text-white/60 mt-1">
              {counts.tous} produit{counts.tous !== 1 ? "s" : ""} au total
            </p>
          </div>
          <Link
            href="/admin/contenu/produits/nouveau"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[#C9948E] dark:bg-[#C9948E] text-white hover:bg-[#B8807A] dark:hover:bg-[#C9948E] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/[0.07] dark:border-white/[0.08] bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 text-sm focus:outline-none focus:border-[#C9948E]/50 transition-colors"
            />
          </div>
          <div className="flex gap-1 bg-white dark:bg-neutral-800 rounded-xl border border-black/[0.07] dark:border-white/[0.08] p-1">
            {(["tous", "publie", "brouillon", "masque"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f
                    ? "bg-[#C9948E] dark:bg-[#C9948E] text-white"
                    : "text-gray-500 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-neutral-700"
                }`}
              >
                {f === "tous" ? "Tous" : f === "brouillon" ? "Brouillons" : f === "publie" ? "Publiés" : "Masqués"}
                <span className="ml-1 text-[10px] opacity-70">({counts[f]})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {products.length === 0
              ? "Aucun produit. Créez votre premier produit !"
              : "Aucun produit ne correspond aux filtres."}
          </div>
        ) : (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                  <th className="text-left px-5 py-3 text-xs text-gray-400 dark:text-white/60 uppercase tracking-wider font-medium">
                    Produit
                  </th>
                  <th className="text-left px-5 py-3 text-xs text-gray-400 dark:text-white/60 uppercase tracking-wider font-medium hidden md:table-cell">
                    Catégorie
                  </th>
                  <th className="text-right px-5 py-3 text-xs text-gray-400 dark:text-white/60 uppercase tracking-wider font-medium">
                    Prix
                  </th>
                  <th className="text-center px-5 py-3 text-xs text-gray-400 dark:text-white/60 uppercase tracking-wider font-medium">
                    Statut
                  </th>
                  <th className="text-right px-5 py-3 text-xs text-gray-400 dark:text-white/60 uppercase tracking-wider font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-black/[0.03] hover:bg-[#F8F5F0] dark:hover:bg-neutral-700/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-neutral-700 flex-shrink-0">
                          {p.image && !p.image.includes("placeholder") ? (
                            <img
                              src={p.image}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget
                                target.style.display = "none"
                                const fallback = target.nextElementSibling as HTMLElement
                                if (fallback) fallback.style.display = "flex"
                              }}
                            />
                          ) : null}
                          <div
                            className={`w-full h-full items-center justify-center text-gray-300 ${p.image && !p.image.includes("placeholder") ? "hidden" : "flex"}`}
                          >
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">
                            {p.nom}
                          </p>
                          <p className="text-[10px] text-gray-400 dark:text-white/60 md:hidden">
                            {p.categorie}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-500 dark:text-white/70">
                        {p.categorie}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">
                        {typeof p.prix === "number" ? `${p.prix} €` : p.prix}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-white/60">/jour</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          p.status === "publie"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : p.status === "masque"
                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                            : "bg-gray-100 text-gray-500 dark:bg-neutral-700 dark:text-white/70"
                        }`}
                      >
                        {p.status === "publie" ? (
                          <><Eye className="w-3 h-3 mr-0.5" /> Publié</>
                        ) : p.status === "masque" ? (
                          <><EyeClosed className="w-3 h-3 mr-0.5" /> Masqué</>
                        ) : (
                          <><EyeOff className="w-3 h-3 mr-0.5" /> Brouillon</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(p)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            p.status === "publie"
                              ? "hover:bg-orange-50 dark:hover:bg-orange-900/20 text-green-500 hover:text-orange-500"
                              : "hover:bg-green-50 dark:hover:bg-green-900/20 text-orange-400 hover:text-green-500"
                          }`}
                          title={p.status === "publie" ? "Masquer" : "Publier"}
                        >
                          {p.status === "publie" ? <Eye className="w-4 h-4" /> : <EyeClosed className="w-4 h-4" />}
                        </button>
                        <Link
                          href={`/admin/contenu/produits/${p.id}`}
                          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 dark:text-white/60 hover:text-[#C9948E] transition-colors"
                          title={p.isStatic ? "Modifier (créera une copie admin)" : "Modifier"}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        {!p.isStatic && (
                          <button
                            onClick={() => handleDelete(p.id, p.nom, p.isStatic)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-700 text-gray-400 dark:text-white/60 hover:text-red-500 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
