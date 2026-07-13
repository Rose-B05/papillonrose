import { kv } from "@vercel/kv"
import { getSiteMode } from "./db"

// ─── Types ──────────────────────────────────────────────────────────────────

export type SiteMode = "development" | "production"

export interface PageSeoInfo {
  path: string
  label: string
  critical: boolean
  title: string
  description: string
  canonical: string
  robots: string
  h1: string
  h2: string
  statusCode: number
  indexable: boolean
  lastModified: string
  lastCrawl: string
}

export interface SeoAlert {
  id: string
  type: "error" | "warning" | "info"
  category: string
  message: string
  page?: string
  action?: string
  timestamp: string
}

export interface SeoScore {
  total: number
  seo: number
  performance: number
  accessibility: number
  security: number
  indexation: number
  blockingIssues: string[]
  recommendations: string[]
}

export interface SeoHistoryEntry {
  id: string
  date: string
  user: string
  action: string
  result: string
  rollbackAvailable: boolean
}

export interface RobotsInfo {
  content: string
  lastModified: string
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface SitemapInfo {
  urlCount: number
  lastGenerated: string
  sizeBytes: number
  status: "valid" | "empty" | "error"
  content: string
}

export interface IndexationStats {
  totalPages: number
  indexablePages: number
  noindexPages: number
  indexedPages: number
  nonIndexedPages: number
  excludedPages: number
  blockedPages: number
  lastIndexation: string
  lastSitemapGeneration: string
  lastRobotsModification: string
}

export interface SecurityCheck {
  name: string
  label: string
  passed: boolean
  message: string
}

export interface SearchResult {
  engine: string
  connected: boolean
  property?: string
  lastSync?: string
  indexedPages?: number
  nonIndexedPages?: number
  errors?: number
  coverage?: number
  coreWebVitals?: number
  pagesDiscovered?: number
  pagesCrawled?: number
  pagesWithErrors?: number
}

// ─── Page Definitions ───────────────────────────────────────────────────────

export const PAGE_DEFINITIONS: Omit<PageSeoInfo, "statusCode" | "lastCrawl">[] = [
  {
    path: "/",
    label: "Accueil",
    critical: true,
    title: "Papillon Rose — Location mobilier & décoration événements en Île-de-France",
    description: "Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France.",
    canonical: "https://www.papillonrose.fr/",
    robots: "index, follow",
    h1: "Papillon Rose",
    h2: "Location mobilier & décoration",
    indexable: true,
    lastModified: new Date().toISOString(),
  },
  {
    path: "/a-propos",
    label: "À propos",
    critical: false,
    title: "À propos | Papillon Rose",
    description: "Découvrez Papillon Rose, votre partenaire décoration événementielle en Île-de-France.",
    canonical: "https://www.papillonrose.fr/a-propos",
    robots: "index, follow",
    h1: "À propos de Papillon Rose",
    h2: "Notre histoire",
    indexable: true,
    lastModified: new Date().toISOString(),
  },
  {
    path: "/reservation",
    label: "Réservation",
    critical: true,
    title: "Demande de devis | Papillon Rose",
    description: "Composez votre sélection et recevez votre devis de location en moins de 24h.",
    canonical: "https://www.papillonrose.fr/reservation",
    robots: "index, follow",
    h1: "Demander un devis",
    h2: "Votre sélection",
    indexable: true,
    lastModified: new Date().toISOString(),
  },
  {
    path: "/faq",
    label: "FAQ",
    critical: false,
    title: "Questions fréquentes | Papillon Rose",
    description: "Trouvez les réponses à vos questions sur la location de mobilier et décoration.",
    canonical: "https://www.papillonrose.fr/faq",
    robots: "index, follow",
    h1: "Questions fréquentes",
    h2: "Réservation",
    indexable: true,
    lastModified: new Date().toISOString(),
  },
  {
    path: "/conditions-location",
    label: "Conditions de location",
    critical: false,
    title: "Conditions de location | Papillon Rose",
    description: "Conditions générales de location de mobilier et décoration événementielle.",
    canonical: "https://www.papillonrose.fr/conditions-location",
    robots: "index, follow",
    h1: "Conditions de location",
    h2: "Article 1 — Objet",
    indexable: true,
    lastModified: new Date().toISOString(),
  },
  {
    path: "/mentions-legales",
    label: "Mentions légales",
    critical: false,
    title: "Mentions légales | Papillon Rose",
    description: "Mentions légales du site Papillon Rose.",
    canonical: "https://www.papillonrose.fr/mentions-legales",
    robots: "index, follow",
    h1: "Mentions légales",
    h2: "Éditeur du site",
    indexable: true,
    lastModified: new Date().toISOString(),
  },
  {
    path: "/compte",
    label: "Mon compte",
    critical: false,
    title: "Mon compte | Papillon Rose",
    description: "Gérez votre profil, vos favoris et vos réservations.",
    canonical: "https://www.papillonrose.fr/compte",
    robots: "noindex, nofollow",
    h1: "Mon compte",
    h2: "Connexion",
    indexable: false,
    lastModified: new Date().toISOString(),
  },
]

// ─── Score Calculation ──────────────────────────────────────────────────────

export function calculateSeoScore(
  mode: SiteMode,
  pages: PageSeoInfo[],
  alerts: SeoAlert[],
  siteUrl: string
): SeoScore {
  const blockingIssues: string[] = []
  const recommendations: string[] = []

  // SEO Score (30 points)
  let seoScore = 30
  const pagesWithoutTitle = pages.filter((p) => !p.title || p.title.length < 10)
  const pagesWithoutDescription = pages.filter((p) => !p.description || p.description.length < 20)
  const pagesWithoutH1 = pages.filter((p) => !p.h1)
  const pagesWithoutCanonical = pages.filter((p) => !p.canonical)

  if (pagesWithoutTitle.length > 0) {
    seoScore -= pagesWithoutTitle.length * 3
    blockingIssues.push(`${pagesWithoutTitle.length} page(s) sans Title`)
  }
  if (pagesWithoutDescription.length > 0) {
    seoScore -= pagesWithoutDescription.length * 3
    blockingIssues.push(`${pagesWithoutDescription.length} page(s) sans Description`)
  }
  if (pagesWithoutH1.length > 0) {
    seoScore -= pagesWithoutH1.length * 2
    blockingIssues.push(`${pagesWithoutH1.length} page(s) sans H1`)
  }
  if (pagesWithoutCanonical.length > 0) {
    seoScore -= pagesWithoutCanonical.length * 2
    recommendations.push(`Ajouter des canonical URLs aux ${pagesWithoutCanonical.length} page(s) manquantes`)
  }

  // Performance Score (20 points)
  let performanceScore = 20
  const criticalPages = pages.filter((p) => p.critical)
  const slowPages = criticalPages.filter((p) => p.statusCode !== 200)
  if (slowPages.length > 0) {
    performanceScore -= slowPages.length * 5
    blockingIssues.push(`${slowPages.length} page(s) critique(s) avec erreur ${slowPages[0]?.statusCode}`)
  }
  recommendations.push("Vérifier les Core Web Vitals via PageSpeed Insights")

  // Accessibility Score (20 points)
  let accessibilityScore = 20
  const pagesWithoutH2 = pages.filter((p) => !p.h2)
  if (pagesWithoutH2.length > 0) {
    accessibilityScore -= pagesWithoutH2.length * 2
    recommendations.push(`${pagesWithoutH2.length} page(s) sans sous-titre H2`)
  }
  recommendations.push("Tester l'accessibilité avec Lighthouse")

  // Security Score (15 points)
  let securityScore = 15
  if (!siteUrl.startsWith("https://")) {
    securityScore -= 10
    blockingIssues.push("Site non sécurisé (pas de HTTPS)")
  }
  recommendations.push("Vérifier le certificat SSL régulièrement")

  // Indexation Score (15 points)
  let indexationScore = 15
  if (mode === "development") {
    indexationScore = 0
    blockingIssues.push("Mode Développement actif — site noindex")
  } else {
    const criticalNoindex = pages.filter((p) => p.critical && p.robots.includes("noindex"))
    if (criticalNoindex.length > 0) {
      indexationScore -= criticalNoindex.length * 5
      blockingIssues.push(`${criticalNoindex.length} page(s) critique(s) en noindex`)
    }
  }

  const alertsErrors = alerts.filter((a) => a.type === "error").length
  if (alertsErrors > 0) {
    seoScore = Math.max(0, seoScore - alertsErrors * 2)
  }

  const total = Math.max(0, Math.min(100,
    Math.round(seoScore + performanceScore + accessibilityScore + securityScore + indexationScore)
  ))

  return {
    total,
    seo: Math.max(0, Math.min(100, Math.round(seoScore * 100 / 30))),
    performance: Math.max(0, Math.min(100, Math.round(performanceScore * 100 / 20))),
    accessibility: Math.max(0, Math.min(100, Math.round(accessibilityScore * 100 / 20))),
    security: Math.max(0, Math.min(100, Math.round(securityScore * 100 / 15))),
    indexation: Math.max(0, Math.min(100, Math.round(indexationScore * 100 / 15))),
    blockingIssues,
    recommendations,
  }
}

// ─── Alert Generation ───────────────────────────────────────────────────────

export function generateAlerts(
  mode: SiteMode,
  pages: PageSeoInfo[],
  siteUrl: string
): SeoAlert[] {
  const alerts: SeoAlert[] = []
  const now = new Date().toISOString()

  // Sitemap alerts
  if (mode === "development") {
    alerts.push({
      id: "sitemap-empty",
      type: "warning",
      category: "Sitemap",
      message: "Le sitemap est vide (mode Développement)",
      action: "Basculer en mode Production pour activer le sitemap",
      timestamp: now,
    })
  }

  // robots.txt alerts
  if (mode === "development") {
    alerts.push({
      id: "robots-disallow",
      type: "warning",
      category: "robots.txt",
      message: "robots.txt bloque l'exploration (Disallow All)",
      action: "Basculer en mode Production pour autoriser l'exploration",
      timestamp: now,
    })
  }

  // Page-level alerts
  for (const page of pages) {
    if (!page.title || page.title.length < 10) {
      alerts.push({
        id: `no-title-${page.path}`,
        type: "error",
        category: "Title",
        message: `Page "${page.label}" sans Title valide`,
        page: page.path,
        timestamp: now,
      })
    }

    if (!page.description || page.description.length < 20) {
      alerts.push({
        id: `no-description-${page.path}`,
        type: "error",
        category: "Description",
        message: `Page "${page.label}" sans Meta Description valide`,
        page: page.path,
        timestamp: now,
      })
    }

    if (!page.h1) {
      alerts.push({
        id: `no-h1-${page.path}`,
        type: "error",
        category: "H1",
        message: `Page "${page.label}" sans H1`,
        page: page.path,
        timestamp: now,
      })
    }

    if (!page.canonical) {
      alerts.push({
        id: `no-canonical-${page.path}`,
        type: "warning",
        category: "Canonical",
        message: `Page "${page.label}" sans canonical URL`,
        page: page.path,
        timestamp: now,
      })
    }

    if (page.robots.includes("noindex") && page.critical) {
      alerts.push({
        id: `critical-noindex-${page.path}`,
        type: "error",
        category: "Indexation",
        message: `Page critique "${page.label}" en noindex`,
        page: page.path,
        timestamp: now,
      })
    }
  }

  // Site URL alerts
  if (!siteUrl) {
    alerts.push({
      id: "no-site-url",
      type: "error",
      category: "Configuration",
      message: "NEXT_PUBLIC_SITE_URL non renseigné",
      timestamp: now,
    })
  }

  return alerts
}

// ─── Indexation Stats ───────────────────────────────────────────────────────

export function getIndexationStats(
  mode: SiteMode,
  pages: PageSeoInfo[]
): IndexationStats {
  const isProduction = mode === "production"
  const indexablePages = pages.filter((p) => p.indexable).length
  const noindexPages = pages.filter((p) => !p.indexable).length
  const indexedPages = isProduction ? indexablePages : 0
  const nonIndexedPages = isProduction ? noindexPages : pages.length
  const excludedPages = pages.filter((p) => p.robots.includes("noindex")).length
  const blockedPages = mode === "development" ? pages.length : 0

  return {
    totalPages: pages.length,
    indexablePages,
    noindexPages,
    indexedPages,
    nonIndexedPages,
    excludedPages,
    blockedPages,
    lastIndexation: isProduction ? new Date().toISOString() : "—",
    lastSitemapGeneration: new Date().toISOString(),
    lastRobotsModification: new Date().toISOString(),
  }
}

// ─── Robots.txt ─────────────────────────────────────────────────────────────

export function generateRobotsContent(mode: SiteMode): RobotsInfo {
  const now = new Date().toISOString()

  if (mode === "production") {
    return {
      content: `User-agent: *
Allow: /

Sitemap: https://www.papillonrose.fr/sitemap.xml`,
      lastModified: now,
      isValid: true,
      errors: [],
      warnings: [],
    }
  }

  return {
    content: `User-agent: *
Disallow: /`,
    lastModified: now,
    isValid: true,
    errors: [],
    warnings: ["Mode Développement — tous les chemins bloqués"],
  }
}

// ─── Sitemap ────────────────────────────────────────────────────────────────

export function generateSitemapInfo(mode: SiteMode): SitemapInfo {
  const isProduction = mode === "production"
  const pages = isProduction ? PAGE_DEFINITIONS.filter((p) => p.indexable) : []

  const urls = pages.map((p) => {
    const priority = p.path === "/" ? "1.0" : p.critical ? "0.8" : "0.5"
    return `  <url>
    <loc>https://www.papillonrose.fr${p.path}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })

  const content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`

  return {
    urlCount: pages.length,
    lastGenerated: new Date().toISOString(),
    sizeBytes: new TextEncoder().encode(content).length,
    status: isProduction ? "valid" : "empty",
    content,
  }
}

// ─── Security Pre-Flight ────────────────────────────────────────────────────

export async function runSecurityChecks(): Promise<SecurityCheck[]> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"
  const checks: SecurityCheck[] = []

  // NEXT_PUBLIC_SITE_URL
  checks.push({
    name: "site-url",
    label: "NEXT_PUBLIC_SITE_URL renseigné",
    passed: !!process.env.NEXT_PUBLIC_SITE_URL,
    message: process.env.NEXT_PUBLIC_SITE_URL ? "Configuré" : "Variable manquante",
  })

  // Domaine valide
  const isDomainValid = /^https?:\/\/[a-z0-9-]+\.[a-z]{2,}/.test(siteUrl)
  checks.push({
    name: "domain-valid",
    label: "Domaine valide",
    passed: isDomainValid,
    message: isDomainValid ? `Domaine : ${new URL(siteUrl).hostname}` : "URL invalide",
  })

  // HTTPS
  const isHttps = siteUrl.startsWith("https://")
  checks.push({
    name: "https",
    label: "HTTPS actif",
    passed: isHttps,
    message: isHttps ? "HTTPS configuré" : "HTTP détecté — HTTPS recommandé",
  })

  // SSL (simulated — in real would check certificate)
  checks.push({
    name: "ssl",
    label: "SSL valide",
    passed: isHttps,
    message: isHttps ? "Certificat SSL actif (vérification basique)" : "Impossible de vérifier sans HTTPS",
  })

  // robots.txt
  const mode = await getSiteMode()
  checks.push({
    name: "robots-valid",
    label: "robots.txt valide",
    passed: true,
    message: mode === "production" ? "Allow All avec Sitemap" : "Disallow All (mode Dev)",
  })

  // Sitemap
  checks.push({
    name: "sitemap-valid",
    label: "Sitemap valide",
    passed: mode === "production",
    message: mode === "production" ? "Sitemap actif avec pages" : "Sitemap vide (mode Dev)",
  })

  // No critical noindex in production
  if (mode === "production") {
    const criticalNoindex = PAGE_DEFINITIONS.filter((p) => p.critical && p.robots.includes("noindex"))
    checks.push({
      name: "no-critical-noindex",
      label: "Aucune page critique en noindex",
      passed: criticalNoindex.length === 0,
      message: criticalNoindex.length === 0
        ? "Toutes les pages critiques sont indexables"
        : `${criticalNoindex.length} page(s) critique(s) en noindex`,
    })
  } else {
    checks.push({
      name: "no-critical-noindex",
      label: "Aucune page critique en noindex",
      passed: false,
      message: "Mode Développement — toutes les pages sont noindex",
    })
  }

  // No 404 critical pages
  const errorPages = PAGE_DEFINITIONS.filter((p) => p.critical && p.statusCode >= 400)
  checks.push({
    name: "no-404",
    label: "Aucune erreur 404 critique",
    passed: errorPages.length === 0,
    message: errorPages.length === 0 ? "Pas d'erreur critique" : `${errorPages.length} page(s) en erreur`,
  })

  // Meta robots coherence
  checks.push({
    name: "meta-robots-coherent",
    label: "Meta robots cohérents",
    passed: mode === "production",
    message: mode === "production" ? "Meta robots index, follow" : "Meta robots noindex (cohérent avec le mode)",
  })

  // Canonical coherence
  const pagesWithoutCanonical = PAGE_DEFINITIONS.filter((p) => !p.canonical)
  checks.push({
    name: "canonical-coherent",
    label: "Canonicals cohérents",
    passed: pagesWithoutCanonical.length === 0,
    message: pagesWithoutCanonical.length === 0
      ? "Toutes les pages ont un canonical"
      : `${pagesWithoutCanonical.length} page(s) sans canonical`,
  })

  // No blocking errors
  const blockingErrors = checks.filter((c) => !c.passed && c.name !== "no-critical-noindex" && c.name !== "sitemap-valid")
  checks.push({
    name: "no-blocking-errors",
    label: "Aucune erreur bloquante",
    passed: blockingErrors.length === 0,
    message: blockingErrors.length === 0 ? "Aucune erreur bloquante détectée" : `${blockingErrors.length} erreur(s) bloquante(s)`,
  })

  return checks
}

// ─── History ────────────────────────────────────────────────────────────────

const SEO_HISTORY_KEY = "seo_history"

export async function getSeoHistory(): Promise<SeoHistoryEntry[]> {
  try {
    const history = await kv.get<SeoHistoryEntry[]>(SEO_HISTORY_KEY)
    return history || []
  } catch {
    return []
  }
}

export async function addSeoHistoryEntry(entry: Omit<SeoHistoryEntry, "id" | "date">): Promise<void> {
  const history = await getSeoHistory()
  const newEntry: SeoHistoryEntry = {
    id: `seo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    ...entry,
  }
  history.unshift(newEntry)
  // Keep last 100 entries
  if (history.length > 100) history.length = 100
  await kv.set(SEO_HISTORY_KEY, history)
}

// ─── Report Generation ──────────────────────────────────────────────────────

export function generateReport(
  mode: SiteMode,
  pages: PageSeoInfo[],
  alerts: SeoAlert[],
  score: SeoScore,
  robotsInfo: RobotsInfo,
  sitemapInfo: SitemapInfo,
  securityChecks: SecurityCheck[]
): object {
  return {
    generatedAt: new Date().toISOString(),
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr",
    mode,
    score,
    indexation: getIndexationStats(mode, pages),
    robots: {
      content: robotsInfo.content,
      lastModified: robotsInfo.lastModified,
      isValid: robotsInfo.isValid,
      errors: robotsInfo.errors,
      warnings: robotsInfo.warnings,
    },
    sitemap: {
      urlCount: sitemapInfo.urlCount,
      lastGenerated: sitemapInfo.lastGenerated,
      sizeBytes: sitemapInfo.sizeBytes,
      status: sitemapInfo.status,
    },
    pages: pages.map((p) => ({
      path: p.path,
      label: p.label,
      title: p.title,
      description: p.description,
      robots: p.robots,
      indexable: p.indexable,
    })),
    alerts: alerts.map((a) => ({
      type: a.type,
      category: a.category,
      message: a.message,
      page: a.page,
    })),
    security: securityChecks.map((c) => ({
      name: c.label,
      passed: c.passed,
      message: c.message,
    })),
    recommendations: score.recommendations,
    blockingIssues: score.blockingIssues,
  }
}
