// ─── Calculateur de frais de livraison Papillon Rose ──────────────────────────
// Point de départ : Créteil (94000) — 48.7773° N, 2.4620° E
// Tarif : 20€ forfait de base + 1,50€/km (distance routière)
// Départements couverts : 94, 93, 95, 77, 91
//
// Méthode : lookup table code postal → coordonnées GPS approximatives,
// distance à vol d'oiseau (Haversine) × coefficient routier 1.3.
// Pas d'API externe requise.

// ─── Coordonnées de Créteil (point de départ) ────────────────────────────────
const CRETEIL = { lat: 48.7773, lon: 2.4620 } as const

// ─── Constantes tarifaires ───────────────────────────────────────────────────
export const DELIVERY_BASE_FEE = 20 // forfait de base en €
export const DELIVERY_PER_KM = 1.50 // tarif kilométrique en €/km
export const ROAD_COEFFICIENT = 1.3 // coefficient de majoration route vs vol d'oiseau
export const FREE_DELIVERY_THRESHOLD = 150 // livraison gratuite à partir de 150€ de location

// ─── Départements autorisés ──────────────────────────────────────────────────
export const ALLOWED_DEPARTMENTS = ["94", "93", "95", "77", "91"] as const

// ─── Lookup table : préfixe postal (3 chiffres) → coords GPS approximatives ─
// Sources : coordonnées des chefs-lieux et grandes villes de chaque département.
// Pour un même préfixe postal, on utilise les coords du centre de la zone couverte.
// NOTE : ces coordonnées sont approximatives (±2-5 km). Pour une précision
// optimale, il faudrait une API de géocoding (Google Maps, OpenCage, etc.).
const POSTAL_CODE_COORDS: Record<string, { lat: number; lon: number; label: string }> = {
  // ── 94 — Val-de-Marne ──
  "940": { lat: 48.7900, lon: 2.4550, label: "Créteil / Val-de-Marne nord" },
  "941": { lat: 48.7900, lon: 2.4550, label: "Créteil / Val-de-Marne nord" },
  "942": { lat: 48.7400, lon: 2.3500, label: "Villejuif / Val-de-Marne ouest" },
  "943": { lat: 48.7000, lon: 2.5000, label: "Sucy-en-Brie / Val-de-Marne est" },
  "944": { lat: 48.7400, lon: 2.3500, label: "Villejuif / Val-de-Marne ouest" },

  // ── 93 — Seine-Saint-Denis ──
  "930": { lat: 48.9100, lon: 2.4900, label: "Saint-Denis / Seine-Saint-Denis ouest" },
  "931": { lat: 48.9100, lon: 2.4900, label: "Saint-Denis / Seine-Saint-Denis ouest" },
  "932": { lat: 48.8700, lon: 2.5300, label: "Montreuil / Seine-Saint-Denis est" },
  "933": { lat: 48.9300, lon: 2.5100, label: "Aubervilliers / Seine-Saint-Denis nord" },
  "934": { lat: 48.8700, lon: 2.5300, label: "Montreuil / Seine-Saint-Denis est" },

  // ── 95 — Val-d'Oise ──
  "950": { lat: 49.0400, lon: 2.0800, label: "Pontoise / Val-d'Oise ouest" },
  "951": { lat: 49.0400, lon: 2.0800, label: "Pontoise / Val-d'Oise ouest" },
  "952": { lat: 48.9900, lon: 2.3500, label: "Argenteuil / Val-d'Oise sud" },
  "953": { lat: 49.0200, lon: 2.2500, label: "Gonesse / Val-d'Oise centre" },
  "954": { lat: 49.0200, lon: 2.2500, label: "Gonesse / Val-d'Oise centre" },
  "955": { lat: 49.0200, lon: 2.2500, label: "Gonesse / Val-d'Oise centre" },
  "956": { lat: 49.1000, lon: 2.2000, label: "L'Isle-Adam / Val-d'Oise nord" },
  "957": { lat: 49.0400, lon: 2.0800, label: "Pontoise / Val-d'Oise ouest" },
  "958": { lat: 49.1000, lon: 2.2000, label: "L'Isle-Adam / Val-d'Oise nord" },

  // ── 77 — Seine-et-Marne ──
  "770": { lat: 48.5400, lon: 2.6600, label: "Melun / Seine-et-Marne centre" },
  "771": { lat: 48.5400, lon: 2.6600, label: "Melun / Seine-et-Marne centre" },
  "772": { lat: 48.4000, lon: 2.7000, label: "Fontainebleau / Seine-et-Marne sud" },
  "773": { lat: 48.8400, lon: 2.9000, label: "Meaux / Seine-et-Marne est" },
  "774": { lat: 48.8400, lon: 2.9000, label: "Meaux / Seine-et-Marne est" },
  "775": { lat: 48.5400, lon: 2.6600, label: "Melun / Seine-et-Marne centre" },
  "776": { lat: 48.8400, lon: 2.9000, label: "Meaux / Seine-et-Marne est" },

  // ── 91 — Essonne ──
  "910": { lat: 48.6300, lon: 2.4400, label: "Évry / Essonne nord" },
  "911": { lat: 48.6300, lon: 2.4400, label: "Évry / Essonne nord" },
  "912": { lat: 48.7000, lon: 2.2300, label: "Palaiseau / Essonne ouest" },
  "913": { lat: 48.5300, lon: 2.2500, label: "Étampes / Essonne sud" },
  "914": { lat: 48.6300, lon: 2.4400, label: "Évry / Essonne nord" },
  "915": { lat: 48.7000, lon: 2.2300, label: "Palaiseau / Essonne ouest" },
  "916": { lat: 48.7000, lon: 2.2300, label: "Palaiseau / Essonne ouest" },
  "917": { lat: 48.5300, lon: 2.2500, label: "Étampes / Essonne sud" },
}

// ─── Extraction du département depuis un code postal français ─────────────────
export function getDepartment(postalCode: string): string | null {
  const cleaned = postalCode.trim()
  if (!/^\d{5}$/.test(cleaned)) return null
  return cleaned.substring(0, 2)
}

// ─── Vérification si un département est couvert ──────────────────────────────
export function isDepartmentAllowed(postalCode: string): boolean {
  const dept = getDepartment(postalCode)
  return dept !== null && (ALLOWED_DEPARTMENTS as readonly string[]).includes(dept)
}

// ─── Distance de Haversine (vol d'oiseau) ────────────────────────────────────
// Retourne la distance en km entre deux points GPS
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // rayon de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ─── Résolution des coordonnées GPS depuis un code postal ────────────────────
export function getCoordsFromPostalCode(postalCode: string): { lat: number; lon: number; label: string } | null {
  const cleaned = postalCode.trim()
  if (!/^\d{5}$/.test(cleaned)) return null
  const prefix = cleaned.substring(0, 3)
  return POSTAL_CODE_COORDS[prefix] || null
}

// ─── Calcul de la distance routière depuis Créteil ───────────────────────────
// Retourne la distance en km (vol d'oiseau × coefficient routier 1.3)
export function calcRoadDistanceFromCreteil(postalCode: string): number | null {
  const coords = getCoordsFromPostalCode(postalCode)
  if (!coords) return null
  const airDistance = haversineDistance(CRETEIL.lat, CRETEIL.lon, coords.lat, coords.lon)
  return Math.round(airDistance * ROAD_COEFFICIENT * 10) / 10 // arrondi à 0.1 km
}

// ─── Calcul des frais de livraison ───────────────────────────────────────────
export interface DeliveryResult {
  allowed: boolean
  postalCode: string
  department: string | null
  distanceKm: number | null
  baseFee: number
  perKmFee: number
  totalFee: number
  freeDelivery: boolean
  zoneLabel: string
  error?: string
}

export function calcDeliveryFee(postalCode: string, cartTotal: number = 0): DeliveryResult {
  const department = getDepartment(postalCode)

  if (!department) {
    return {
      allowed: false,
      postalCode,
      department: null,
      distanceKm: null,
      baseFee: DELIVERY_BASE_FEE,
      perKmFee: 0,
      totalFee: 0,
      freeDelivery: false,
      zoneLabel: "",
      error: "Code postal invalide",
    }
  }

  if (!isDepartmentAllowed(postalCode)) {
    return {
      allowed: false,
      postalCode,
      department,
      distanceKm: null,
      baseFee: DELIVERY_BASE_FEE,
      perKmFee: 0,
      totalFee: 0,
      freeDelivery: false,
      zoneLabel: "",
      error: `Livraison non disponible en département ${department}. Contactez-nous pour un devis personnalisé.`,
    }
  }

  const distance = calcRoadDistanceFromCreteil(postalCode)
  if (distance === null) {
    return {
      allowed: false,
      postalCode,
      department,
      distanceKm: null,
      baseFee: DELIVERY_BASE_FEE,
      perKmFee: 0,
      totalFee: 0,
      freeDelivery: false,
      zoneLabel: "",
      error: "Code postal non reconnu dans notre zone de livraison.",
    }
  }

  const perKmFee = Math.round(distance * DELIVERY_PER_KM * 100) / 100
  const rawTotal = Math.round((DELIVERY_BASE_FEE + perKmFee) * 100) / 100
  const freeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD
  const totalFee = freeDelivery ? 0 : rawTotal
  const coords = getCoordsFromPostalCode(postalCode)

  return {
    allowed: true,
    postalCode,
    department,
    distanceKm: distance,
    baseFee: DELIVERY_BASE_FEE,
    perKmFee,
    totalFee,
    freeDelivery,
    zoneLabel: coords?.label || "",
  }
}
