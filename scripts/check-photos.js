const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'data', 'produits.ts'), 'utf8');

// Parse products block by block
const products = [];
const blockRegex = /\{[\s\S]*?id:\s*(\d+)[\s\S]*?nom:\s*"([^"]*)"[\s\S]*?categorie:\s*"([^"]*)"[\s\S]*?image:\s*"([^"]*)"[\s\S]*?\}/g;

let match;
while ((match = blockRegex.exec(content)) !== null) {
  products.push({
    id: parseInt(match[1]),
    nom: match[2],
    categorie: match[3],
    image: match[4],
  });
}

const publicDir = path.join(__dirname, '..', 'public');
const missing = [];

for (const p of products) {
  const imgPath = path.join(publicDir, p.image);
  const exists = fs.existsSync(imgPath);
  const isPlaceholder = p.image.includes('placeholder');

  if (!exists || isPlaceholder) {
    const status = isPlaceholder ? 'Placeholder' : 'Fichier manquant';
    missing.push({ ...p, status });
  }
}

missing.sort((a, b) => a.categorie.localeCompare(b.categorie) || a.id - b.id);

// Console table
console.log('=== PRODUITS SANS VRAIE PHOTO ===');
console.log('Total produits dans la base : ' + products.length);
console.log('Produits sans photo reelle  : ' + missing.length);
console.log('');

const tableData = missing.map(p => ({
  ID: 'PROD' + String(p.id).padStart(3, '0'),
  Nom: p.nom,
  Categorie: p.categorie,
  Image: p.image,
  Status: p.status,
}));

console.table(tableData);

// CSV export
const reportsDir = path.join(__dirname, '..', 'reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const csvLines = ['ID;Nom;Categorie;Image;Status'];
for (const p of missing) {
  const id = 'PROD' + String(p.id).padStart(3, '0');
  const nom = p.nom.replace(/;/g, ',');
  const cat = p.categorie.replace(/;/g, ',');
  csvLines.push(`${id};${nom};${cat};${p.image};${p.status}`);
}

fs.writeFileSync(path.join(reportsDir, 'produits-sans-photo.csv'), csvLines.join('\n'), 'utf8');
console.log('CSV exporte dans reports/produits-sans-photo.csv');
