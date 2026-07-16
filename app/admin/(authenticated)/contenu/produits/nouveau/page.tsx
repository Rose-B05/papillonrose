"use client"

import { useRouter } from "next/navigation"
import ProductForm from "@/components/admin/ProductForm"

export default function NewProductPage() {
  const router = useRouter()

  return (
    <ProductForm
      onSave={(product) => {
        if (product.id) {
          router.push(`/admin/contenu/produits/${product.id}`)
        }
      }}
    />
  )
}
