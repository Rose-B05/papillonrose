import "server-only"
import { getGa4Client } from "./ga4"

const VALID_PERIODS = ["7", "30", "90"] as const
type Period = (typeof VALID_PERIODS)[number]

function getPeriodDateRange(period: Period) {
  const endDate = "yesterday"
  const startDateMap: Record<Period, string> = {
    "7": "7daysAgo",
    "30": "30daysAgo",
    "90": "90daysAgo",
  }
  return { startDate: startDateMap[period], endDate }
}

export type Ga4DashboardData = {
  totals: { activeUsers: number; sessions: number; screenPageViews: number; keyEvents: number }
  timeline: { date: string; sessions: number }[]
  channels: { channel: string; sessions: number; keyEvents: number }[]
  pages: { pagePath: string; pageTitle: string; screenPageViews: number; activeUsers: number }[]
}

export async function getGa4Dashboard(period: string): Promise<Ga4DashboardData> {
  if (!VALID_PERIODS.includes(period as Period)) {
    throw new Error(`Période invalide: "${period}". Valeurs autorisées: ${VALID_PERIODS.join(", ")}`)
  }

  const propertyId = process.env.GA4_PROPERTY_ID
  if (!propertyId) {
    throw new Error("Variable GA4_PROPERTY_ID manquante.")
  }

  const client = getGa4Client()
  const property = `properties/${propertyId}`
  const dateRange = getPeriodDateRange(period as Period)

  const [totalsRes, timelineRes, channelsRes, pagesRes] = await Promise.all([
    client.runReport({
      property,
      dateRanges: [dateRange],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "keyEvents" },
      ],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ dimension: { dimensionName: "date" } }],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }, { name: "keyEvents" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    }),
    client.runReport({
      property,
      dateRanges: [dateRange],
      dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      limit: 10,
    }),
  ])

  const parseRow = (row: any) => row.metricValues?.map((m: any) => Number(m.value)) ?? []

  const tRow = totalsRes[0]?.rows?.[0]
  const tVals = parseRow(tRow)

  return {
    totals: {
      activeUsers: tVals[0] ?? 0,
      sessions: tVals[1] ?? 0,
      screenPageViews: tVals[2] ?? 0,
      keyEvents: tVals[3] ?? 0,
    },
    timeline: (timelineRes[0]?.rows ?? []).map((row) => {
      const vals = parseRow(row)
      return {
        date: row.dimensionValues?.[0]?.value ?? "",
        sessions: vals[0] ?? 0,
      }
    }),
    channels: (channelsRes[0]?.rows ?? []).map((row) => {
      const vals = parseRow(row)
      return {
        channel: row.dimensionValues?.[0]?.value ?? "",
        sessions: vals[0] ?? 0,
        keyEvents: vals[1] ?? 0,
      }
    }),
    pages: (pagesRes[0]?.rows ?? []).map((row) => {
      const vals = parseRow(row)
      return {
        pagePath: row.dimensionValues?.[0]?.value ?? "",
        pageTitle: row.dimensionValues?.[1]?.value ?? "",
        screenPageViews: vals[0] ?? 0,
        activeUsers: vals[1] ?? 0,
      }
    }),
  }
}
