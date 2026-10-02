/**
 * Tests unitaires pour lib/gamekit.js
 * GameKit - SDK pour les jeux Playlab42
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock du module assets avant l'import de gamekit
jest.unstable_mockModule('./assets.js', () => ({
  AssetLoader: jest.fn().mockImplementation(() => ({
    dispose: jest.fn(),
  })),
}));

const { GameKit } = await import('./gamekit.js');

describe('GameKit', () => {
  let mockLocalStorage;
  let originalWindow;
  let originalDocument;
  let messageListeners;
  let visibilityListeners;

  beforeEach(() => {
    // Reset GameKit state
    GameKit.gameName = null;
    GameKit.assets = null;
    GameKit._soundEnabled = true;
    GameKit._paused = false;
    GameKit._initialized = false;

    // Mock localStorage
    mockLocalStorage = {
      store: {},
      getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
      setItem: jest.fn((key, value) => { mockLocalStorage.store[key] = value; }),
      removeItem: jest.fn((key) => { delete mockLocalStorage.store[key]; }),
    };
    global.localStorage = mockLocalStorage;

    // Collecter les event listeners
    messageListeners = [];
    visibilityListeners = [];

    // Mock window
    originalWindow = global.window;
    global.window = {
      parent: { postMessage: jest.fn() },
      addEventListener: jest.fn((event, listener) => {
        if (event === 'message') {
          messageListeners.push(listener);
        }
      }),
      removeEventListener: jest.fn((event, listener) => {
        if (event === 'message') {
          messageListeners = messageListeners.filter(item => item !== listener);
        }
      }),
      onSoundChange: undefined,
      onGamePause: undefined,
      onGameResume: undefined,
      onGameDispose: undefined,
    };

    // Mock document
    originalDocument = global.document;
    global.document = {
      hidden: false,
      addEventListener: jest.fn((event, listener) => {
        if (event === 'visibilitychange') {
          visibilityListeners.push(listener);
        }
      }),
      removeEventListener: jest.fn((event, listener) => {
        if (event === 'visibilitychange') {
          visibilityListeners = visibilityListeners.filter(item => item !== listener);
        }
      }),
    };

    // Mock console.warn
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    GameKit.dispose();
    global.window = originalWindow;
    global.document = originalDocument;
    jest.restoreAllMocks();
  });

  // ===========================================================================
  // init()
  // ===========================================================================
  describe('init()', () => {
    it('initialise GameKit avec le nom du jeu', () => {
      GameKit.init('test-game');

      expect(GameKit.gameName).toBe('test-game');
      expect(GameKit._initialized).toBe(true);
    });

    it('crée un AssetLoader', () => {
      GameKit.init('test-game');

      expect(GameKit.assets).toBeDefined();
    });

    it('envoie un message "ready" au portail', () => {
      GameKit.init('test-game');

      expect(global.window.parent.postMessage).toHaveBeenCalledWith(
        { type: 'ready', game: 'test-game' },
        '*',
      );
    });

    it('configure les event listeners', () => {
      GameKit.init('test-game');

      expect(global.window.addEventListener).toHaveBeenCalledWith('message', expect.any(Function));
      expect(global.document.addEventListener).toHaveBeenCalledWith('visibilitychange', expect.any(Function));
    });

    it('ne réinitialise pas si déjà initialisé', () => {
      GameKit.init('game1');
      GameKit.init('game2');

      expect(GameKit.gameName).toBe('game1');
      expect(console.warn).toHaveBeenCalledWith('GameKit already initialized');
    });
  });

  // ===========================================================================
  // _setupListeners() - Message handling
  // ===========================================================================
  describe('Message handling', () => {
    beforeEach(() => {
      GameKit.init('test-game');
    });

    it('gère le message "unload"', () => {
      jest.spyOn(GameKit, 'dispose');

      // Simuler un message unload
      const listener = messageListeners[0];
      listener({ data: { type: 'unload' } });

      expect(GameKit.dispose).toHaveBeenCalled();
    });

    it('gère le message "preference" pour le son', () => {
      global.window.onSoundChange = jest.fn();

      const listener = messageListeners[0];
      listener({ data: { type: 'preference', key: 'sound', value: false } });

      expect(GameKit._soundEnabled).toBe(false);
      expect(global.window.onSoundChange).toHaveBeenCalledWith(false);
    });

    it('ignore les préférences son mal typées et les clés inconnues', () => {
      global.window.onSoundChange = jest.fn();
      const listener = messageListeners[0];
      listener({ data: { type: 'preference', key: 'sound', value: 'false' } });
      listener({ data: { type: 'preference', key: 'other', value: false } });
      expect(GameKit.isSoundEnabled()).toBe(true);
      expect(global.window.onSoundChange).not.toHaveBeenCalled();
    });

    it('gère le message "pause"', () => {
      global.window.onGamePause = jest.fn();

      const listener = messageListeners[0];
      listener({ data: { type: 'pause' } });

      expect(GameKit._paused).toBe(true);
      expect(global.window.onGamePause).toHaveBeenCalled();
    });

    it('gère le message "resume"', () => {
      GameKit._paused = true;
      global.window.onGameResume = jest.fn();

      const listener = messageListeners[0];
      listener({ data: { type: 'resume' } });

      expect(GameKit._paused).toBe(false);
      expect(global.window.onGameResume).toHaveBeenCalled();
    });

    it('ignore les messages sans type', () => {
      const listener = messageListeners[0];

      expect(() => listener({ data: {} })).not.toThrow();
      expect(() => listener({ data: null })).not.toThrow();
    });
  });

  // ===========================================================================
  // Visibility change
  // ===========================================================================
  describe('Visibility change', () => {
    beforeEach(() => {
      GameKit.init('test-game');
    });

    it('met en pause quand l\'onglet est masqué', () => {
      global.window.onGamePause = jest.fn();
      global.document.hidden = true;

      const listener = visibilityListeners[0];
      listener();

      expect(GameKit._paused).toBe(true);
      expect(global.window.onGamePause).toHaveBeenCalled();
    });

    it('reprend quand l\'onglet redevient visible', () => {
      GameKit._paused = true;
      global.window.onGameResume = jest.fn();
      global.document.hidden = false;

      const listener = visibilityListeners[0];
      listener();

      expect(GameKit._paused).toBe(false);
      expect(global.window.onGameResume).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // dispose()
  // ===========================================================================
  describe('dispose()', () => {
    it('nettoie aussi la session lors du message unload et laisse réinitialiser', () => {
      global.window.onGameDispose = jest.fn();
      GameKit.init('first');
      const stale = messageListeners[0];
      stale({ data: { type: 'unload' } });
      expect(messageListeners).toHaveLength(0);
      expect(visibilityListeners).toHaveLength(0);
      expect(global.window.onGameDispose).toHaveBeenCalledTimes(1);
      GameKit.init('second');
      stale({ data: { type: 'unload' } });
      expect(GameKit._initialized).toBe(true);
      expect(GameKit.gameName).toBe('second');
      expect(global.window.onGameDispose).toHaveBeenCalledTimes(1);
    });

    it('retire exactement ses écouteurs et ne rappelle pas le hook après nettoyage', () => {
      GameKit.init('test-game');
      const onMessage = messageListeners[0];
      const onVisibility = visibilityListeners[0];
      global.window.onGameDispose = jest.fn(() => GameKit.dispose());
      global.window.onGamePause = jest.fn();
      global.window.onGameResume = jest.fn();
      global.window.onSoundChange = jest.fn();
      GameKit.dispose();
      GameKit.dispose();

      expect(global.window.removeEventListener).toHaveBeenCalledWith('message', onMessage);
      expect(global.document.removeEventListener).toHaveBeenCalledWith('visibilitychange', onVisibility);
      expect(messageListeners).toHaveLength(0);
      expect(visibilityListeners).toHaveLength(0);
      expect(global.window.onGameDispose).toHaveBeenCalledTimes(1);
      for (const data of [
        { type: 'pause' }, { type: 'resume' }, { type: 'unload' },
        { type: 'preference', key: 'sound', value: false },
      ]) {
        onMessage({ data });
      }
      onVisibility();
      expect(global.window.onGameDispose).toHaveBeenCalledTimes(1);
      expect(global.window.onGamePause).not.toHaveBeenCalled();
      expect(global.window.onGameResume).not.toHaveBeenCalled();
      expect(global.window.onSoundChange).not.toHaveBeenCalled();
    });

    it('réinitialise proprement une session et appelle chaque hook une seule fois', () => {
      global.window.onGamePause = jest.fn();
      global.window.onGameResume = jest.fn();
      global.window.onSoundChange = jest.fn();
      for (let cycle = 0; cycle < 3; cycle++) {
        GameKit.init(`game-${cycle}`);
        GameKit.init('ignored');
        expect(GameKit.isPaused()).toBe(false);
        expect(GameKit.isSoundEnabled()).toBe(true);
        expect(messageListeners).toHaveLength(1);
        expect(visibilityListeners).toHaveLength(1);
        messageListeners.forEach(listener => listener({ data: { type: 'pause' } }));
        messageListeners.forEach(listener => listener({
          data: { type: 'preference', key: 'sound', value: false },
        }));
        expect(GameKit.isPaused()).toBe(true);
        expect(GameKit.isSoundEnabled()).toBe(false);
        GameKit.init('ignored-while-paused');
        expect(GameKit.isPaused()).toBe(true);
        expect(GameKit.isSoundEnabled()).toBe(false);
        global.document.hidden = false;
        visibilityListeners.forEach(listener => listener());
        GameKit.dispose();
        expect(GameKit.isPaused()).toBe(false);
        expect(GameKit.isSoundEnabled()).toBe(true);
      }
      expect(global.window.onGamePause).toHaveBeenCalledTimes(3);
      expect(global.window.onGameResume).toHaveBeenCalledTimes(3);
      expect(global.window.onSoundChange).toHaveBeenCalledTimes(3);
      expect(global.window.parent.postMessage).toHaveBeenCalledTimes(3);
    });

    it('préserve le nom du jeu pour la persistence du hook de nettoyage', () => {
      GameKit.init('test-game');
      global.window.onGameDispose = () => GameKit.saveProgress({ level: 2 });
      GameKit.dispose();
      expect(GameKit.gameName).toBe('test-game');
      expect(GameKit.loadProgress()).toEqual({ level: 2 });
    });

    it('libère les ressources de l\'AssetLoader', () => {
      GameKit.init('test-game');
      const mockDispose = GameKit.assets.dispose;

      GameKit.dispose();

      expect(mockDispose).toHaveBeenCalled();
      expect(GameKit.assets).toBeNull();
    });

    it('appelle onGameDispose si défini', () => {
      GameKit.init('test-game');
      global.window.onGameDispose = jest.fn();

      GameKit.dispose();

      expect(global.window.onGameDispose).toHaveBeenCalled();
    });

    it('marque comme non initialisé', () => {
      GameKit.init('test-game');

      GameKit.dispose();

      expect(GameKit._initialized).toBe(false);
    });
  });

  // ===========================================================================
  // isPaused() et isSoundEnabled()
  // ===========================================================================
  describe('isPaused() et isSoundEnabled()', () => {
    it('isPaused() retourne l\'état de pause', () => {
      GameKit._paused = false;
      expect(GameKit.isPaused()).toBe(false);

      GameKit._paused = true;
      expect(GameKit.isPaused()).toBe(true);
    });

    it('isSoundEnabled() retourne l\'état du son', () => {
      GameKit._soundEnabled = true;
      expect(GameKit.isSoundEnabled()).toBe(true);

      GameKit._soundEnabled = false;
      expect(GameKit.isSoundEnabled()).toBe(false);
    });
  });

  // ===========================================================================
  // getPlayer()
  // ===========================================================================
  describe('getPlayer()', () => {
    it('retourne le joueur depuis localStorage', () => {
      mockLocalStorage.store['player'] = JSON.stringify({ name: 'Alice' });

      const player = GameKit.getPlayer();

      expect(player).toEqual({ name: 'Alice' });
    });

    it('retourne "Anonyme" si pas de joueur', () => {
      const player = GameKit.getPlayer();

      expect(player).toEqual({ name: 'Anonyme' });
    });

    it('retourne "Anonyme" si données corrompues', () => {
      mockLocalStorage.store['player'] = 'invalid json';

      const player = GameKit.getPlayer();

      expect(player).toEqual({ name: 'Anonyme' });
      expect(console.warn).toHaveBeenCalledWith('Cannot load player:', expect.any(Error));
      expect(mockLocalStorage.store['player']).toBe('invalid json');
    });
  });

  // ===========================================================================
  // saveScore()
  // ===========================================================================
  describe('saveScore()', () => {
    beforeEach(() => {
      GameKit.init('test-game');
    });

    it('sauvegarde un score', () => {
      const result = GameKit.saveScore(1000);

      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalled();

      const savedScores = JSON.parse(mockLocalStorage.store['scores_test-game']);
      expect(savedScores[0].score).toBe(1000);
    });

    it('inclut le timestamp et le nom du joueur', () => {
      mockLocalStorage.store['player'] = JSON.stringify({ name: 'Bob' });

      GameKit.saveScore(500);

      const savedScores = JSON.parse(mockLocalStorage.store['scores_test-game']);
      expect(savedScores[0].player).toBe('Bob');
      expect(savedScores[0].date).toBeDefined();
    });

    it('trie les scores par ordre décroissant', () => {
      GameKit.saveScore(100);
      GameKit.saveScore(300);
      GameKit.saveScore(200);

      const savedScores = JSON.parse(mockLocalStorage.store['scores_test-game']);
      expect(savedScores[0].score).toBe(300);
      expect(savedScores[1].score).toBe(200);
      expect(savedScores[2].score).toBe(100);
    });

    it('limite à 10 scores', () => {
      for (let i = 1; i <= 15; i++) {
        GameKit.saveScore(i * 100);
      }

      const savedScores = JSON.parse(mockLocalStorage.store['scores_test-game']);
      expect(savedScores).toHaveLength(10);
      expect(savedScores[0].score).toBe(1500); // Le plus grand
    });

    it('envoie le score au portail', () => {
      GameKit.saveScore(1000);

      expect(global.window.parent.postMessage).toHaveBeenCalledWith(
        { type: 'score', game: 'test-game', score: 1000 },
        '*',
      );
    });

    it('retourne false si GameKit non initialisé', () => {
      GameKit.dispose();
      GameKit.gameName = null;

      const result = GameKit.saveScore(100);

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith('GameKit not initialized');
    });

    it('retourne false si localStorage échoue', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = GameKit.saveScore(100);

      expect(result).toBe(false);
    });

    it('refuse de remplacer des scores corrompus et ne notifie pas de sauvegarde', () => {
      mockLocalStorage.store['scores_test-game'] = 'invalid json';
      global.window.parent.postMessage.mockClear();

      expect(GameKit.saveScore(100)).toBe(false);
      expect(mockLocalStorage.store['scores_test-game']).toBe('invalid json');
      expect(console.warn).toHaveBeenCalledWith('Cannot save score:', expect.any(Error));
      expect(global.window.parent.postMessage).not.toHaveBeenCalled();
    });

    it.each([NaN, Infinity, -Infinity, '100'])('refuse un score invalide (%s)', score => {
      expect(GameKit.saveScore(score)).toBe(false);
      expect(mockLocalStorage.store['scores_test-game']).toBeUndefined();
      expect(console.warn).toHaveBeenCalledWith('Cannot save score:', expect.any(Error));
    });

    it('refuse un score invalide meme si les dix meilleurs scores le masqueraient', () => {
      mockLocalStorage.store['scores_test-game'] = JSON.stringify(
        Array.from({ length: 10 }, (_, i) => ({ score: 100 + i, date: 1, player: 'Alice' })),
      );
      const before = { ...mockLocalStorage.store };

      expect(GameKit.saveScore(-Infinity)).toBe(false);
      expect(mockLocalStorage.store).toEqual(before);
    });
  });

  // ===========================================================================
  // getHighScores()
  // ===========================================================================
  describe('getHighScores()', () => {
    it('trie des scores importes sans modifier les octets sauvegardes', () => {
      GameKit.gameName = 'test-game';
      const stored = JSON.stringify([
        { score: 100, date: 1, player: 'Alice' },
        { score: 300, date: 2, player: 'Bob' },
      ]);
      mockLocalStorage.store['scores_test-game'] = stored;

      expect(GameKit.getHighScores().map(entry => entry.score)).toEqual([300, 100]);
      expect(mockLocalStorage.store['scores_test-game']).toBe(stored);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });

    it('retourne les scores sauvegardés', () => {
      GameKit.gameName = 'test-game';
      mockLocalStorage.store['scores_test-game'] = JSON.stringify([
        { score: 1000, date: 1, player: 'Alice' },
        { score: 500, date: 2, player: 'Bob' },
      ]);

      const scores = GameKit.getHighScores();

      expect(scores).toHaveLength(2);
      expect(scores[0].score).toBe(1000);
    });

    it('retourne un tableau vide si pas de scores', () => {
      GameKit.gameName = 'test-game';

      const scores = GameKit.getHighScores();

      expect(scores).toEqual([]);
    });

    it('retourne un tableau vide si GameKit non initialisé', () => {
      GameKit.gameName = null;

      const scores = GameKit.getHighScores();

      expect(scores).toEqual([]);
    });

    it('retourne un tableau vide si données corrompues', () => {
      GameKit.gameName = 'test-game';
      mockLocalStorage.store['scores_test-game'] = 'invalid json';

      const scores = GameKit.getHighScores();

      expect(scores).toEqual([]);
      expect(console.warn).toHaveBeenCalledWith('Cannot load scores:', expect.any(Error));
      expect(mockLocalStorage.store['scores_test-game']).toBe('invalid json');
    });
  });

  // ===========================================================================
  // saveProgress() et loadProgress()
  // ===========================================================================
  describe('saveProgress() et loadProgress()', () => {
    beforeEach(() => {
      GameKit.init('test-game');
    });

    it('saveProgress() sauvegarde les données', () => {
      const data = { level: 5, items: ['sword', 'shield'] };

      const result = GameKit.saveProgress(data);

      expect(result).toBe(true);
      const saved = JSON.parse(mockLocalStorage.store['progress_test-game']);
      expect(saved).toEqual(data);
    });

    it('loadProgress() charge les données', () => {
      mockLocalStorage.store['progress_test-game'] = JSON.stringify({ level: 3 });

      const data = GameKit.loadProgress();

      expect(data).toEqual({ level: 3 });
    });

    it('loadProgress() retourne null si pas de données', () => {
      const data = GameKit.loadProgress();

      expect(data).toBeNull();
    });

    it('loadProgress() conserve et signale les données corrompues', () => {
      mockLocalStorage.store['progress_test-game'] = 'invalid json';

      const data = GameKit.loadProgress();

      expect(data).toBeNull();
      expect(mockLocalStorage.store['progress_test-game']).toBe('invalid json');
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith('Cannot load progress:', expect.any(Error));
    });

    it('saveProgress() ne remplace pas des données corrompues', () => {
      mockLocalStorage.store['progress_test-game'] = 'invalid json';

      expect(GameKit.saveProgress({ level: 4 })).toBe(false);
      expect(mockLocalStorage.store['progress_test-game']).toBe('invalid json');
      expect(console.warn).toHaveBeenCalledWith('Cannot save progress:', expect.any(Error));
    });

    it('refuse une version de stockage future sans modifier les données', () => {
      mockLocalStorage.store['playlab42.local-data.schema'] = JSON.stringify({ version: 999 });
      mockLocalStorage.store['progress_test-game'] = JSON.stringify({ level: 3 });
      const before = { ...mockLocalStorage.store };

      expect(GameKit.loadProgress()).toBeNull();
      expect(GameKit.saveProgress({ level: 4 })).toBe(false);
      expect(GameKit.saveScore(100)).toBe(false);
      expect(mockLocalStorage.store).toEqual(before);
      expect(console.warn).toHaveBeenCalled();
    });

    it('saveProgress() retourne false si non initialisé', () => {
      GameKit.gameName = null;

      const result = GameKit.saveProgress({ data: 'test' });

      expect(result).toBe(false);
    });

    it('loadProgress() retourne null si non initialisé', () => {
      GameKit.gameName = null;

      const result = GameKit.loadProgress();

      expect(result).toBeNull();
    });
  });

  // ===========================================================================
  // clearProgress()
  // ===========================================================================
  describe('clearProgress()', () => {
    it('supprime la progression sauvegardée', () => {
      GameKit.gameName = 'test-game';
      mockLocalStorage.store['progress_test-game'] = JSON.stringify({ data: 'test' });

      GameKit.clearProgress();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('progress_test-game');
    });

    it('ne fait rien si gameName est null', () => {
      GameKit.gameName = null;

      GameKit.clearProgress();

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // quit()
  // ===========================================================================
  describe('quit()', () => {
    it('envoie un message "quit" au portail', () => {
      GameKit.gameName = 'test-game';

      GameKit.quit();

      expect(global.window.parent.postMessage).toHaveBeenCalledWith(
        { type: 'quit', game: 'test-game' },
        '*',
      );
    });
  });

  // ===========================================================================
  // _postMessage()
  // ===========================================================================
  describe('_postMessage()', () => {
    it('n\'envoie pas si window.parent === window', () => {
      global.window.parent = global.window;
      GameKit.gameName = 'test-game';

      GameKit.quit();

      // postMessage ne devrait pas être appelé car parent === window
      // (le jeu n'est pas dans une iframe)
    });
  });
});
