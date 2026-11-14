
// scripts/generate-cloudinary-links.cjs
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dacd0lez',
  api_key: '544183877332966',
  api_secret: 'ytUz2X49PyHjsvsqtN8iQ0hfT4c',
});

const PROJECT_SLUG = 'issabel-telegram';
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'content', 'projects', 'cloudinary-images.ts');

async function fetchResources(resourceType) {
  try {
    const expression =
      `resource_type:${resourceType} AND (` +
      `filename:installation_* OR ` +
      `filename:configuration_* OR ` +
      `filename:interface_* OR ` +
      `filename:Reglage_Zoiper_* OR ` +
      `filename:Telegram_* OR ` +
      `filename:lab_* OR ` +
      `filename:architecture* OR ` +
      `filename:logo* OR ` +
      `filename:Zoiper_*` +
      `)`;

    const result = await cloudinary.search
      .expression(expression)
      .max_results(500)
      .execute();

    return result.resources;
  } catch (error) {
    console.error(`❌ Erreur (${resourceType}) :`, error.message);
    return [];
  }
}

function cleanKey(fileName) {
  return fileName
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateLinks() {
  console.log(`🔍 Recherche des ressources du projet "${PROJECT_SLUG}"...`);

  const images = await fetchResources('image');
  console.log(`  ✅ ${images.length} images trouvées.`);

  const videos = await fetchResources('video');
  console.log(`  ✅ ${videos.length} vidéos trouvées.`);

  const allResources = [...images, ...videos];

  if (allResources.length === 0) {
    console.error(`\n❌ AUCUNE RESSOURCE TROUVÉE.`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error(`❌ Le fichier ${OUTPUT_PATH} est introuvable.`);
    process.exit(1);
  }

  const existingContent = fs.readFileSync(OUTPUT_PATH, 'utf-8');

  const newProjectKeys = {};
  allResources.forEach((asset) => {
    const parts = asset.public_id.split('/');
    const fileName = parts[parts.length - 1];
    const key = cleanKey(fileName);
    newProjectKeys[key] = asset.secure_url;
  });

  console.log(`\n📦 ${Object.keys(newProjectKeys).length} clés prêtes.`);

  const startMarker = 'export const cloudinaryImages: Record<string, Record<string, string>> = {';
  const startIndex = existingContent.indexOf(startMarker);

  if (startIndex === -1) {
    console.error(`❌ Impossible de trouver le début de l'objet.`);
    process.exit(1);
  }

  const afterStart = startIndex + startMarker.length;

  // CORRECTION : on cherche "export function" au lieu d'un commentaire
  const functionIndex = existingContent.indexOf('export function getCloudinaryImage');
  if (functionIndex === -1) {
    console.error(`❌ Impossible de trouver la fonction getCloudinaryImage.`);
    process.exit(1);
  }

  const objectContent = existingContent.slice(afterStart, functionIndex).trim();
  const projectMarker = `'${PROJECT_SLUG}': {`;
  let updatedObjectContent;

  if (objectContent.includes(projectMarker)) {
    console.log(`🔄 Le projet existe déjà. Remplacement des clés...`);

    const projectStart = objectContent.indexOf(projectMarker);
    let projectEnd = projectStart + projectMarker.length;
    let braceCount = 1;

    while (braceCount > 0 && projectEnd < objectContent.length) {
      const char = objectContent[projectEnd];
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      projectEnd++;
    }

    const before = objectContent.slice(0, projectStart);
    const after = objectContent.slice(projectEnd);

    let newBlock = `${projectMarker}\n`;
    Object.entries(newProjectKeys)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, url]) => {
        newBlock += `    '${key}': '${url}',\n`;
      });
    newBlock += `  },`;

    updatedObjectContent = before + newBlock + after;
  } else {
    console.log(`➕ Ajout du projet à la fin.`);

    const cleaned = objectContent.replace(/,\s*$/, '');

    let newBlock = `${cleaned},\n  '${PROJECT_SLUG}': {\n`;
    Object.entries(newProjectKeys)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, url]) => {
        newBlock += `    '${key}': '${url}',\n`;
      });
    newBlock += `  },`;

    updatedObjectContent = newBlock;
  }

  const newContent =
    existingContent.slice(0, afterStart) +
    '\n' +
    updatedObjectContent +
    '\n' +
    existingContent.slice(functionIndex);

  const backupPath = OUTPUT_PATH + '.backup-' + Date.now();
  fs.copyFileSync(OUTPUT_PATH, backupPath);
  console.log(`💾 Sauvegarde créée : ${backupPath}`);

  fs.writeFileSync(OUTPUT_PATH, newContent, 'utf-8');
  console.log(`\n✅ Fichier mis à jour : ${OUTPUT_PATH}`);
  console.log(`📊 ${Object.keys(newProjectKeys).length} clés ajoutées/mises à jour pour "${PROJECT_SLUG}".`);
}

generateLinks();