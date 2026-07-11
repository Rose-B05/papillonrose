export interface ProductVariant {
  label: string
  prix: number | string
}

export interface Product {
  id: number
  nom: string
  categorie: string
  stock: number
  dimension?: string
  prix: number | string
  image: string
  gallerie?: string[]
  badge?: "stock-limite" | "epuise"
  variants?: ProductVariant[]
  dateAjout?: string
  actif?: boolean
}

export interface CartItem {
  productId: number
  qty: number
  dateStart: string
  dateEnd: string
  variantLabel?: string
}

export interface Booking {
  id: string
  items: CartItem[]
  client: ClientInfo
  totalHt: number
  totalTtc: number
  depositAmount: number
  status: "pending-quote" | "quote-sent" | "deposit-pending" | "confirmed" | "cancelled" | "returned"
  quoteNumber?: string
  createdAt: string
  updatedAt: string
  paymentIntentId?: string
  depositPaidAt?: string
  returnedAt?: string
}

export interface ClientInfo {
  nom: string
  prenom: string
  email: string
  telephone: string
  typeEvenement: string
  dateEvenement: string
  lieuEvenement: string
  nbInvites: number
  besoinLivraison: boolean
  codePostalLivraison?: string
  adresseLivraison?: string
  fraisLivraison?: number
  distanceLivraison?: number
  message?: string
}

export interface QuoteRequest {
  id: string
  bookingId?: string
  client: ClientInfo
  customerEmail?: string
  items: CartItem[]
  totalHt: number
  totalTtc: number
  statut: "recu" | "en_traitement" | "confirme_stock" | "refuse_stock" | "envoye" | "acompte_paye" | "solde_paye"
  quoteNumber: string
  createdAt: string
}

export interface BlockedDate {
  productId: number
  date: string
  bookingId: string
}

export interface PaymentRecord {
  id: string
  bookingId: string
  amount: number
  stripePaymentIntentId: string
  status: "pending" | "succeeded" | "failed"
  createdAt: string
}

export interface LateAlert {
  id: string
  bookingId: string
  productId: number
  productNom: string
  dateRestitutionPrevue: string
  joursRetard: number
  penaliteCalculee: number
  penalitePercent: number
  destinataires: string[]
  sentAt: string
}

export interface EmailLog {
  id: string
  to: string
  type: string
  subject: string
  status: "sent" | "failed"
  bookingId?: string
  error?: string
  sentAt: string
}

export interface ProductView {
  id: string
  customerEmail: string
  productId: number
  viewedAt: string
  reminderSent: boolean
  reminderSentAt?: string
}
