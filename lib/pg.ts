/**
 * Postgres client — Devis Décoration feature.
 *
 * IMPORTANT: lib/db.ts already exists and uses @vercel/kv for the rest of the
 * application. This file provides a SEPARATE Postgres client via @vercel/postgres
 * exclusively for the devis_décoration tables.
 *
 * Usage:
 *   import { sql } from "@/lib/pg"
 *   const { rows } = await sql`SELECT * FROM devis_decoration`
 */
import { sql } from "@vercel/postgres"

export { sql }
