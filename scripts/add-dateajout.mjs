import { readFileSync, writeFileSync } from "node:fs"

let content = readFileSync("data/produits.ts", "utf-8")

const beforeCount = (content.match(/dateAjout:/g) || []).length
console.log("dateAjout existants avant:", beforeCount)

const lines = content.split(/\r?\n/)
let added = 0

for (let i = 0; i < lines.length; i++) {
  // Match opening brace on its own line: "  {"
  if (!/^\s*\{\s*$/.test(lines[i])) continue
  // Check next line has "id: N"
  if (i + 1 >= lines.length || !/^\s*id:\s*\d+/.test(lines[i + 1])) continue

  // Find closing brace: a line that is exactly "  }," or "  }"
  for (let j = i + 2; j < lines.length; j++) {
    if (/^\s*\},?\s*$/.test(lines[j])) {
      // Check if dateAjout already exists in this product block
      const block = lines.slice(i, j + 1).join("\n")
      if (block.includes("dateAjout:")) break

      // Add dateAjout before the closing brace line
      lines.splice(j, 0, '    dateAjout: "2025-01-01",')
      added++
      break
    }
  }
}

writeFileSync("data/produits.ts", lines.join("\n"))
console.log("dateAjout ajouté à", added, "produits")

const after = readFileSync("data/produits.ts", "utf-8")
const afterCount = (after.match(/dateAjout:/g) || []).length
console.log("Total dateAjout dans le fichier:", afterCount)
