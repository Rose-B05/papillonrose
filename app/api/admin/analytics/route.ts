import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"

export const runtime = "nodejs"

const VERCEL_TOKEN = process.env.VERCEL_API_TOKEN
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "prj_QNrSDgSIf4VZRr7a8GYdkWNO0YlI"
const TEAM_ID = "team_pc8K2oDR9AzAzsZwuoFvqNjk"

async function queryVercel(endpoint: string, params: Record<string, string>) {
  const qs = new URLSearchParams(params).toString()
  const url = `https://api.vercel.com${endpoint}?${qs}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
  })
  if (!res.ok) {
    const body = await res.text()
    console.error(`Vercel API ${res.status}: ${body}`)
    return { data: [] }
  }
  return res.json()
}

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  if (!VERCEL_TOKEN) {
    return NextResponse.json({ error: "VERCEL_API_TOKEN non configuré" }, { status: 500 })
  }

  const period = request.nextUrl.searchParams.get("period") || "30d"
  const now = new Date()
  let since: Date

  switch (period) {
    case "7d": since = new Date(now.getTime() - 7 * 86400000); break
    case "90d": since = new Date(now.getTime() - 90 * 86400000); break
    case "365d": since = new Date(now.getTime() - 365 * 86400000); break
    default: since = new Date(now.getTime() - 30 * 86400000)
  }

  const sinceStr = since.toISOString()
  const untilStr = now.toISOString()
  const baseParams = { projectId: PROJECT_ID, teamId: TEAM_ID, since: sinceStr, until: untilStr }

  try {
    const [byDay, topPages, topReferrers, byCountry, byDevice] = await Promise.all([
      queryVercel("/v1/query/web-analytics/visits/aggregate", { ...baseParams, by: "day", limit: "100" }),
      queryVercel("/v1/query/web-analytics/visits/aggregate", { ...baseParams, by: "requestPath", limit: "25" }),
      queryVercel("/v1/query/web-analytics/visits/aggregate", { ...baseParams, by: "referrerHostname", limit: "15" }),
      queryVercel("/v1/query/web-analytics/visits/aggregate", { ...baseParams, by: "country", limit: "15" }),
      queryVercel("/v1/query/web-analytics/visits/aggregate", { ...baseParams, by: "deviceType", limit: "5" }),
    ])

    const dayData = byDay.data || []
    const pageData = topPages.data || []
    const refData = topReferrers.data || []

    const byDayTotals = {
      pageviews: dayData.reduce((sum: number, d: any) => sum + (d.pageviews || 0), 0),
      visitors: dayData.reduce((sum: number, d: any) => sum + (d.visitors || 0), 0),
    }

    const pageTotals = {
      pageviews: pageData.reduce((sum: number, p: any) => sum + (p.pageviews || 0), 0),
      visitors: refData.reduce((sum: number, r: any) => sum + (r.visitors || 0), 0),
    }

    const totals = {
      pageviews: Math.max(byDayTotals.pageviews, pageTotals.pageviews),
      visitors: Math.max(byDayTotals.visitors, pageTotals.visitors),
    }

    return NextResponse.json({
      period,
      since: sinceStr,
      until: untilStr,
      totals,
      byDay: dayData,
      topPages: pageData,
      topReferrers: refData,
      byCountry: byCountry.data,
      byDevice: byDevice.data,
    })
  } catch (error: any) {
    console.error("Analytics API error:", error?.message)
    return NextResponse.json(
      { error: "Erreur analytics: " + (error?.message || "Inconnue") },
      { status: 500 }
    )
  }
}
