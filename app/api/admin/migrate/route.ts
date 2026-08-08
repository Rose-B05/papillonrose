/**
 * POST /api/admin/migrate
 *
 * Exécute la migration SQL 001_devis_decoration sur la base Postgres.
 * Protégé par auth admin. À appeler une seule fois après déploiement.
 *
 * Usage :
 *   curl -X POST https://site.vercel.app/api/admin/migrate \
 *     --cookie "admin_session=<token>"
 */
import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { readFileSync } from "fs"
import { join } from "path"

export const runtime = "nodejs"

const MIGRATION_SQL = readFileSync(
  join(process.cwd(), "scripts", "migrations", "001_devis_decoration.sql"),
  "utf-8"
)

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL non configurée" }, { status: 500 })
  }

  try {
    const { sql } = await import("@vercel/postgres")

    const statements = MIGRATION_SQL
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    const results: string[] = []

    for (const stmt of statements) {
      const lines = stmt.split("\n").filter((l) => !l.trim().startsWith("--"))
      const clean = lines.join("\n").trim()
      if (!clean) continue

      try {
        await sql.query(clean)
        results.push("✓ OK")
      } catch (err: any) {
        if (err.message?.includes("already exists")) {
          results.push("⊘ Déjà existe — ignoré")
        } else {
          results.push(`✗ Erreur : ${err.message}`)
        }
      }
    }

    // Vérification
    const { rows } = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('devis_decoration', 'lignes_devis_decoration', 'versements_decoration', 'rappels_devis_decoration')
      ORDER BY table_name
    `

    return NextResponse.json({
      ok: true,
      executed: results.length,
      results,
      tables: rows.map((r: any) => r.table_name),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
