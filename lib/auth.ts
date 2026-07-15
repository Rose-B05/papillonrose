import bcrypt from "bcryptjs"
import { kv } from "@vercel/kv"

const COOKIE_NAME = "admin_session"
const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || ""
}

export async function getAdminPasswordHash(): Promise<string> {
  const envHash = process.env.ADMIN_PASSWORD_HASH || ""
  try {
    const kvHash = await kv.get<string>("admin_password_hash")
    if (kvHash && kvHash !== envHash) return kvHash
  } catch {}
  return envHash
}

export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  const validEmail = getAdminEmail()
  if (!validEmail) return false
  if (email !== validEmail) return false
  const validHash = await getAdminPasswordHash()
  if (!validHash) return false
  return bcrypt.compare(password, validHash)
}

export { COOKIE_NAME, SESSION_MAX_AGE }
