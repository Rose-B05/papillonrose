import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <ModulePlaceholder
      title="Notifications"
      description="Alertes système et événements importants"
      icon={Bell}
      phase="Phase 5"
    />
  )
}
