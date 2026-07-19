"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"

interface AdminProduct {
  id: number
  nom: string
  categorie: string
  stock: number
  dimension?: string
  prix: number | string
  image: string
  gallerie?: string[]
  description?: string
  pieceUnique?: boolean
  tagsThemes?: string[]
  tagsCouleurs?: string[]
  status: "brouillon" | "publie"
  isStatic?: boolean
  dateCreation: string
  dateModification: string
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<AdminProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/admin/products?id=${id}`)
        if (!res.ok) {
          setError("Produit introuvable")
          return
        }
        const data = await res.json()
        setProduct(data.product)
      } catch {
        setError("Erreur lors du chargement")
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id])

  if (loading) {
    return <div className="text-center py-16 text-gray-400">Chargement…</div>
  }

  if (error || !product) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 mb-4">{error || "Produit introuvable"}</p>
        <button
          onClick={() => router.push("/admin/contenu/produits")}
          className="text-sm text-[#C9948E] hover:underline"
        >
          Retour à la liste
        </button>
      </div>
    )
  }

  const galleryFromImage = product.image && !product.image.includes("placeholder") ? [product.image] : []
  const fullGallerie = [...galleryFromImage, ...((product.gallerie || []).filter((g) => !galleryFromImage.includes(g)))]

  return (
    <ProductForm
      initialData={{
        id: product.id,
        nom: product.nom,
        categorie: product.categorie,
        stock: product.stock,
        dimension: product.dimension || "",
        prix: product.prix,
        image: product.image,
        gallerie: fullGallerie,
        description: product.description || "",
        pieceUnique: product.pieceUnique || false,
        tagsThemes: product.tagsThemes || [],
        tagsCouleurs: product.tagsCouleurs || [],
        status: product.status,
        isStatic: product.isStatic,
      }}
    />
  )
}
