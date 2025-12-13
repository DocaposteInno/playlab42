/**
 * Module de fetch des métadonnées Open Graph
 * Récupère og:title, og:description, og:image et favicon
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const CACHE_FILE = join(ROOT, 'data', 'bookmarks-cache.json');

// Configuration
const CONFIG = {
  timeout: 5000,      // 5 secondes
  cacheDays: 7,       // Validité du cache
  userAgent: 'PlayLab42-Bot/1.0 (+https://playlab42.example.com)'
};

/**
 * Charge le cache depuis le disque
 */
export function loadCache() {
  if (!existsSync(CACHE_FILE)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'));
  } catch {
    return {};
  }
}

/**
 * Sauvegarde le cache sur le disque
 */
export function saveCache(cache) {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Vérifie si une entrée de cache est encore valide
 */
function isCacheValid(entry) {
  if (!entry?.fetchedAt) return false;
  const fetchedAt = new Date(entry.fetchedAt);
  const now = new Date();
  const diffDays = (now - fetchedAt) / (1000 * 60 * 60 * 24);
  return diffDays < CONFIG.cacheDays;
}

/**
 * Extrait les balises meta OG d'un HTML
 */
function extractOGTags(html) {
  const meta = {};

  // og:title
  const titleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
  if (titleMatch) meta.ogTitle = decodeHTMLEntities(titleMatch[1]);

  // og:description
  const descMatch = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);
  if (descMatch) meta.ogDescription = decodeHTMLEntities(descMatch[1]);

  // og:image
  const imgMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (imgMatch) meta.ogImage = imgMatch[1];

  // og:site_name
  const siteMatch = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i);
  if (siteMatch) meta.ogSiteName = decodeHTMLEntities(siteMatch[1]);

  // Fallback: title standard
  if (!meta.ogTitle) {
    const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTag) meta.ogTitle = decodeHTMLEntities(titleTag[1]);
  }

  // Fallback: meta description
  if (!meta.ogDescription) {
    const metaDesc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
    if (metaDesc) meta.ogDescription = decodeHTMLEntities(metaDesc[1]);
  }

  return meta;
}

/**
 * Décode les entités HTML
 */
function decodeHTMLEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

/**
 * Construit l'URL du favicon
 */
function buildFaviconUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.host}/favicon.ico`;
  } catch {
    return null;
  }
}

/**
 * Fetch les métadonnées OG d'une URL
 * @param {string} url - URL à analyser
 * @param {object} cache - Cache des métadonnées
 * @returns {Promise<{meta: object|null, fromCache: boolean}>}
 */
export async function fetchOGMetadata(url, cache) {
  // Vérifier le cache
  if (cache[url] && isCacheValid(cache[url])) {
    return { meta: cache[url], fromCache: true };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': CONFIG.userAgent,
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
      },
      redirect: 'follow'
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`  ⚠️  ${url}: HTTP ${response.status}`);
      return { meta: null, fromCache: false };
    }

    const html = await response.text();
    const meta = extractOGTags(html);

    // Ajouter favicon
    meta.favicon = buildFaviconUrl(url);

    // Ajouter timestamp
    meta.fetchedAt = new Date().toISOString();

    // Mettre en cache
    cache[url] = meta;

    const hasOG = meta.ogTitle || meta.ogDescription || meta.ogImage;
    console.log(`  ${hasOG ? '✓' : '○'} ${new URL(url).hostname}`);

    return { meta, fromCache: false };

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log(`  ⏱️  ${url}: timeout`);
    } else {
      console.log(`  ❌ ${url}: ${err.message}`);
    }
    return { meta: null, fromCache: false };
  }
}
