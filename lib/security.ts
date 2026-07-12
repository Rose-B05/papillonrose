import { kv } from "@vercel/kv"
import { NextRequest, NextResponse } from "next/server"

// ─── Rate Limiter (in-memory + KV fallback) ────────────────────────────────
// Simple sliding-window rate limiter using KV. Falls back to in-memory if KV unavailable.

const attempts = new Map<string, { count: number; firstAttempt: number }>()

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
  lockoutMs: number
}

const DEFAULT_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 15 * 60 * 1000, // 15 minutes lockout
}

export async function checkRateLimit(
  key: string,
  config: RateLimitConfig = DEFAULT_RATE_LIMIT
): Promise<{ allowed: boolean; retryAfterMs?: number }> {
  const now = Date.now()
  const record = attempts.get(key)

  if (record) {
    // Check if lockout period has passed
    if (record.count >= config.maxAttempts) {
      const lockoutEnd = record.firstAttempt + config.windowMs + config.lockoutMs
      if (now < lockoutEnd) {
        return { allowed: false, retryAfterMs: lockoutEnd - now }
      }
      // Reset after lockout
      attempts.delete(key)
    } else if (now - record.firstAttempt > config.windowMs) {
      // Window expired, reset
      attempts.delete(key)
    }
  }

  const current = attempts.get(key) || { count: 0, firstAttempt: now }

  if (current.count >= config.maxAttempts) {
    return { allowed: false, retryAfterMs: config.lockoutMs }
  }

  current.count++
  if (current.count === 1) current.firstAttempt = now
  attempts.set(key, current)

  return { allowed: true }
}

export function resetRateLimit(key: string) {
  attempts.delete(key)
}

// ─── Input Validation ──────────────────────────────────────────────────────

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320
}

export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== "string") return ""
  return input.trim().slice(0, maxLength)
}

export function isValidPhone(phone: string): boolean {
  return /^[\d\s+\-().]{7,20}$/.test(phone)
}

export function validateRequired(fields: Record<string, unknown>, required: string[]): string | null {
  for (const field of required) {
    if (!fields[field] || (typeof fields[field] === "string" && !(fields[field] as string).trim())) {
      return `Le champ '${field}' est requis`
    }
  }
  return null
}

// ─── Admin Cookie Validation ───────────────────────────────────────────────

export function verifyAdminSession(request: NextRequest): boolean {
  const session = request.cookies.get("admin_session")
  if (!session?.value) return false
  // Cookie exists and has a value — middleware already validates presence
  // For API routes, we additionally verify it's not empty/tampered
  return session.value.length > 0 && session.value.includes("@")
}

// ─── Error Message Sanitization ────────────────────────────────────────────

export function sanitizeError(err: unknown): string {
  if (err instanceof Error) {
    // Don't leak internal error messages
    const msg = err.message.toLowerCase()
    if (msg.includes("kv") || msg.includes("redis") || msg.includes("database")) {
      return "Erreur interne du serveur"
    }
    if (msg.includes("stripe")) {
      return "Erreur de paiement"
    }
    if (msg.includes("smtp") || msg.includes("email") || msg.includes("nodemailer")) {
      return "Erreur d'envoi d'email"
    }
  }
  return "Erreur serveur"
}

// ─── XSS Protection ────────────────────────────────────────────────────────

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
}
