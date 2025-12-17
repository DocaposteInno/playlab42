/**
 * Hash Router - Module de navigation par hash URL
 * @see openspec/changes/add-hash-router/design.md
 *
 * Permet le deep linking et la navigation dans l'application :
 * - #/ → Catalogue (accueil)
 * - #/games/:id → Jeu spécifique
 * - #/tools/:id → Outil spécifique
 * - #/parcours/:epic → Parcours (premier slide)
 * - #/parcours/:epic/:slide → Slide spécifique
 * - #/settings → Paramètres
 */

/**
 * Définition des routes avec leurs patterns
 * :param = paramètre dynamique capturé
 */
const routes = [
  { pattern: '/', name: 'catalogue' },
  { pattern: '/games/:id', name: 'game' },
  { pattern: '/tools/:id', name: 'tool' },
  { pattern: '/parcours/:epic', name: 'parcours' },
  { pattern: '/parcours/:epic/:slide', name: 'slide' },
  { pattern: '/settings', name: 'settings' },
];

/** Handlers enregistrés par l'application */
let handlers = {};

/** Dernière route matchée (pour éviter les re-navigations) */
let lastRoute = null;

/**
 * Convertit un pattern en regex
 * Exemple: '/games/:id' → /^\/games\/([^/]+)$/
 *
 * @param {string} pattern - Pattern de route avec :params
 * @returns {RegExp} Expression régulière correspondante
 */
function patternToRegex(pattern) {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Échappe les caractères spéciaux
    .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, '([^/]+)'); // Remplace :param par capture group
  return new RegExp(`^${escaped}$`);
}

/**
 * Extrait les noms des paramètres d'un pattern
 * Exemple: '/parcours/:epic/:slide' → ['epic', 'slide']
 *
 * @param {string} pattern - Pattern de route
 * @returns {string[]} Noms des paramètres
 */
function extractParamNames(pattern) {
  const matches = pattern.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
}

/**
 * Parse le hash URL et retourne le path normalisé
 *
 * @param {string} hash - Hash brut (ex: '#/games/checkers')
 * @returns {string} Path normalisé (ex: '/games/checkers')
 */
function parseHash(hash) {
  if (!hash || hash === '#' || hash === '#/') {
    return '/';
  }
  // Supprime le # initial et normalise
  let path = hash.startsWith('#') ? hash.slice(1) : hash;
  // Assure que le path commence par /
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  // Supprime le / final (sauf pour la racine)
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }
  return path;
}

/**
 * Matche un path contre les routes définies
 *
 * @param {string} path - Path à matcher
 * @returns {Object|null} Objet { name, params } ou null si pas de match
 */
function matchRoute(path) {
  for (const route of routes) {
    const regex = patternToRegex(route.pattern);
    const match = path.match(regex);

    if (match) {
      const paramNames = extractParamNames(route.pattern);
      const params = {};

      // Extrait les valeurs des paramètres
      for (let i = 0; i < paramNames.length; i++) {
        params[paramNames[i]] = decodeURIComponent(match[i + 1]);
      }

      return { name: route.name, params };
    }
  }
  return null;
}

/**
 * Gère un changement de hash
 * Appelle le handler approprié si une route matche
 */
function handleHashChange() {
  const path = parseHash(window.location.hash);
  const matched = matchRoute(path);

  if (!matched) {
    // Route inconnue : redirige vers le catalogue
    navigate('/');
    return;
  }

  // Évite de re-naviguer vers la même route avec les mêmes params
  const routeKey = JSON.stringify(matched);
  if (routeKey === lastRoute) {
    return;
  }
  lastRoute = routeKey;

  // Appelle le handler correspondant
  const handler = handlers[matched.name];
  if (handler) {
    handler(matched.params);
  } else {
    console.warn(`[Router] Pas de handler pour la route: ${matched.name}`);
  }
}

/**
 * Initialise le router avec les handlers de l'application
 *
 * @param {Object} appHandlers - Objet { routeName: (params) => void }
 *
 * @example
 * initRouter({
 *   catalogue: () => showCatalogue(),
 *   game: (params) => loadGame(params.id),
 *   settings: () => showSettings(),
 * });
 */
export function initRouter(appHandlers) {
  handlers = appHandlers;

  // Écoute les changements de hash
  window.addEventListener('hashchange', handleHashChange);

  // Gère la route initiale
  if (window.location.hash) {
    handleHashChange();
  }
  // Si pas de hash, ne rien faire (l'app affiche le catalogue par défaut)
}

/**
 * Navigue vers une route
 *
 * @param {string} path - Path de destination (ex: '/games/checkers')
 *
 * @example
 * navigate('/games/checkers');
 * navigate('/parcours/deep-learning/3');
 * navigate('/');
 */
export function navigate(path) {
  // Normalise le path
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  // Met à jour le hash (déclenche hashchange)
  window.location.hash = path;
}

/**
 * Met à jour l'URL sans déclencher de navigation
 * Utile pour synchroniser l'URL avec l'état interne (ex: changement de slide)
 *
 * @param {string} path - Path à afficher dans l'URL
 */
export function replaceRoute(path) {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  // Met à jour le hash sans déclencher hashchange
  lastRoute = null; // Reset pour permettre la prochaine navigation
  history.replaceState(null, '', `#${path}`);
}

/**
 * Retourne la route actuelle
 *
 * @returns {Object|null} Objet { name, params } ou null si pas de route
 */
export function getCurrentRoute() {
  const path = parseHash(window.location.hash);
  return matchRoute(path);
}

/**
 * Construit une URL hash pour une route donnée
 *
 * @param {string} name - Nom de la route (game, tool, parcours, etc.)
 * @param {Object} params - Paramètres de la route
 * @returns {string} URL hash (ex: '#/games/checkers')
 *
 * @example
 * buildUrl('game', { id: 'checkers' }); // '#/games/checkers'
 * buildUrl('slide', { epic: 'deep-learning', slide: '3' }); // '#/parcours/deep-learning/3'
 */
export function buildUrl(name, params = {}) {
  const route = routes.find(r => r.name === name);
  if (!route) {
    console.warn(`[Router] Route inconnue: ${name}`);
    return '#/';
  }

  let path = route.pattern;
  for (const [key, value] of Object.entries(params)) {
    path = path.replace(`:${key}`, encodeURIComponent(value));
  }

  return `#${path}`;
}

// === Exports pour les tests ===
export const _internal = {
  patternToRegex,
  extractParamNames,
  parseHash,
  matchRoute,
  routes,
};
