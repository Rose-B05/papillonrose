/**
 * Script de migration — Devis Décoration
 *
 * Usage :
 *   1. Assurez-vous que DATABASE_URL est dans .env.local (ou dans l'env Vercel)
 *   2. npx tsx scripts/migrate.ts
 *
 * Ce script lit le fichier SQL et l'exécute sur la base Postgres.
 * Il est conçu pour être exécuté manuellement, une seule fois.
 */
import { readFileSync } from "fs"
import { join } from "path"
import { sql } from "@vercel/postgres"

async function migrate() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL n'est pas définie. Ajoutez-la à votre .env.local ou exécutez depuis l'env Vercel.")
    process.exit(1)
  }

  const migrations = [
    "001_devis_decoration.sql",
    "002_type_document.sql",
  ]

  for (const file of migrations) {
    const sqlPath = join(process.cwd(), "scripts", "migrations", file)
    const raw = readFileSync(sqlPath, "utf-8")

    const statements = raw
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    console.log(`\n--- ${file} : ${statements.length} instruction(s) SQL ---`)

    for (const stmt of statements) {
      const lines = stmt.split("\n").filter((l) => !l.trim().startsWith("--"))
      const clean = lines.join("\n").trim()
      if (!clean) continue

      try {
        await sql.query(clean)
        console.log(`  ✓ OK`)
      } catch (err: any) {
        if (err.message?.includes("already exists")) {
          console.log(`  ⊘ Déjà existe — ignoré`)
        } else {
          console.error(`  ✗ Erreur :`, err.message)
          process.exit(1)
        }
      }
    }
  }

  console.log("\nMigration terminée avec succès.")

  // Vérification : lister les tables créées
  const { rows } = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('devis_decoration', 'lignes_devis_decoration', 'versements_decoration', 'rappels_devis_decoration')
    ORDER BY table_name
  `
  console.log("\nTables existantes dans la base :")
  for (const row of rows) {
    console.log(`  - ${row.table_name}`)
  }
}

migrate().catch((err) => {
  console.error("Migration échouée :", err)
  process.exit(1)
})
