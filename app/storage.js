/**
 * Gestion de la persistence localStorage
 * @module app/storage
 *
 * Fonctions de lecture/écriture des préférences et données utilisateur.
 */

import { state, STORAGE_KEYS, MAX_RECENT } from './state.js';
import { readLocalData, writeLocalValues } from '../lib/local-data.js';

/**
 * Charge les préférences validées, sans écraser l'état en cas d'erreur.
 * @returns {boolean} false si le stockage ou une valeur est invalide.
 */
export function loadPreferences() {
  try {
    const player = readLocalData(STORAGE_KEYS.PLAYER, null);
    const prefs = readLocalData(STORAGE_KEYS.PREFERENCES, null);
    const recent = readLocalData(STORAGE_KEYS.RECENT, null);
    const activeTab = readLocalData(STORAGE_KEYS.ACTIVE_TAB, null);
    if (player) { state.preferences.pseudo = player.name || 'Anonyme'; }
    if (prefs) { state.preferences.sound = prefs.sound !== false; }
    if (recent) { state.recentGames = recent; }
    if (activeTab) { state.activeTab = activeTab; }
    return true;
  } catch (e) {
    console.warn('Erreur chargement préférences:', e);
    return false;
  }
}

/**
 * Sauvegarde les préférences en une opération avec retour arrière.
 * @returns {boolean} false si aucune sauvegarde complète n'a pu être réalisée.
 */
export function savePreferences() {
  try {
    writeLocalValues({
      [STORAGE_KEYS.PLAYER]: { name: state.preferences.pseudo },
      [STORAGE_KEYS.PREFERENCES]: { sound: state.preferences.sound },
      [STORAGE_KEYS.RECENT]: state.recentGames,
      [STORAGE_KEYS.ACTIVE_TAB]: state.activeTab,
    });
    return true;
  } catch (e) {
    console.warn('Erreur sauvegarde préférences:', e);
    return false;
  }
}

/**
 * Récupère la progression d'un epic depuis localStorage
 * @param {string} epicId - ID de l'epic
 * @returns {Object} Progression avec visited[] et current
 */
export function getEpicProgress(epicId) {
  try {
    const progress = readLocalData('parcours-progress', {});
    return Object.hasOwn(progress, epicId) ? progress[epicId] : { visited: [], current: null };
  } catch (e) {
    console.warn('Erreur lecture progression:', e);
    return { visited: [], current: null };
  }
}

/**
 * Ajoute un jeu/outil à l'historique des récents
 * @param {string} id - ID du jeu/outil
 * @param {string} type - Type ('game' ou 'tool')
 */
export function addToRecent(id, type) {
  // Retirer l'entrée existante si présente
  state.recentGames = state.recentGames.filter(r => r.id !== id);

  // Ajouter en tête
  state.recentGames.unshift({ id, type, timestamp: Date.now() });

  // Limiter la taille
  state.recentGames = state.recentGames.slice(0, MAX_RECENT);

  savePreferences();
}
