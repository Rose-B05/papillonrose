import "server-only"

const VERCEL_API_BASE = "https://api.vercel.com"

function getConfig() {
  const token = process.env.VERCEL_API_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID

  if (!token || !projectId) {
    const missing = []
    if (!token) missing.push("VERCEL_API_TOKEN")
    if (!projectId) missing.push("VERCEL_PROJECT_ID")
    throw new Error(
      `Variables manquantes pour Vercel Analytics: ${missing.join(", ")}. ` +
      `Créez-les dans Vercel → Project Settings → Environment Variables.`
    )
  }

  return { token, projectId }
}

function getTeamParam(): string {
  const teamId = process.env.VERCEL_TEAM_ID
  return teamId ? `&teamId=${teamId}` : ""
}

type Period = "7" | "30" | "90"

function getDateRange(period: Period): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000)
  const daysMap: Record<Period, number> = { "7": 7, "30": 30, "90": 90 }
  const from = to - daysMap[period] * 86400
  return { from, to }
}

async function vercelFetch<T>(path: string, token: string): Promise<T> {
  const url = `${VERCEL_API_BASE}${path}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(
      body.error?.message || body.message || `Erreur API Vercel (${res.status})`
    )
  }

  return res.json()
}

export type VercelAnalyticsData = {
  visitors: number
  pageViews: number
  topPages: { page: string; views: number }[]
}

export async function getVercelAnalytics(period: string): Promise<VercelAnalyticsData> {
  if (!["7", "30", "90"].includes(period)) {
    throw new Error(`Période invalide: "${period}". Valeurs autorisées: 7, 30, 90`)
  }

  const { token, projectId } = getConfig()
  const { from, to } = getDateRange(period as Period)
  const teamParam = getTeamParam()

  const viewsPath =
    `/v1/query/web-analytics/${projectId}/views?from=${from}&to=${to}&unit=day${teamParam}`
  const visitorsPath =
    `/v1/query/web-analytics/${projectId}/visitors?from=${from}&to=${to}&unit=day${teamParam}`

  const [viewsRes, visitorsRes] = await Promise.all([
    vercelFetch<any>(viewsPath, token),
    vercelFetch<any>(visitorsPath, token),
  ])

  const visitors = Array.isArray(visitorsRes)
    ? visitorsRes.reduce((sum: number, item: any) => sum + (item.visitors ?? item.value ?? 0), 0)
    : 0

  const pageViews = Array.isArray(viewsRes)
    ? viewsRes.reduce((sum: number, item: any) => sum + (item.pageviews ?? item.value ?? 0), 0)
    : 0

  let topPages: { page: string; views: number }[] = []

  try {
    const pagesPath =
      `/v1/query/web-analytics/${projectId}/pages?from=${from}&to=${to}&limit=10${teamParam}`
    const pagesRes = await vercelFetch<any>(pagesPath, token)

    if (Array.isArray(pagesRes)) {
      topPages = pagesRes.map((item: any) => ({
        page: item.page ?? item.pathname ?? item.url ?? "",
        views: item.pageviews ?? item.views ?? item.value ?? 0,
      }))
    }
  } catch {
    topPages = []
  }

  return { visitors, pageViews, topPages }
}
