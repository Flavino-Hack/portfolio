import { getCollection } from 'astro:content';
import * as frModule from '../i18n/fr';
import * as enModule from '../i18n/en';

interface ProjectCard {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  details: string;
  links: string[];
}

interface CachedBaseContext {
  expiresAt: number;
  projects: ProjectCard[];
  overviewText: string;
  profileNotes: string;
  contactNotes: string;
  repoLinksText: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_PROJECT_DETAILS_CHARS = 5000;
let baseContextCache: CachedBaseContext | null = null;

const projectPagesRaw = import.meta.glob('../pages/projects/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const enProjectPagesRaw = import.meta.glob('../pages/en/projects/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const sitePagesRaw = import.meta.glob('../pages/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const sectionsRaw = import.meta.glob('../components/sections/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const componentsRaw = import.meta.glob('../components/**/*.astro', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

const dataFilesRaw = import.meta.glob('../data/**/*.{ts,json}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function normalizeVoiceOrTypoQuery(message: string): string {
  return message
    .replace(/\btalkie[\s-]*bat\b/gi, 'ipbx issabel telephonie')
    .replace(/\beast\b/gi, 'esupex');
}

function extractUrlsFromText(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>`)}\]]+/g) ?? [];
  return Array.from(
    new Set(
      matches
        .map((u) => u.replace(/[.,;]+$/, ''))
        .filter((u) => !/w3\.org|schema\.org|astro\.build|tailwindcss\.com/i.test(u))
    )
  );
}

function extractPhonesAndContactsFromText(text: string): string[] {
  const found: string[] = [];

  const schemeMatches = text.match(/(?:tel:|mailto:)[^\s"'<>`)]+/gi) ?? [];
  found.push(...schemeMatches);

  const urlAndMailMatches =
    text.match(
      /(?:https?:\/\/(?:wa\.me|api\.whatsapp\.com|t\.me|linkedin\.com|www\.linkedin\.com|github\.com)[^\s"'<>`)\]]*|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
    ) ?? [];
  found.push(...urlAndMailMatches);

  const phoneMatches = text.match(/(?:\+\d{1,4}[\s.-]?)?(?:\d[\s.-]?){7,15}\d/g) ?? [];
  for (const p of phoneMatches) {
    const digitsOnly = p.replace(/\D/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
      found.push(p.replace(/\s+/g, ' ').trim());
    }
  }

  return Array.from(new Set(found.map((s) => s.trim()).filter(Boolean)));
}

function extractFromAstroPages(): ProjectCard[] {
  const entries = [
    ...Object.entries(projectPagesRaw),
    ...Object.entries(enProjectPagesRaw),
  ];

  const bySlug = new Map<string, ProjectCard>();

  for (const [filePath, raw] of entries) {
    const slug = (filePath.split('/').pop()?.replace(/\.astro$/i, '') ?? filePath).toLowerCase();
    const isEn = filePath.includes('/en/projects/') || filePath.includes('\\en\\projects\\');

    const withoutFrontmatter = raw.replace(/^---[\s\S]*?---/, '');
    const links = extractUrlsFromText(raw);

    const plainText = withoutFrontmatter
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{[^{}]{0,160}\}/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const h1Match = withoutFrontmatter.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const cleanH1 = h1Match?.[1]
      ? h1Match[1]
          .replace(/<[^>]+>/g, ' ')
          .replace(/\{[^{}]{0,100}\}/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      : '';

    const quotedTitleMatch = raw.match(
      /(?:projectTitle|pageTitle|title)\s*[:=]\s*(?:"([^"\n]{3,140})"|'([^'\n]{3,140})')/i
    );
    const quotedDescMatch = raw.match(
      /(?:description|subtitle|summary)\s*[:=]\s*(?:"([^"\n]{8,300})"|'([^'\n]{8,300})')/i
    );

    const extractedTitle =
      cleanH1 ||
      quotedTitleMatch?.[1]?.trim() ||
      quotedTitleMatch?.[2]?.trim() ||
      slug;

    const extractedDesc =
      quotedDescMatch?.[1]?.trim() ||
      quotedDescMatch?.[2]?.trim() ||
      plainText.slice(0, 240);

    const existing = bySlug.get(slug);
    if (!existing || !isEn) {
      const mergedDetails = existing
        ? `${existing.details}\n${plainText.slice(0, 2500)}`.trim().slice(0, MAX_PROJECT_DETAILS_CHARS)
        : plainText.slice(0, MAX_PROJECT_DETAILS_CHARS);

      bySlug.set(slug, {
        slug,
        title: existing && isEn ? existing.title : extractedTitle,
        description: existing && isEn ? existing.description : extractedDesc,
        tags: existing ? Array.from(new Set([...existing.tags])) : [],
        details: mergedDetails,
        links: Array.from(new Set([...(existing?.links ?? []), ...links])),
      });
    } else {
      existing.links = Array.from(new Set([...existing.links, ...links]));
      existing.details = `${existing.details} | EN: ${plainText.slice(0, 1500)}`.slice(
        0,
        MAX_PROJECT_DETAILS_CHARS
      );
    }
  }

  return Array.from(bySlug.values());
}

function collectContacts(
  input: unknown,
  contacts: string[] = [],
  keyHint = '',
  depth = 0
): string[] {
  if (depth > 8 || contacts.length >= 100 || input == null) return contacts;

  if (typeof input === 'string') {
    const clean = input.replace(/\s+/g, ' ').trim();
    const looksLikeContact =
      /[@]|https?:\/\/|github|gitlab|linkedin|telegram|whatsapp|wa\.me|mailto:|tel:/i.test(clean) ||
      /contact|email|mail|phone|tel|mobile|whatsapp|social|network|github|gitlab|linkedin|repo/i.test(
        keyHint
      ) ||
      extractPhonesAndContactsFromText(clean).length > 0;

    if (looksLikeContact && clean.length >= 3 && clean.length <= 280) {
      contacts.push(keyHint ? `${keyHint}: ${clean}` : clean);
    }
    return contacts;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      collectContacts(item, contacts, keyHint, depth + 1);
      if (contacts.length >= 100) break;
    }
    return contacts;
  }

  if (typeof input === 'object') {
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      const nextHint = keyHint ? `${keyHint}.${key}` : key;
      collectContacts(value, contacts, nextHint, depth + 1);
      if (contacts.length >= 100) break;
    }
  }

  return contacts;
}

function collectFacts(
  input: unknown,
  facts: string[] = [],
  depth = 0
): string[] {
  if (depth > 8 || facts.length >= 260 || input == null) return facts;

  if (typeof input === 'string') {
    const clean = input.replace(/\s+/g, ' ').trim();
    if (
      clean.length >= 4 &&
      clean.length <= 360 &&
      !/^[a-z0-9_-]+$/i.test(clean)
    ) {
      facts.push(clean);
    }
    return facts;
  }

  if (Array.isArray(input)) {
    for (const item of input) {
      collectFacts(item, facts, depth + 1);
      if (facts.length >= 260) break;
    }
    return facts;
  }

  if (typeof input === 'object') {
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (/^(seo|meta|class|style|icon|image|avatar|slug|aria)$/i.test(key)) {
        continue;
      }
      collectFacts(value, facts, depth + 1);
      if (facts.length >= 260) break;
    }
  }

  return facts;
}

async function getBaseContext(): Promise<CachedBaseContext> {
  const now = Date.now();
  if (baseContextCache && baseContextCache.expiresAt > now) {
    return baseContextCache;
  }

  const projectMap = new Map<string, ProjectCard>();

  for (const p of extractFromAstroPages()) {
    projectMap.set(p.slug, p);
  }

  try {
    const entries = await getCollection('projects');
    for (const entry of entries) {
      const slug = entry.id.replace(/\.mdx?$/i, '').toLowerCase();
      const data = entry.data as Record<string, unknown>;
      const title = typeof data.title === 'string' ? data.title : slug;
      const description = typeof data.description === 'string' ? data.description : '';
      const tags = Array.isArray(data.tags)
        ? data.tags.filter((t): t is string => typeof t === 'string').slice(0, 12)
        : [];
      const rawBody = typeof entry.body === 'string' ? entry.body : '';
      const bodyLinks = extractUrlsFromText(rawBody);
      const details = rawBody
        .replace(/[#*`>-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, MAX_PROJECT_DETAILS_CHARS);

      const prev = projectMap.get(slug);
      projectMap.set(slug, {
        slug,
        title: title || prev?.title || slug,
        description: description || prev?.description || '',
        tags: tags.length > 0 ? tags : prev?.tags ?? [],
        details: details || prev?.details || '',
        links: Array.from(new Set([...(prev?.links ?? []), ...bodyLinks])),
      });
    }
  } catch {
    // Ignore si collection absente ou vide
  }

  const projects = Array.from(projectMap.values());

  const overviewText =
    projects.length > 0
      ? projects
          .map((p) => {
            const stack = p.tags.length > 0 ? ` | Stack: ${p.tags.join(', ')}` : '';
            const desc = p.description ? ` — ${p.description}` : '';
            const linksInfo = p.links.length > 0 ? ` | Liens: ${p.links.join(', ')}` : '';
            return `- ${p.title} (${p.slug})${desc}${stack}${linksInfo}`;
          })
          .join('\n')
      : 'Aucun projet détecté.';

  const frData =
    (frModule as { default?: unknown; fr?: unknown }).fr ??
    (frModule as { default?: unknown }).default ??
    frModule;
  const enData =
    (enModule as { default?: unknown; en?: unknown }).en ??
    (enModule as { default?: unknown }).default ??
    enModule;

  const combinedFacts = Array.from(
    new Set([...collectFacts(frData).slice(0, 180), ...collectFacts(enData).slice(0, 80)])
  );

  const priorityContacts: string[] = [];
  for (const [filePath, raw] of Object.entries(sectionsRaw)) {
    if (/contact\.astro$/i.test(filePath)) {
      for (const item of extractPhonesAndContactsFromText(raw)) {
        priorityContacts.push(`Contact: ${item}`);
      }
      for (const url of extractUrlsFromText(raw)) {
        priorityContacts.push(`Contact lien: ${url}`);
      }
    }
  }

  const secondaryContacts = Array.from(
    new Set([...collectContacts(frData), ...collectContacts(enData)])
  );

  const allRepoLinks = new Set<string>();
  for (const p of projects) {
    for (const l of p.links) allRepoLinks.add(l);
  }

  const allSources = {
    ...sitePagesRaw,
    ...projectPagesRaw,
    ...componentsRaw,
    ...dataFilesRaw,
  };

  for (const [filePath, raw] of Object.entries(allSources)) {
    for (const url of extractUrlsFromText(raw)) {
      if (/github|gitlab|bitbucket|codeberg|huggingface/i.test(url)) {
        allRepoLinks.add(url);
      }
      if (
        /contact|footer|social|whatsapp|wa\.me|mailto|tel/i.test(filePath) ||
        /whatsapp|wa\.me|mailto|tel:/i.test(url)
      ) {
        secondaryContacts.push(`${filePath.split('/').pop()}: ${url}`);
      }
    }

    for (const item of extractPhonesAndContactsFromText(raw)) {
      secondaryContacts.push(`${filePath.split('/').pop()}: ${item}`);
    }
  }

  const uniqueContacts = Array.from(new Set([...priorityContacts, ...secondaryContacts])).slice(0, 60);

  const profileNotes =
    combinedFacts.length > 0
      ? `- ${combinedFacts.join('\n- ')}`
      : '- Profil développeur, réseaux et cybersécurité.';

  const contactNotes =
    uniqueContacts.length > 0
      ? `- ${uniqueContacts.join('\n- ')}`
      : '- Section Contact disponible sur le portfolio.';

  const repoLinksText =
    allRepoLinks.size > 0
      ? `- ${Array.from(allRepoLinks).join('\n- ')}`
      : '- Aucun lien Git/dépôt externe détecté dans les fichiers analysés.';

  baseContextCache = {
    expiresAt: now + CACHE_TTL_MS,
    projects,
    overviewText,
    profileNotes,
    contactNotes,
    repoLinksText,
  };

  return baseContextCache;
}

function matchRelevantProjects(message: string, projects: ProjectCard[]): ProjectCard[] {
  const q = message.toLowerCase();
  const stopWords = new Set([
    'les',
    'des',
    'une',
    'pour',
    'avec',
    'sur',
    'dans',
    'parle',
    'moi',
    'projet',
    'projets',
    'quel',
    'quels',
    'quelle',
    'quelles',
    'lien',
    'liens',
    'fichier',
    'fichiers',
  ]);

  const tokens = q
    .split(/[^a-zàâäéèêëîïôöùûüç0-9]+/i)
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  const cyberExpanded =
    /\b(cyber|cybersecurite|cybersécurité|securite|sécurité|crack|cracking|archive|defense|défense|vpn|pentest|hack|mot de passe|password)\b/i.test(
      q
    );

  return projects
    .map((p) => {
      let score = 0;
      const haystack = `${p.slug} ${p.title} ${p.description} ${p.tags.join(' ')} ${p.details} ${p.links.join(' ')}`.toLowerCase();
      const normalizedSlug = p.slug.replace(/[-_]+/g, ' ');

      if (p.slug.length >= 3 && (q.includes(p.slug) || q.includes(normalizedSlug))) {
        score += 12;
      }

      if (
        cyberExpanded &&
        /\b(cyber|securite|sécurité|crack|cracking|archive|defense|défense|vpn|openvpn|kali|password|hack)\b/i.test(
          haystack
        )
      ) {
        score += 8;
      }

      for (const t of tokens) {
        if (p.title.toLowerCase().includes(t) || p.tags.some((tag) => tag.toLowerCase().includes(t))) {
          score += 5;
        } else if (haystack.includes(t)) {
          score += 2;
        }
      }

      return { project: p, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.project);
}

export async function buildPortfolioContext(userMessage = ''): Promise<string> {
  const base = await getBaseContext();
  const normalizedMessage = userMessage ? normalizeVoiceOrTypoQuery(userMessage) : '';
  const matched = normalizedMessage ? matchRelevantProjects(normalizedMessage, base.projects) : [];

  const focusedBlock =
    matched.length > 0
      ? `\n=== FICHE DÉTAILLÉE (PROJETS PERTINENTS) ===\n${matched
          .map(
            (m) =>
              `• ${m.title} (${m.slug})\n  Résumé: ${m.description || 'Voir notes'}\n  Stack: ${m.tags.join(', ') || 'Voir détails'}\n  Liens détectés: ${m.links.join(', ') || 'Aucun lien explicite dans la page'}\n  Contenu: ${m.details || 'Aucun détail supplémentaire.'}`
          )
          .join('\n')}`
      : '';

  return `
Tu es l'assistant officiel du portfolio de fhkdev (Wendtoin Guy Flavien Kiéma).
Objectif : répondre avec clarté, fluidité et pertinence en t'appuyant sur les faits et indices ci-dessous.

RÈGLES :
1. Réponds de manière ciblée à la question posée : si l'utilisateur demande un projet, un contact, un numéro de téléphone, un numéro WhatsApp, un stage ou le CV, concentre-toi d'abord sur ce sujet. N'ajoute PAS les coordonnées (e-mail, téléphone, WhatsApp, LinkedIn) si l'utilisateur ne demande pas comment contacter ou joindre le développeur.
2. Quand un numéro de téléphone, un numéro WhatsApp, un lien wa.me, un e-mail ou un réseau social figure dans "CONTACTS, LIENS & RÉSEAUX DÉTECTÉS", affiche-le directement et clairement.
3. Synthétise et reformule clairement les projets techniques à partir des indices disponibles dans le contexte, sans répéter mot pour mot un texte pauvre.
4. Ne fabrique jamais d'URL, de numéro, de fichier ou de fait absent du contexte. Si un élément précis ne figure pas dans les données détectées, dis-le simplement et renvoie vers la section Contact.
5. OBLIGATOIRE — LANGUE : Réponds TOUJOURS dans la même langue que le dernier message de l'utilisateur. Si l'utilisateur écrit en anglais (ex. "How do...", "What is...", "Tell me about..."), rédige 100 % de ta réponse en anglais. S'il écrit en français, rédige en français.
6. Si un terme ressemble à une faute de frappe ou à une transcription vocale imprécise (ex. "talkie-BAT" ou "east" pour "ESUPEX"), vérifie d'abord les correspondances plausibles dans les données du profil/parcours avant de conclure qu'il n'existe rien, et évite de lister tous les projets du portfolio sauf si la question porte sur l'ensemble des projets.

=== TOUS LES PROJETS DU PORTFOLIO ===
${base.overviewText}
${focusedBlock}

=== LIENS GIT / DÉPÔTS DÉTECTÉS ===
${base.repoLinksText}

=== CONTACTS, LIENS & RÉSEAUX DÉTECTÉS ===
${base.contactNotes}

=== DONNÉES DU PORTFOLIO (COMPÉTENCES, PARCOURS, PROJETS, CONTACT) ===
${base.profileNotes}
`.trim();
}