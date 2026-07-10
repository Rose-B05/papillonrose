import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Shield } from "lucide-react"

export default function SecuritePage() {
  return (
    <ModulePlaceholder
      title="Sécurité"
      description="HTTPS, headers, certificats et vulnérabilités"
      icon={Shield}
      phase="Phase 2"
    />
  )
}
