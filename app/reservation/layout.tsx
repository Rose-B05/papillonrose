import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Demande de devis — Papillon Rose",
  description:
    "Composez votre sélection et recevez votre devis de location en moins de 24h. Papillon Rose, location décoration événements en Île-de-France.",
}

export default function ReservationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
