import type { APIRoute } from 'astro';
import { buildPortfolioContext } from '../../lib/portfolio-context';
import * as downloadableFilesModule from '../../lib/downloadable-files';

export const prerender = false;

export interface ChatAttachment {
  label: string;
  url: string;
  filename: string;
  description?: string;
}

interface CachedReply {
  expiresAt: number;
  reply: string;
  attachment: ChatAttachment | null;
}

const REPLY_CACHE_TTL_MS = 10 * 60 * 1000;
const GEMINI_TIMEOUT_MS = 15000;
const MAX_CACHE_ENTRIES = 200;

const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
];

const replyCache = new Map<string, CachedReply>();

function resolveAttachment(message: string): ChatAttachment | null {
  const mod = downloadableFilesModule as {
    findDownloadableFile?: (q: string) => unknown;
    default?: { findDownloadableFile?: (q: string) => unknown };
  };

  const fn =
    typeof mod.findDownloadableFile === 'function'
      ? mod.findDownloadableFile
      : typeof mod.default?.findDownloadableFile === 'function'
        ? mod.default.findDownloadableFile
        : null;

  if (!fn) return null;

  try {
    const raw = fn(message);
    if (!raw || typeof raw !== 'object') return null;

    const item = raw as Record<string, unknown>;
    const url = typeof item.url === 'string' ? item.url.trim() : '';
    if (!url) return null;

    const label =
      typeof item.label === 'string' && item.label.trim()
        ? item.label.trim()
        : typeof item.title === 'string' && item.title.trim()
          ? item.title.trim()
          : 'Ressource';

    const filename =
      typeof item.filename === 'string' && item.filename.trim()
        ? item.filename.trim()
        : url.split('/').pop() || 'fichier';

    const description =
      typeof item.description === 'string' && item.description.trim()
        ? item.description.trim()
        : undefined;

    return { label, url, filename, description };
  } catch {
    return null;
  }
}

function detectUserLanguage(text: string): 'en' | 'fr' {
  const cleaned = text.toLowerCase().trim();
  const enWords =
    (
      cleaned.match(
        /\b(can|could|what|where|when|who|how|why|give|tell|show|about|project|projects|contact|email|phone|whatsapp|github|cv|resume|hello|hi|good|morning|evening|please|me|you|your|is|are|do|does)\b/g
      ) ?? []
    ).length;

  const frWords =
    (
      cleaned.match(
        /\b(bonjour|salut|bonsoir|qui|quoi|comment|pourquoi|donne|donner|parle|parler|montre|projet|projets|contact|mail|email|telephone|téléphone|whatsapp|cv|stage|stages|compétences|competences|je|tu|vous|est|sont|un|une|des|les)\b/g
      ) ?? []
    ).length;

  if (enWords > frWords) return 'en';
  if (frWords > enWords) return 'fr';

  return /[àâäéèêëîïôöùûüç]/.test(cleaned) ? 'fr' : 'en';
}

function getCachedReply(key: string): CachedReply | null {
  const hit = replyCache.get(key);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    replyCache.delete(key);
    return null;
  }
  return hit;
}

function setCachedReply(key: string, value: CachedReply): void {
  if (replyCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = replyCache.keys().next().value;
    if (oldestKey) replyCache.delete(oldestKey);
  }
  replyCache.set(key, value);
}

async function callGeminiWithFallback(
  apiKey: string,
  systemInstruction: string,
  userMessage: string
): Promise<{ ok: true; text: string } | { ok: false; lastStatus: number }> {
  let lastStatus = 502;

  for (const model of GEMINI_MODELS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1200,
          },
        }),
      });

      clearTimeout(timer);
      lastStatus = res.status;

      if (!res.ok) {
        if (res.status === 404 || res.status === 429 || res.status === 503 || res.status === 504) {
          continue;
        }
        return { ok: false, lastStatus: res.status };
      }

      const data = await res.json();
      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: { text?: string }) => p.text ?? '')
          .join('')
          .trim() ?? '';

      if (text) {
        return { ok: true, text };
      }
    } catch {
      clearTimeout(timer);
      lastStatus = 504;
    }
  }

  return { ok: false, lastStatus };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message vide.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const attachment = resolveAttachment(message);
    const cacheKey = message.toLowerCase().replace(/\s+/g, ' ');
    const cached = getCachedReply(cacheKey);

    if (cached) {
      return new Response(
        JSON.stringify({
          reply: cached.reply,
          attachment: attachment ?? cached.attachment,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Clé API Gemini manquante côté serveur.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const lang = detectUserLanguage(message);
    const portfolioContext = await buildPortfolioContext(message);

    const langDirective =
      lang === 'en'
        ? 'CRITICAL LANGUAGE RULE: The user is asking in English. Write 100% of your response in clear, natural English, including labels like Email, Phone / WhatsApp, LinkedIn, and GitHub.'
        : 'RÈGLE DE LANGUE IMPÉRATIVE : L’utilisateur pose sa question en français. Rédige 100 % de ta réponse en français.';

    const systemInstruction = `${langDirective}\n\n${portfolioContext}`;

    const result = await callGeminiWithFallback(apiKey, systemInstruction, message);

    if (!result.ok) {
      const fallbackMsg =
        lang === 'en'
          ? 'The AI service is temporarily busy. Please try again in a moment.'
          : "Le service IA est temporairement sollicité. Réessaie dans un instant.";

      return new Response(
        JSON.stringify({ reply: fallbackMsg, attachment }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    setCachedReply(cacheKey, {
      expiresAt: Date.now() + REPLY_CACHE_TTL_MS,
      reply: result.text,
      attachment,
    });

    return new Response(
      JSON.stringify({ reply: result.text, attachment }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};