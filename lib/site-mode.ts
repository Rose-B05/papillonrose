import { getSiteMode } from "./db"

export async function getRobotsMeta(): Promise<{ index: boolean; follow: boolean }> {
  try {
    const mode = await getSiteMode()
    if (mode === "production") {
      return { index: true, follow: true }
    }
    // development + seo_audit → noindex, follow (allow link crawling for audit tools)
    return { index: false, follow: true }
  } catch {
    // KV unavailable during build — default to safe mode (noindex)
    return { index: false, follow: true }
  }
}
