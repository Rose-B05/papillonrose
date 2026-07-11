import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Users } from "lucide-react"

export default function UtilisateursPage() {
  return (
    <ModulePlaceholder
      title="Utilisateurs"
      description="Rôles, permissions et accès admin"
      icon={Users}
      phase="Phase 1"
    />
  )
}
