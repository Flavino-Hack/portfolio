

// scripts/generate-cloudinary-links.cjs
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// --- CONFIGURATION ---
cloudinary.config({
  cloud_name: 'dacd0lez',
  api_key: '544183877332966',
  api_secret: 'ytUz2X49PyHjsvsqtN8iQ0hfT4c',
});

const FOLDER_NAME = 'PBX';

// Fonction utilitaire pour récupérer un type de ressource
async function fetchResources(resourceType) {
  try {
    const result = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      prefix: FOLDER_NAME + '/',
      max_results: 500,
    });
    return result.resources;
  } catch (error) {
    console.error(`❌ Erreur lors de la récupération des ${resourceType}s :`, error.message);
    return [];
  }
}

async function generateLinks() {
  try {
    console.log(`🔍 Récupération des ressources du dossier "${FOLDER_NAME}"...`);

    // 1. Récupérer les images
    console.log('  → Chargement des images...');
    const images = await fetchResources('image');
    console.log(`    ✅ ${images.length} images trouvées.`);

    // 2. Récupérer les vidéos
    console.log('  → Chargement des vidéos...');
    const videos = await fetchResources('video');
    console.log(`    ✅ ${videos.length} vidéos trouvées.`);

    // 3. Fusionner
    const allResources = [...images, ...videos];

    if (allResources.length === 0) {
      console.warn(`⚠️  Aucune ressource trouvée dans le dossier "${FOLDER_NAME}".`);
      console.warn(`   Vérifie que le nom du dossier est correct et qu'il contient des fichiers.`);
      return;
    }

    // 4. Organiser les données
    const organized = {};
    allResources.forEach((asset) => {
      const parts = asset.public_id.split('/');
      const fileName = parts[parts.length - 1]; // ex: "installation_boot_menu_1"
      organized[fileName] = {
        url: asset.secure_url,
        format: asset.format,
        type: asset.resource_type,
      };
    });

    // 5. Générer le fichier TypeScript
    let tsContent = `// Ce fichier est généré automatiquement. Ne pas modifier à la main.\n`;
    tsContent += `// Dernière génération : ${new Date().toISOString()}\n\n`;
    tsContent += `export const cloudinaryImages = {\n`;

    Object.keys(organized)
      .sort()
      .forEach((key) => {
        tsContent += `  '${key}': '${organized[key].url}',\n`;
      });

    tsContent += `};\n\n`;
    tsContent += `/**\n`;
    tsContent += ` * Récupère l'URL d'une image Cloudinary par son nom.\n`;
    tsContent += ` * @param projectId - Identifiant du projet (non utilisé dans cette version plate)\n`;
    tsContent += ` * @param key - Nom du fichier sans extension (ex: 'architecture')\n`;
    tsContent += ` */\n`;
    tsContent += `export function getCloudinaryImage(projectId: string, key: string): string | undefined {\n`;
    tsContent += `  return (cloudinaryImages as Record<string, string>)[key];\n`;
    tsContent += `}\n`;

    // 6. Écrire le fichier
    const outputPath = path.join(__dirname, '..', 'src', 'content', 'projects', 'cloudinary-images.ts');
    fs.writeFileSync(outputPath, tsContent, 'utf-8');
    console.log(`\n✅ Fichier généré : ${outputPath}`);
    console.log(`📊 ${Object.keys(organized).length} clés créées (${images.length} images + ${videos.length} vidéos).`);
  } catch (error) {
    console.error('❌ Erreur globale :', error);
  }
}

generateLinks();