const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dacd0lez',
  api_key: '544183877332966',
  api_secret: 'ytUz2X49PyHjsvsqtN8iQ0hfT4c',
});

// Les noms de tes fichiers locaux (sans extension)
const TARGET_FILES = [
  'architecture', 'cd_project_acces_dossier_racine_travail', 'fichier_crypté_password_faible',
  'fichier_crypté_password_moyen_fort', 'hash_file7z', 'htop_verification_processeur_utilisé_test',
  'installation_outilis_perl', 'installation_package_john', 'installation_perl_exxtraction_hash_file7z',
  'installation_rockyou_github', 'logo', 'recuperation_hash_faible_fort_moyen',
  'script_verifiant_si_mot_de_passe_est_exposé',
  'sudo apt install -y git build-essential libssl-dev zlib1g-dev yasm pkg-config libgmp-dev libpcap-dev libbz2-dev_installation_depackages_.pdev_cryptong',
  'test_echouer_file_format7_z', 'utilisation_john_rockyou_hacker_password',
  'utilisation_john_rockyou_hacker_password_fort', 'verification_john_installer_succes',
  'verification_password_faible_moyen_fort_via_script', 'verification_si_john_installer',
  'verification_si_john_installer_resultat_non', 'video_demo'
];

// Traduction des noms de fichiers vers les clés de ton code Astro
const MAPPING = {
  'logo': 'logo', 'architecture': 'architecture',
  'cd_project_acces_dossier_racine_travail': 'cd-project',
  'fichier_crypté_password_faible': 'zip-weak',
  'fichier_crypté_password_moyen_fort': 'zip-medium-strong',
  'hash_file7z': 'hash-7z', 'htop_verification_processeur_utilisé_test': 'htop-cpu',
  'installation_outilis_perl': 'perl-install', 'installation_package_john': 'john-install',
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
  'video_demo': 'video-demo'
};

async function getLinks() {
  try {
    const images = await cloudinary.api.resources({ resource_type: 'image', type: 'upload', max_results: 500 });
    const videos = await cloudinary.api.resources({ resource_type: 'video', type: 'upload', max_results: 500 });
    const all = [...(images.resources || []), ...(videos.resources || [])];
    
    let result = "  'password-hack': {\n";
    let foundCount = 0;

    all.forEach(asset => {
      const fileName = asset.public_id.split('/').pop();
      // On cherche si le nom Cloudinary commence par un de nos fichiers
      const match = TARGET_FILES.find(target => fileName.startsWith(target));
      
      if (match) {
        const cleanKey = MAPPING[match] || match.replace(/[^a-zA-Z0-9]/g, '-');
        result += `    '${cleanKey}': '${asset.secure_url}',\n`;
        foundCount++;
      }
    });

    result += "  },\n";

    console.log(`\n✅ ${foundCount} fichiers trouvés !`);
    console.log("👇 COPIE TOUT CE BLOC ET COLLE-LE DANS TON FICHIER cloudinary-images.ts (juste avant l'accolade finale) :\n");
    console.log(result);

  } catch (error) {
    console.error("❌ Erreur :", error);
  }
}

getLinks();