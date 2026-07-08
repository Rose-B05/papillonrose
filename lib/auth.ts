import bcrypt from "bcryptjs"

const COOKIE_NAME = "admin_session"
const SESSION_MAX_AGE = 60 * 60 * 24 // 24 hours

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || ""
}

export function getAdminPasswordHash(): string {
  return process.env.ADMIN_PASSWORD_HASH || ""
}

export async function verifyAdmin(email: string, password: string): Promise<boolean> {
  const validEmail = getAdminEmail()
  const validHash = getAdminPasswordHash()
  if (!validEmail || !validHash) return false
  if (email !== validEmail) return false
  return bcrypt.compare(password, validHash)
}

export { COOKIE_NAME, SESSION_MAX_AGE }
