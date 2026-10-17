// scripts/cloudinary-fetch.mjs
// Récupère les URLs des images d'un dossier Cloudinary

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'TON_CLOUD';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

export async function listImages(folder) {
  // Si pas d'API key, fallback sur construction manuelle d'URL
  if (!API_KEY || !API_SECRET) {
    console.warn(`[cloudinary] API non configurée, fallback sur URLs standard pour "${folder}"`);
    return {};
  }

  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&prefix=${folder}/&max_results=100`;

  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  if (!res.ok) {
    console.error(`[cloudinary] Erreur ${res.status}: ${await res.text()}`);
    return {};
  }

  const data = await res.json();
  const images = {};

  for (const r of data.resources) {
    const filename = r.public_id.split('/').pop();
    const key = filename.replace(/\.[^.]+$/, '');
    images[key] = r.secure_url;
  }

  return images;
}
