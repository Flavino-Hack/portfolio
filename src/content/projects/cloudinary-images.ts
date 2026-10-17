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
  'vpn-personnel': {
    logo: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217568/logo.png',
    architecture: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217592/architecture.png',
    connexion1:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217540/connexion_telephone1.jpg',
    connexion2:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217537/connexion_telephone2.jpg',
    config_routeur1:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217531/config_routeur1.png',
    config_routeur2:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217533/config_routeur2.png',
    config_routeur3:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217538/config_routeur3.png',
    config_routeur4:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217531/config_routeur4.png',
    config_routeur5:
      'https://res.cloudinary.com/dacd0lez/image/upload/v1792217534/config_routeur5.png',
    log1: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217541/log1.png',
    log2: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217543/log2.png',
  },
  'agent-zero': {
    logo: 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217437/20.jpg',
    '1': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217419/1.png',
    '2': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217440/2.png',
    '3': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217437/3.png',
    '4': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217440/4.png',
    '5': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217423/5.png',
    '6': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217423/6.png',
    '7': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217427/7.png',
    '8': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217432/8.png',
    '9': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217432/9.png',
    '10': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217419/10.png',
    '11': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217421/11.png',
    '12': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217426/12.png',
    '13': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217429/13.png',
    '14': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217434/14.png',
    '15': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217428/15.png',
    '16': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217438/16.png',
    '17': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217432/17.png',
    '18': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217441/18.png',
    '19': 'https://res.cloudinary.com/dacd0lez/image/upload/v1792217431/19.png',
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