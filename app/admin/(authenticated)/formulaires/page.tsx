import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Inbox } from "lucide-react"

export default function FormulairesPage() {
  return (
    <ModulePlaceholder
      title="Formulaires"
      description="Messages reçus et suivi des formulaires"
      icon={Inbox}
      phase="Phase 1"
    />
  )
}
