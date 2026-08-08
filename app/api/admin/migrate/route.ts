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

const MIGRATION_001 = readFileSync(
  join(process.cwd(), "scripts", "migrations", "001_devis_decoration.sql"),
  "utf-8"
)

const MIGRATION_002 = readFileSync(
  join(process.cwd(), "scripts", "migrations", "002_type_document.sql"),
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

    const allResults: Record<string, string[]> = {}
    const migrations = [
      { name: "001_devis_decoration", raw: MIGRATION_001 },
      { name: "002_type_document", raw: MIGRATION_002 },
    ]

    for (const migration of migrations) {
      const statements = migration.raw
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

      allResults[migration.name] = results
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
      migrations: allResults,
      tables: rows.map((r: any) => r.table_name),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
