const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dacd0lez',
  api_key: '544183877332966',
  api_secret: 'ytUz2X49PyHjsvsqtN8iQ0hfT4c',
});

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'content', 'projects', 'cloudinary-images.ts');

// Liste exacte des noms de base de tes fichiers (sans l'extension ni le hash Cloudinary)
const TARGET_FILES = [
  'architecture',
  'dashboard_creation_vps_administrateur',
  'demo1_monirtoring_vps',
  'demo2_creation_jeu_vps',
  'docker_build_vps_base',
  'frontend_backend_traefick_sur_docker',
  'interface_web_creation_vps',
  'interface_web_minicloudprovier',
  'logo',
  'log_installation',
  'resultat_docker_compose_build_no_cache',
  'resultat_docker_compose_up_build',
  'resultat_docker_compose_up_build_2',
  'retentative_docker_compose_up',
  'terminal_vps',
  'vps_creer_2gbram_10gbssd_3cpu'
];

async function fetchTargetResources() {
  try {
    console.log('🔍 Recherche des images...');
    const imagesResult = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      max_results: 500,
    });

    console.log('🔍 Recherche des vidéos...');
    const videosResult = await cloudinary.api.resources({
      resource_type: 'video',
      type: 'upload',
      max_results: 500,
    });

    const allResources = [...(imagesResult.resources || []), ...(videosResult.resources || [])];
    const matchedResources = [];
    
    allResources.forEach(asset => {
      const parts = asset.public_id.split('/');
      const fileNameWithHash = parts[parts.length - 1]; 
      
      // On cherche si le nom de fichier commence par l'un de nos cibles
      const match = TARGET_FILES.find(target => fileNameWithHash.startsWith(target));
      
      if (match) {
        matchedResources.push({
          targetName: match,
          url: asset.secure_url,
          type: asset.resource_type
        });
      }
    });

    return matchedResources;
  } catch (error) {
    console.error('❌ Erreur détaillée lors de la récupération:', error);
    return [];
  }
}

// Mapping des noms de fichiers vers les clés propres attendues par Astro
function getCleanKey(targetName) {
  const mapping = {
    'logo': 'logo',
    'architecture': 'architecture',
    'interface_web_minicloudprovier': 'dashboard-ui',
    'terminal_vps': 'terminal-web',
    'vps_creer_2gbram_10gbssd_3cpu': 'monitoring-script',
    'dashboard_creation_vps_administrateur': 'dashboard-admin',
    'docker_build_vps_base': 'docker-build',
    'frontend_backend_traefick_sur_docker': 'stack-technique',
    'interface_web_creation_vps': 'interface-creation',
    'log_installation': 'log-installation',
    'resultat_docker_compose_build_no_cache': 'resultat-build',
    'resultat_docker_compose_up_build': 'resultat-up-1',
    'resultat_docker_compose_up_build_2': 'resultat-up-2',
    'retentative_docker_compose_up': 'resultat-up-retry',
    'demo1_monirtoring_vps': 'video-demo-monitoring',
    'demo2_creation_jeu_vps': 'video-demo-creation'
  };
  return mapping[targetName] || targetName.replace(/_/g, '-');
}

async function generateLinks() {
  const resources = await fetchTargetResources();

  if (resources.length === 0) {
    console.warn('⚠️ Aucun fichier cible trouvé. Vérifie que les noms correspondent bien à ceux dans Cloudinary.');
    return;
  }

  console.log(`✅ ${resources.length} fichiers trouvés et mappés avec succès !`);

  const organized = {};
  resources.forEach(res => {
    const key = getCleanKey(res.targetName);
    organized[key] = res.url;
  });

  if (!fs.existsSync(OUTPUT_PATH)) {
    console.error(`❌ Le fichier ${OUTPUT_PATH} est introuvable.`);
    return;
  }

  const existingContent = fs.readFileSync(OUTPUT_PATH, 'utf-8');
  const startMarker = 'export const cloudinaryImages: Record<string, Record<string, string>> = {';
  const startIndex = existingContent.indexOf(startMarker);
  const functionIndex = existingContent.indexOf('export function getCloudinaryImage');

  if (startIndex === -1 || functionIndex === -1) {
    console.error(`❌ Structure du fichier non reconnue.`);
    return;
  }

  const objectContent = existingContent.slice(startIndex + startMarker.length, functionIndex).trim();
  const projectMarker = "'mini-cloud-provider': {";

  let updatedObjectContent;

  if (objectContent.includes(projectMarker)) {
    console.log('🔄 Mise à jour du bloc existant...');
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
    Object.entries(organized)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, url]) => {
        newBlock += `    '${key}': '${url}',\n`;
      });
    newBlock += `  },`;

    updatedObjectContent = before + newBlock + after;
  } else {
    console.log('➕ Ajout du nouveau bloc...');
    const cleaned = objectContent.replace(/,\s*$/, '');
    let newBlock = `${cleaned},\n  'mini-cloud-provider': {\n`;
    Object.entries(organized)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, url]) => {
        newBlock += `    '${key}': '${url}',\n`;
      });
    newBlock += `  },`;
    updatedObjectContent = newBlock;
  }

  const newContent =
    existingContent.slice(0, startIndex + startMarker.length) +
    '\n' +
    updatedObjectContent +
    '\n' +
    existingContent.slice(functionIndex);

  const backupPath = OUTPUT_PATH + '.backup-' + Date.now();
  fs.copyFileSync(OUTPUT_PATH, backupPath);
  console.log(`💾 Sauvegarde créée : ${backupPath}`);

  fs.writeFileSync(OUTPUT_PATH, newContent, 'utf-8');
  console.log(`\n🎉 SUCCÈS ! Fichier mis à jour avec ${Object.keys(organized).length} liens.`);
}

generateLinks();