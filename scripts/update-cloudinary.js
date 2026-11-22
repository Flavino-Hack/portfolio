const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'dacd0lez',
  api_key: '544183877332966',
  api_secret: 'ytUz2X49PyHjsvsqtN8iQ0hfT4c', // ⚠️ Change ça et ne le commit pas !
});

const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'content', 'projects', 'cloudinary-images.ts');

// Liste des noms de tes fichiers locaux (sans extension)
const TARGET_FILES = [
  'architecture',
  'cd_project_acces_dossier_racine_travail',
  'fichier_crypté_password_faible',
  'fichier_crypté_password_moyen_fort',
  'hash_file7z',
  'htop_verification_processeur_utilisé_test',
  'installation_outilis_perl',
  'installation_package_john',
  'installation_perl_exxtraction_hash_file7z',
  'installation_rockyou_github',
  'logo',
  'recuperation_hash_faible_fort_moyen',
  'script_verifiant_si_mot_de_passe_est_exposé',
  'sudo apt install -y git build-essential libssl-dev zlib1g-dev yasm pkg-config libgmp-dev libpcap-dev libbz2-dev_installation_depackages_.pdev_cryptong',
  'test_echouer_file_format7_z',
  'utilisation_john_rockyou_hacker_password',
  'utilisation_john_rockyou_hacker_password_fort',
  'verification_john_installer_succes',
  'verification_password_faible_moyen_fort_via_script',
  'verification_si_john_installer',
  'verification_si_john_installer_resultat_non',
  'video_demo' // Ton fichier vidéo
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
    'cd_project_acces_dossier_racine_travail': 'cd-project',
    'fichier_crypté_password_faible': 'zip-weak',
    'fichier_crypté_password_moyen_fort': 'zip-medium-strong',
    'hash_file7z': 'hash-7z',
    'htop_verification_processeur_utilisé_test': 'htop-cpu',
    'installation_outilis_perl': 'perl-install',
    'installation_package_john': 'john-install',
    'installation_perl_exxtraction_hash_file7z': 'perl-7z-extraction',
    'installation_rockyou_github': 'rockyou-download',
    'recuperation_hash_faible_fort_moyen': 'hash-extraction',
    'script_verifiant_si_mot_de_passe_est_exposé': 'hibp-script',
    'sudo apt install -y git build-essential libssl-dev zlib1g-dev yasm pkg-config libgmp-dev libpcap-dev libbz2-dev_installation_depackages_.pdev_cryptong': 'john-compile-deps',
    'test_echouer_file_format7_z': '7z-slow',
    'utilisation_john_rockyou_hacker_password': 'john-rockyou',
    'utilisation_john_rockyou_hacker_password_fort': 'john-rules',
    'verification_john_installer_succes': 'john-verify-success',
    'verification_password_faible_moyen_fort_via_script': 'hibp-verify',
    'verification_si_john_installer': 'john-verify',
    'verification_si_john_installer_resultat_non': 'john-verify-fail',
    'video_demo': 'video-demo' // Clé pour la vidéo
  };
  return mapping[targetName] || targetName.replace(/[^a-zA-Z0-9]/g, '-');
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
    // Si c'est une vidéo, on l'ajoute directement
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
  const projectMarker = "'password-hack': {";

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
    let newBlock = `${cleaned},\n  'password-hack': {\n`;
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