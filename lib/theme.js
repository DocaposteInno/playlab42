/**
 * Playlab42 - Gestion des thèmes
 * Permet de basculer entre thème dark et light
 */

import { readLocalData, writeLocalData, removeLocalData } from './local-data.js';

const STORAGE_KEY = 'playlab42.theme';
let cleanupTheme = null;

/**
 * Thèmes disponibles
 */
export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  SYSTEM: 'system', // Suit les préférences système
};

/**
 * Récupère le thème actuel depuis localStorage
 * @returns {'dark'|'light'|'system'}
 */
export function getTheme() {
  try {
    const saved = readLocalData(STORAGE_KEY, THEMES.SYSTEM);
    if (saved === THEMES.DARK || saved === THEMES.LIGHT) {
      return saved;
    }
  } catch (e) {
    console.warn('Erreur lecture thème:', e);
  }
  return THEMES.SYSTEM;
}

/**
 * Définit le thème
 * @param {'dark'|'light'|'system'} theme
 */
export function setTheme(theme) {
  try {
    if (theme === THEMES.SYSTEM) {
      removeLocalData(STORAGE_KEY);
      document.documentElement.removeAttribute('data-theme');
    } else {
      writeLocalData(STORAGE_KEY, theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  } catch (e) {
    console.warn('Erreur sauvegarde thème:', e);
    return;
  }
  window.dispatchEvent(new CustomEvent('themechange', {
    detail: { theme: getEffectiveTheme() },
  }));
}

/**
 * Bascule entre dark et light
 * @returns {'dark'|'light'} Le nouveau thème
 */
export function toggleTheme() {
  const current = getEffectiveTheme();
  const next = current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
  setTheme(next);
  return next;
}

/**
 * Retourne le thème effectif (résout 'system')
 * @returns {'dark'|'light'}
 */
export function getEffectiveTheme() {
  const theme = getTheme();
  if (theme === THEMES.SYSTEM) {
    return window.matchMedia('(prefers-color-scheme: light)').matches
      ? THEMES.LIGHT
      : THEMES.DARK;
  }
  return theme;
}

/**
 * Synchronise le document et ses abonnés avec le thème déjà sauvegardé.
 * Utile après un import local, sans réécrire le stockage.
 */
export function syncTheme() {
  synchronizeTheme(window, document);
}

/**
 * @param {Window} ownerWindow - Fenêtre à notifier
 * @param {Document} ownerDocument - Document à synchroniser
 */
function synchronizeTheme(ownerWindow, ownerDocument) {
  const current = getTheme();
  if (current === THEMES.SYSTEM) {
    ownerDocument.documentElement.removeAttribute('data-theme');
  } else {
    ownerDocument.documentElement.setAttribute('data-theme', current);
  }
  ownerWindow.dispatchEvent(new CustomEvent('themechange', {
    detail: { theme: getEffectiveTheme() },
  }));
}

/**
 * Initialise le thème au chargement
 * Doit être appelé le plus tôt possible pour éviter le flash
 * Les appels répétés partagent les mêmes écouteurs jusqu'au nettoyage.
 * @returns {() => void} Retire uniquement les écouteurs de cette initialisation
 */
export function initTheme() {
  const theme = getTheme();
  if (theme !== THEMES.SYSTEM) {
    document.documentElement.setAttribute('data-theme', theme);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  if (cleanupTheme) {return cleanupTheme;}

  const ownerWindow = window;
  const ownerDocument = document;
  const mediaQuery = ownerWindow.matchMedia('(prefers-color-scheme: light)');
  let active = true;
  // Écouter les changements de préférences système
  const onSystemChange = (e) => {
    if (active && getTheme() === THEMES.SYSTEM) {
      // Le thème système a changé, le CSS s'en occupe via @media
      // On dispatch un événement custom pour notifier l'UI
      ownerWindow.dispatchEvent(new CustomEvent('themechange', {
        detail: { theme: e.matches ? THEMES.LIGHT : THEMES.DARK },
      }));
    }
  };

  // Les iframes standalone partagent le stockage, mais pas le document du portail.
  const onStorage = (event) => {
    if (!active) {return;}
    if (event.key !== STORAGE_KEY && event.key !== null) { return; }
    if (event.storageArea && event.storageArea !== localStorage) {return;}
    synchronizeTheme(ownerWindow, ownerDocument);
  };
  mediaQuery.addEventListener('change', onSystemChange);
  ownerWindow.addEventListener('storage', onStorage);
  cleanupTheme = () => {
    if (!active) {return;}
    active = false;
    mediaQuery.removeEventListener('change', onSystemChange);
    ownerWindow.removeEventListener('storage', onStorage);
    cleanupTheme = null;
  };
  return cleanupTheme;
}

/**
 * Écoute les changements de thème
 * @param {Function} callback - (theme: 'dark'|'light') => void
 * @returns {Function} - Pour retirer le listener
 */
export function onThemeChange(callback) {
  const ownerWindow = window;
  const handler = (e) => callback(e.detail.theme);
  ownerWindow.addEventListener('themechange', handler);
  return () => ownerWindow.removeEventListener('themechange', handler);
}
