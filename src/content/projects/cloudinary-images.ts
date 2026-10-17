// src/content/projects/cloudinary-images.ts
// URLs Cloudinary centralisées par projet

export const cloudinaryImages: Record<string, Record<string, string>> = {
  'openclaw-assistant': {
    logo: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217451/logo_openclaw.png',
    dashboard: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217448/dashboard.png',
    telegram:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217454/telegram_conversation.png',
    telegram_bot_init:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217448/telegram_bot_initialisation.png',
    logs: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217461/logs.png',
    logs2: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217460/logs2.png',
    whatsapp:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217457/whatsapp_conversation.jpg',
    whatsapp_config:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217455/whatsapp_configuration.png',
  },
};

/**
 * Récupère une URL Cloudinary
 * @param projectName Nom du projet (slug, ex: 'openclaw-assistant')
 * @param imageName Nom logique de l'image (ex: 'logo')
 * @returns URL Cloudinary ou fallback local
 */
export function getCloudinaryImage(projectName: string, imageName: string): string {
  const url = cloudinaryImages[projectName]?.[imageName];
  if (url) return url;
  // Fallback local
  return `/images/projects/${projectName}/${imageName}.png`;
}
