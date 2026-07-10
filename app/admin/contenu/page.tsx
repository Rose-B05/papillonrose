import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { FileEdit } from "lucide-react"

export default function ContenuPage() {
  return (
    <ModulePlaceholder
      title="Contenu"
      description="Gestion des pages, médias et catégories"
      icon={FileEdit}
      phase="Phase 1"
    />
  )
}
