import { NextResponse, type NextRequest } from "next/server"
import { promises as fs } from "fs"
import path from "path"

// ─── Auth check ──────────────────────────────────────────────────────────────
function checkAuth(req: NextRequest) {
  const cookie = req.cookies.get("admin_session")
  return cookie?.value === "authenticated"
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface PageSpeedResult {
  url: string
  strategy: "mobile" | "desktop"
  score: number
  lcp: number | null
  fcp: number | null
  tbt: number | null
  cls: number | null
  ttfb: number | null
  totalWeight: number | null
  imageWeight: number | null
  opportunities: { id: string; title: string; description: string; savings: string }[]
}

interface CacheData {
  timestamp: string
  results: PageSpeedResult[]
}

// ─── Cache ───────────────────────────────────────────────────────────────────
const CACHE_DIR = path.join(process.cwd(), ".cache")
const CACHE_FILE = path.join(CACHE_DIR, "performance.json")
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24h

async function readCache(): Promise<CacheData | null> {
  try {
    const raw = await fs.readFile(CACHE_FILE, "utf-8")
    const data: CacheData = JSON.parse(raw)
    if (Date.now() - new Date(data.timestamp).getTime() < CACHE_TTL) return data
    return null
  } catch {
    return null
  }
}

async function writeCache(results: PageSpeedResult[]): Promise<void> {
  await fs.mkdir(CACHE_DIR, { recursive: true })
  const data: CacheData = { timestamp: new Date().toISOString(), results }
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2))
}

// ─── PageSpeed API ───────────────────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

const URLS_TO_TEST = [
  { label: "Accueil", url: BASE_URL },
  { label: "Catalogue", url: `${BASE_URL}/catalogue` },
  { label: "Fiche produit", url: `${BASE_URL}/produit/chevalet-fer-forge-noir` },
]

function scoreColor(score: number): "good" | "average" | "poor" {
  if (score >= 90) return "good"
  if (score >= 50) return "average"
  return "poor"
}

function extractNumber(audit: any): number | null {
  if (!audit) return null
  const v = audit.numericValue ?? audit.displayValue
  if (typeof v === "number") return Math.round(v)
  if (typeof v === "string") {
    const m = v.match(/([\d.]+)/)
    return m ? parseFloat(m[1]) : null
  }
  return null
}

function formatBytes(bytes: number | null): string {
  if (bytes == null) return "—"
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / 1048576).toFixed(1)} Mo`
}

function extractWeight(audit: any): number | null {
  if (!audit?.details?.items) return null
  let total = 0
  for (const item of audit.details.items) {
    total += item.totalBytes || 0
  }
  return total > 0 ? total : null
}

function extractImageWeight(audit: any): number | null {
  if (!audit?.details?.items) return null
  let total = 0
  for (const item of audit.details.items) {
    if (item.resourceType === "image" || item.url?.match(/\.(png|jpe?g|gif|webp|svg|avif)/i)) {
      total += item.totalBytes || 0
    }
  }
  return total > 0 ? total : null
}

function extractOpportunities(lhr: any): { id: string; title: string; description: string; savings: string }[] {
  const opps: { id: string; title: string; description: string; savings: string }[] = []
  if (!lhr?.audits) return opps

  for (const [id, audit] of Object.entries<any>(lhr.audits)) {
    if (audit.details?.type === "opportunity" && audit.details?.overallSavingsMs > 0) {
      const ms = audit.details.overallSavingsMs
      const bytes = audit.details.overallSavingsBytes || 0
      let savings = ""
      if (ms > 0) savings += `${Math.round(ms)} ms`
      if (bytes > 0) savings += `${savings ? " · " : ""}${formatBytes(bytes)}`
      opps.push({
        id,
        title: audit.title || id,
        description: audit.description || "",
        savings,
      })
    }
  }

  return opps.sort((a, b) => {
    const mA = parseInt(a.savings) || 0
    const mB = parseInt(b.savings) || 0
    return mB - mA
  })
}

async function runPageSpeed(url: string, strategy: "mobile" | "desktop"): Promise<PageSpeedResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
  })
  if (apiKey) params.set("key", apiKey)

  const endpoint = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`
  const res = await fetch(endpoint, { signal: AbortSignal.timeout(60000) })
  if (!res.ok) throw new Error(`PageSpeed API error: ${res.status}`)
  const data = await res.json()
  const lhr = data.lighthouseResult

  const perfAudit = lhr?.audits?.["performance-score"]
  const score = Math.round((perfAudit?.score ?? 0) * 100)

  return {
    url,
    strategy,
    score,
    lcp: extractNumber(lhr?.audits?.["largest-contentful-paint"]),
    fcp: extractNumber(lhr?.audits?.["first-contentful-paint"]),
    tbt: extractNumber(lhr?.audits?.["total-blocking-time"]),
    cls: lhr?.audits?.["cumulative-layout-shift"]?.numericValue != null
      ? Math.round(lhr.audits["cumulative-layout-shift"].numericValue * 1000) / 1000
      : null,
    ttfb: extractNumber(lhr?.audits?.["server-response-time"]),
    totalWeight: extractWeight(lhr?.audits?.["total-byte-weight"]),
    imageWeight: extractImageWeight(lhr?.audits?.["uses-optimized-images"] ?? lhr?.audits?.["offscreen-images"]),
    opportunities: extractOpportunities(lhr),
  }
}

// ─── Route handler ───────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const refresh = req.nextUrl.searchParams.get("refresh") === "true"

  // Try cache first
  if (!refresh) {
    const cached = await readCache()
    if (cached) {
      return NextResponse.json({ results: cached.results, cached: true, timestamp: cached.timestamp })
    }
  }

  // Run PageSpeed for all URLs × strategies
  const results: PageSpeedResult[] = []
  const errors: string[] = []

  for (const { url } of URLS_TO_TEST) {
    for (const strategy of ["mobile", "desktop"] as const) {
      try {
        const result = await runPageSpeed(url, strategy)
        results.push(result)
      } catch (e: any) {
        errors.push(`${url} (${strategy}): ${e.message}`)
      }
    }
  }

  // Save cache if we got results
  if (results.length > 0) {
    await writeCache(results)
  }

  return NextResponse.json({
    results,
    errors: errors.length > 0 ? errors : undefined,
    cached: false,
    timestamp: new Date().toISOString(),
  })
}
