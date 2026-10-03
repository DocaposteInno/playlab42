/**
 * Tests unitaires pour lib/theme.js
 * @see openspec/specs/theme/spec.md
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  THEMES,
  getTheme,
  setTheme,
  toggleTheme,
  getEffectiveTheme,
  syncTheme,
  initTheme,
  onThemeChange,
} from './theme.js';

describe('Theme', () => {
  let originalLocalStorage;
  let originalDocument;
  let originalWindow;
  let mockLocalStorage;
  let mockMediaQuery;
  let eventListeners;
  let customEventListeners;

  beforeEach(() => {
    // Sauvegarder les originaux
    originalLocalStorage = global.localStorage;
    originalDocument = global.document;
    originalWindow = global.window;

    // Mock localStorage
    mockLocalStorage = {
      store: {},
      getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
      setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value; }),
      removeItem: jest.fn((key) => { delete mockLocalStorage.store[key]; }),
      clear: jest.fn(() => { mockLocalStorage.store = {}; }),
    };
    global.localStorage = mockLocalStorage;

    // Mock matchMedia
    eventListeners = [];
    mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn((event, listener) => {
        eventListeners.push({ event, listener });
      }),
      removeEventListener: jest.fn((event, listener) => {
        eventListeners = eventListeners.filter(
          item => !(item.event === event && item.listener === listener),
        );
      }),
    };

    // Mock window
    customEventListeners = [];
    global.window = {
      matchMedia: jest.fn(() => mockMediaQuery),
      addEventListener: jest.fn((event, listener) => {
        customEventListeners.push({ event, listener });
      }),
      removeEventListener: jest.fn((event, listener) => {
        customEventListeners = customEventListeners.filter(
          (l) => !(l.event === event && l.listener === listener),
        );
      }),
      dispatchEvent: jest.fn((event) => {
        customEventListeners
          .filter((l) => l.event === event.type)
          .forEach((l) => l.listener(event));
      }),
    };

    // Mock document
    global.document = {
      documentElement: {
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
      },
    };

    // Mock console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    initTheme()();
    global.localStorage = originalLocalStorage;
    global.document = originalDocument;
    global.window = originalWindow;
    jest.restoreAllMocks();
  });

  // ===========================================================================
  // THEMES constante
  // ===========================================================================
  describe('THEMES', () => {
    it('contient les valeurs DARK, LIGHT et SYSTEM', () => {
      expect(THEMES.DARK).toBe('dark');
      expect(THEMES.LIGHT).toBe('light');
      expect(THEMES.SYSTEM).toBe('system');
    });
  });

  // ===========================================================================
  // getTheme()
  // ===========================================================================
  describe('getTheme()', () => {
    it('retourne "system" si aucun thème sauvegardé', () => {
      const result = getTheme();
      expect(result).toBe(THEMES.SYSTEM);
    });

    it('retourne "dark" si sauvegardé dans localStorage', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      const result = getTheme();
      expect(result).toBe(THEMES.DARK);
    });

    it('retourne "light" si sauvegardé dans localStorage', () => {
      mockLocalStorage.store['playlab42.theme'] = 'light';
      const result = getTheme();
      expect(result).toBe(THEMES.LIGHT);
    });

    it('retourne "system" si valeur invalide dans localStorage', () => {
      mockLocalStorage.store['playlab42.theme'] = 'invalid';
      const result = getTheme();
      expect(result).toBe(THEMES.SYSTEM);
    });

    it('retourne "system" si localStorage lance une erreur', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const result = getTheme();
      expect(result).toBe(THEMES.SYSTEM);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // setTheme()
  // ===========================================================================
  describe('setTheme()', () => {
    it('notifie immédiatement les composants lors d’un changement manuel', () => {
      const callback = jest.fn();
      onThemeChange(callback);
      setTheme(THEMES.LIGHT);
      expect(callback).toHaveBeenCalledWith(THEMES.LIGHT);
    });
    it('sauvegarde "dark" dans localStorage et l\'attribut data-theme', () => {
      setTheme(THEMES.DARK);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('playlab42.theme', 'dark');
      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('sauvegarde "light" dans localStorage et l\'attribut data-theme', () => {
      setTheme(THEMES.LIGHT);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('playlab42.theme', 'light');
      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('supprime le thème et l\'attribut pour "system"', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      setTheme(THEMES.SYSTEM);

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('playlab42.theme');
      expect(global.document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
    });

    it('signale les erreurs de localStorage sans notifier de changement', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      expect(() => setTheme(THEMES.DARK)).not.toThrow();
      expect(console.warn).toHaveBeenCalled();
      expect(global.window.dispatchEvent).not.toHaveBeenCalled();
      expect(global.document.documentElement.setAttribute).not.toHaveBeenCalled();
    });

    it('preserve une version future et ne modifie pas le document', () => {
      mockLocalStorage.store['playlab42.local-data.schema'] = JSON.stringify({ version: 999 });
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      const before = { ...mockLocalStorage.store };

      setTheme(THEMES.LIGHT);
      setTheme(THEMES.SYSTEM);

      expect(mockLocalStorage.store).toEqual(before);
      expect(global.window.dispatchEvent).not.toHaveBeenCalled();
      expect(global.document.documentElement.setAttribute).not.toHaveBeenCalled();
      expect(global.document.documentElement.removeAttribute).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });

    it('ne remplace pas une preference corrompue lors du choix de theme', () => {
      mockLocalStorage.store['playlab42.theme'] = 'invalid';
      const before = { ...mockLocalStorage.store };

      setTheme(THEMES.DARK);

      expect(mockLocalStorage.store).toEqual(before);
      expect(console.warn).toHaveBeenCalled();
      expect(global.window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // getEffectiveTheme()
  // ===========================================================================
  describe('getEffectiveTheme()', () => {
    it('retourne "dark" si thème explicitement "dark"', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      const result = getEffectiveTheme();
      expect(result).toBe(THEMES.DARK);
    });

    it('retourne "light" si thème explicitement "light"', () => {
      mockLocalStorage.store['playlab42.theme'] = 'light';
      const result = getEffectiveTheme();
      expect(result).toBe(THEMES.LIGHT);
    });

    it('retourne "light" si système préfère light', () => {
      mockMediaQuery.matches = true; // prefers-color-scheme: light matches
      const result = getEffectiveTheme();
      expect(result).toBe(THEMES.LIGHT);
    });

    it('retourne "dark" si système préfère dark', () => {
      mockMediaQuery.matches = false; // prefers-color-scheme: light ne match pas
      const result = getEffectiveTheme();
      expect(result).toBe(THEMES.DARK);
    });
  });

  // ===========================================================================
  // toggleTheme()
  // ===========================================================================
  describe('toggleTheme()', () => {
    it('bascule de dark à light', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      const result = toggleTheme();

      expect(result).toBe(THEMES.LIGHT);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('playlab42.theme', 'light');
    });

    it('bascule de light à dark', () => {
      mockLocalStorage.store['playlab42.theme'] = 'light';
      const result = toggleTheme();

      expect(result).toBe(THEMES.DARK);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('playlab42.theme', 'dark');
    });

    it('bascule de system (dark) à light', () => {
      // System résout vers dark
      mockMediaQuery.matches = false;
      const result = toggleTheme();

      expect(result).toBe(THEMES.LIGHT);
    });

    it('bascule de system (light) à dark', () => {
      // System résout vers light
      mockMediaQuery.matches = true;
      const result = toggleTheme();

      expect(result).toBe(THEMES.DARK);
    });
  });

  // ===========================================================================
  // initTheme()
  // ===========================================================================
  describe('syncTheme()', () => {
    it.each(['dark', 'light'])('synchronise le thème %s sans écriture de stockage', (theme) => {
      const callback = jest.fn();
      onThemeChange(callback);
      mockLocalStorage.store['playlab42.theme'] = theme;
      syncTheme();
      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', theme);
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(theme);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });

    it('synchronise le thème système après import et respecte le désabonnement', () => {
      const callback = jest.fn();
      const unsubscribe = onThemeChange(callback);
      mockMediaQuery.matches = true;
      syncTheme();
      expect(global.document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith('light');
      unsubscribe();
      mockMediaQuery.matches = false;
      syncTheme();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('initTheme()', () => {
    it('partage les écouteurs répétés et permet une nouvelle initialisation après nettoyage', () => {
      const subscriber = jest.fn();
      const unsubscribe = onThemeChange(subscriber);
      const cleanup = initTheme();
      expect(initTheme()).toBe(cleanup);
      expect(eventListeners).toHaveLength(1);
      expect(customEventListeners.filter(item => item.event === 'storage')).toHaveLength(1);
      const oldSystem = eventListeners[0].listener;
      const oldStorage = customEventListeners.find(item => item.event === 'storage').listener;
      oldSystem({ matches: true });
      expect(subscriber).toHaveBeenCalledTimes(1);

      cleanup();
      cleanup();
      oldSystem({ matches: false });
      oldStorage({ key: null });
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(eventListeners).toHaveLength(0);
      expect(customEventListeners.filter(item => item.event === 'storage')).toHaveLength(0);

      const nextCleanup = initTheme();
      expect(nextCleanup).not.toBe(cleanup);
      cleanup();
      eventListeners[0].listener({ matches: false });
      expect(subscriber).toHaveBeenCalledTimes(2);
      unsubscribe();
      eventListeners[0].listener({ matches: true });
      expect(subscriber).toHaveBeenCalledTimes(2);
      nextCleanup();
    });

    it('notifie exactement une fois pour les événements de stockage et système', () => {
      const subscriber = jest.fn();
      onThemeChange(subscriber);
      initTheme();
      initTheme();
      mockLocalStorage.store['playlab42.theme'] = 'light';
      global.window.dispatchEvent({ type: 'storage', key: 'playlab42.theme' });
      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenLastCalledWith('light');
      eventListeners[0].listener({ matches: false });
      expect(subscriber).toHaveBeenCalledTimes(1);
      delete mockLocalStorage.store['playlab42.theme'];
      mockMediaQuery.matches = false;
      global.window.dispatchEvent({ type: 'storage', key: null });
      expect(subscriber).toHaveBeenCalledTimes(2);
      expect(subscriber).toHaveBeenLastCalledWith('dark');
      eventListeners[0].listener({ matches: true });
      expect(subscriber).toHaveBeenCalledTimes(3);
      expect(subscriber).toHaveBeenLastCalledWith('light');
    });

    it('ignore un événement sessionStorage portant la même clé', () => {
      initTheme();
      const listener = customEventListeners.find(item => item.event === 'storage').listener;
      listener({ key: 'playlab42.theme', storageArea: {} });
      expect(global.window.dispatchEvent).not.toHaveBeenCalled();
    });

    it('supprime un ancien attribut explicite lors du retour au thème système', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      initTheme();
      delete mockLocalStorage.store['playlab42.theme'];
      initTheme();
      expect(global.document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
    });
    it('synchronise le thème changé depuis une autre iframe', () => {
      initTheme();
      mockLocalStorage.store['playlab42.theme'] = 'light';
      const listener = customEventListeners.find(item => item.event === 'storage').listener;
      listener({ key: 'playlab42.theme' });
      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
      delete mockLocalStorage.store['playlab42.theme'];
      listener({ key: null });
      expect(global.document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
    });

    it('ignore les changements de stockage étrangers au thème', () => {
      initTheme();
      const listener = customEventListeners.find(item => item.event === 'storage').listener;
      listener({ key: 'scores_exemple' });
      expect(global.window.dispatchEvent).not.toHaveBeenCalled();
    });
    it('définit l\'attribut data-theme si thème explicite (dark)', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      initTheme();

      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('définit l\'attribut data-theme si thème explicite (light)', () => {
      mockLocalStorage.store['playlab42.theme'] = 'light';
      initTheme();

      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'light');
    });

    it('ne définit pas l\'attribut data-theme si thème system', () => {
      // Pas de thème sauvegardé = system
      initTheme();

      expect(global.document.documentElement.setAttribute).not.toHaveBeenCalled();
    });

    it('écoute les changements de préférences système', () => {
      initTheme();

      expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('dispatch un événement themechange quand le système change (en mode system)', () => {
      initTheme();

      // Récupérer le listener enregistré
      const changeListener = eventListeners.find((l) => l.event === 'change')?.listener;
      expect(changeListener).toBeDefined();

      // Simuler un changement de préférence système (vers light)
      changeListener({ matches: true });

      expect(global.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themechange',
          detail: { theme: THEMES.LIGHT },
        }),
      );
    });

    it('dispatch themechange avec dark quand système passe à dark', () => {
      initTheme();

      const changeListener = eventListeners.find((l) => l.event === 'change')?.listener;
      changeListener({ matches: false });

      expect(global.window.dispatchEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'themechange',
          detail: { theme: THEMES.DARK },
        }),
      );
    });

    it('ne dispatch pas d\'événement si thème explicite (pas system)', () => {
      mockLocalStorage.store['playlab42.theme'] = 'dark';
      initTheme();

      const changeListener = eventListeners.find((l) => l.event === 'change')?.listener;
      changeListener({ matches: true });

      expect(global.window.dispatchEvent).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // onThemeChange()
  // ===========================================================================
  describe('onThemeChange()', () => {
    it('enregistre un listener pour l\'événement themechange', () => {
      const callback = jest.fn();
      onThemeChange(callback);

      expect(global.window.addEventListener).toHaveBeenCalledWith('themechange', expect.any(Function));
    });

    it('appelle le callback avec le thème quand l\'événement est émis', () => {
      const callback = jest.fn();
      onThemeChange(callback);

      // Simuler l'émission de l'événement
      const event = { type: 'themechange', detail: { theme: THEMES.DARK } };
      global.window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(THEMES.DARK);
    });

    it('retourne une fonction pour retirer le listener', () => {
      const callback = jest.fn();
      const unsubscribe = onThemeChange(callback);

      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
      expect(global.window.removeEventListener).toHaveBeenCalledWith('themechange', expect.any(Function));
    });

    it('le listener est retiré après appel de la fonction retournée', () => {
      const callback = jest.fn();
      const unsubscribe = onThemeChange(callback);

      unsubscribe();

      // Simuler l'émission de l'événement après désabonnement
      const event = { type: 'themechange', detail: { theme: THEMES.DARK } };
      global.window.dispatchEvent(event);

      // Le callback ne devrait pas être appelé
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
