import { getSiteMode } from "./db"

export async function getRobotsMeta(): Promise<{ index: boolean; follow: boolean }> {
  try {
    const mode = await getSiteMode()
    if (mode === "production") {
      return { index: true, follow: true }
    }
  } catch {
    // KV unavailable during build — default to safe mode (noindex)
  }
  return { index: false, follow: false }
}
