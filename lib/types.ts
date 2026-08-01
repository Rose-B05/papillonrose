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
  customerEmail?: string
  totalHt: number
  totalTtc: number
  depositAmount: number
  status: "pending-quote" | "quote-sent" | "signed" | "deposit-pending" | "confirmed" | "cancelled" | "returned" | "expired"
  quoteNumber?: string
  createdAt: string
  updatedAt: string
  quoteSentAt?: string
  quoteReminderSentAt?: string
  paymentIntentId?: string
  depositPaidAt?: string
  balancePaidAt?: string
  returnedAt?: string
  signature?: {
    data: string
    signedAt: string
    signerName: string
    ipAddress?: string
  }
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

export interface BlockEntry {
  qty: number
  expiresAt: number
  type: "cart" | "booking"
}

export const CART_BLOCK_TTL_MS = 3 * 60 * 60 * 1000
export const BOOKING_BLOCK_TTL_MS = 48 * 60 * 60 * 1000

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

export interface NewsletterSubscriber {
  email: string
  status: "pending" | "confirmed" | "unsubscribed"
  confirmToken: string
  subscribedAt: string
  confirmedAt?: string
  unsubscribedAt?: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  date: string
  message: string
  read: boolean
  createdAt: string
}

export type NouveauteType = "image" | "video" | "document"
export type NouveauteStatus = "brouillon" | "publie"

export interface Nouveaute {
  id: string
  titre: string
  description: string
  type: NouveauteType
  statut: NouveauteStatus
  mediaUrl: string
  mediaThumbnail?: string
  lienAction?: string
  labelAction?: string
  ordre: number
  dateCreation: string
  dateModification: string
}
