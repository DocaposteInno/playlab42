/**
 * Routage basé sur le hash URL
 * @module app/router
 *
 * Gère les liens profonds vers les parcours, jeux et outils.
 */

import { state } from './state.js';
import { openEpic, closeParcours } from './parcours.js';
import { openGame, openTool, unloadGame } from './game-loader.js';
import { switchTab } from './tabs.js';

/**
 * Gère le routage basé sur le hash URL
 */
export function handleHashRoute() {
  const hash = window.location.hash;

  // Route jeux: #/games/:id
  // Motifs ancrés (^…$) : un identifiant invalide (majuscule, underscore,
  // espace, caractère spécial) ne doit pas être tronqué en un id valide —
  // « #/games/with_underscore » ne doit pas ouvrir le jeu « with ».
  const gameMatch = hash.match(/^#\/games\/([a-z0-9-]+)$/);
  if (gameMatch) {
    const gameId = gameMatch[1];
    openGame(gameId);
    return;
  }

  // Route outils: #/tools/:id
  const toolMatch = hash.match(/^#\/tools\/([a-z0-9-]+)$/);
  if (toolMatch) {
    const toolId = toolMatch[1];
    openTool(toolId);
    return;
  }

  // Route parcours: #/parcours/{epicId}/{slideId}
  const parcoursMatch = hash.match(/^#\/parcours\/([^/]+)(?:\/(.+))?$/);
  if (parcoursMatch) {
    const [, epicId, slideId] = parcoursMatch;
    openEpic(epicId, slideId);
    return;
  }

  // Pas de route spéciale, afficher le catalogue
  if (state.currentView === 'parcours') {
    if (state.parcoursViewer) {
      state.parcoursViewer.close();
    } else {
      closeParcours();
    }
  }
  if (state.currentView === 'game') {
    unloadGame();
  }
  if (hash === '#/parcours') {
    switchTab('parcours');
  }
}

/**
 * Initialise le listener de changement de hash
 */
export function initRouter() {
  // Gérer le hash initial
  if (window.location.hash) {
    handleHashRoute();
  }

  // Écouter les changements de hash
  window.addEventListener('hashchange', handleHashRoute);
}
