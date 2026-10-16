import fr from './fr';
import en from './en';

export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export const defaultLang = 'fr' as const;

export type Lang = keyof typeof languages;

export function getLangFromUrl(url: URL): Lang {
  const [, , maybeLang] = url.pathname.split('/');
  if (maybeLang && maybeLang in languages) return maybeLang as Lang;
  return defaultLang;
}

const translations = { fr, en };

export function useTranslations(lang: Lang) {
  return translations[lang] ?? translations[defaultLang];
}
