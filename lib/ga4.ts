import "server-only"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

let client: BetaAnalyticsDataClient | null = null

export function getGa4Client(): BetaAnalyticsDataClient {
  if (client) return client

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!email || !key) {
    throw new Error(
      "Variables GOOGLE_SERVICE_ACCOUNT_EMAIL et GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY manquantes."
    )
  }

  client = new BetaAnalyticsDataClient({
    credentials: {
      client_email: email,
      private_key: key.replace(/\\n/g, "\n"),
    },
  })

  return client
}
