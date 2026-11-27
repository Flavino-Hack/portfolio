import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dacd0lez',
  api_key: process.env.CLOUDINARY_API_KEY || '544183877332966',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'ytUz2X49PyHjsvsqtN8iQ0hfT4c',
});

const CTR_DIR = 'D:\\Video\\Stage CTR_KPL';
const CNMO_DIR = 'D:\\Video\\Stage CNMO';
const OUTPUT_TS = path.join(__dirname, '..', 'src', 'content', 'stages', 'cloudinary-stages.ts');

function getLocalFiles(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath)
    .filter((f) => /\.(jpe?g|png|webp|mp4|mov|webm)$/i.test(f))
    .map((f) => ({
      fileName: f,
      baseName: path.parse(f).name,
    }));
}

/**
 * Extrait une signature canonique :
 * ex. "WhatsApp Image 2026-11-04 at 20.33.55 (3)" -> "image|2026-11-04|20-33-55|3"
 * ex. "WhatsApp_Image_2026-11-04_at_20.33.55_3_vmj7zq" -> "image|2026-11-04|20-33-55|3"
 */
function extractWhatsAppSignature(name) {
  const match = name.match(
    /whatsapp[_\s]+(image|video)[_\s]+(\d{4}-\d{2}-\d{2})[_\s]+at[_\s]+(\d{2})[.:](\d{2})[.:](\d{2})(?:[_\s]*\(?(\d+)\)?)?/i
  );
  if (!match) return null;

  const [, kind, date, hh, mm, ss, index] = match;
  const idxPart = index ? `|${Number(index)}` : '|0';
  return `${kind.toLowerCase()}|${date}|${hh}-${mm}-${ss}${idxPart}`;
}

function slugifyKey(baseName) {
  return baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchAllAssets(resourceType) {
  let resources = [];
  let nextCursor = undefined;

  do {
    const res = await cloudinary.api.resources({
      resource_type: resourceType,
      type: 'upload',
      max_results: 500,
      next_cursor: nextCursor,
    });
    resources = resources.concat(res.resources || []);
    nextCursor = res.next_cursor;
  } while (nextCursor);

  return resources;
}

function matchStageAssets(allAssets, localFiles) {
  // Indexe les assets Cloudinary par signature WhatsApp (et garde le premier match)
  const assetBySignature = new Map();

  for (const asset of allAssets) {
    const publicId = asset.public_id || '';
    const lastPart = publicId.split('/').pop() || '';
    const sig = extractWhatsAppSignature(lastPart);
    if (sig && !assetBySignature.has(sig)) {
      assetBySignature.set(sig, asset);
    }
  }

  const matched = [];
  const missing = [];
  const seenKeys = new Set();

  for (const local of localFiles) {
    const sig = extractWhatsAppSignature(local.baseName);
    const asset = sig ? assetBySignature.get(sig) : null;

    if (!asset) {
      missing.push(local.fileName);
      continue;
    }

    let key = slugifyKey(local.baseName);
    if (seenKeys.has(key)) {
      let counter = 2;
      while (seenKeys.has(`${key}-${counter}`)) counter++;
      key = `${key}-${counter}`;
    }
    seenKeys.add(key);

    matched.push({
      key,
      title: local.baseName,
      url: asset.secure_url,
      resourceType: asset.resource_type,
    });
  }

  return { matched, missing };
}

async function run() {
  console.log('🔍 Récupération des images et vidéos depuis Cloudinary...');
  const [images, videos] = await Promise.all([
    fetchAllAssets('image'),
    fetchAllAssets('video'),
  ]);
  const allAssets = [...images, ...videos];

  const ctrLocal = getLocalFiles(CTR_DIR);
  const cnmoLocal = getLocalFiles(CNMO_DIR);

  const ctrResult = matchStageAssets(allAssets, ctrLocal);
  const cnmoResult = matchStageAssets(allAssets, cnmoLocal);

  fs.mkdirSync(path.dirname(OUTPUT_TS), { recursive: true });

  const tsContent = `// Généré automatiquement par scripts/extract-stage-media.mjs
export interface StageCloudinaryMedia {
  key: string;
  title: string;
  url: string;
  resourceType: 'image' | 'video';
}

export const cloudinaryStageMedia: {
  ctr: StageCloudinaryMedia[];
  cnmo: StageCloudinaryMedia[];
} = {
  ctr: ${JSON.stringify(ctrResult.matched, null, 2)},
  cnmo: ${JSON.stringify(cnmoResult.matched, null, 2)},
};

export function getStageImages(stage: 'ctr' | 'cnmo'): StageCloudinaryMedia[] {
  return cloudinaryStageMedia[stage].filter((item) => item.resourceType === 'image');
}

export function getStageVideos(stage: 'ctr' | 'cnmo'): StageCloudinaryMedia[] {
  return cloudinaryStageMedia[stage].filter((item) => item.resourceType === 'video');
}
`;

  fs.writeFileSync(OUTPUT_TS, tsContent, 'utf-8');

  console.log(`✅ Fichier généré : ${OUTPUT_TS}`);
  console.log(`   - CTR  : ${ctrResult.matched.length} / ${ctrLocal.length} trouvés (${ctrResult.missing.length} manquants)`);
  console.log(`   - CNMO : ${cnmoResult.matched.length} / ${cnmoLocal.length} trouvés (${cnmoResult.missing.length} manquants)`);

  if (ctrResult.missing.length > 0) {
    console.log('   ⚠️ Manquants CTR :', ctrResult.missing);
  }
  if (cnmoResult.missing.length > 0) {
    console.log('   ⚠️ Manquants CNMO :', cnmoResult.missing);
  }
}

run().catch((err) => {
  console.error('❌ Erreur :', err);
});