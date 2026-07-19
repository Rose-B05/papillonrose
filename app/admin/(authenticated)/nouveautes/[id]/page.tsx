"use client"

import { useParams } from "next/navigation"
import NouveauteForm from "@/components/admin/nouveaute-form"

export default function EditNouveautePage() {
  const { id } = useParams()
  return <NouveauteForm editId={id as string} />
}
