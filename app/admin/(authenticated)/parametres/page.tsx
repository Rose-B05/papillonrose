import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Settings } from "lucide-react"

export default function ParametresPage() {
  return (
    <ModulePlaceholder
      title="Paramètres"
      description="Configuration générale et intégrations"
      icon={Settings}
      phase="Phase 1"
    />
  )
}
