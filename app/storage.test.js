import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { state } from './state.js';
import { loadPreferences, savePreferences, getEpicProgress } from './storage.js';
import { LOCAL_DATA_SCHEMA_KEY, importLocalData, BACKUP_FORMAT } from '../lib/local-data.js';

describe('Préférences et progression locales', () => {
  let data;
  let originalStorage;

  beforeEach(() => {
    originalStorage = globalThis.localStorage;
    data = new Map();
    globalThis.localStorage = {
      getItem: jest.fn(key => data.get(key) ?? null),
      setItem: jest.fn((key, value) => data.set(key, value)),
      removeItem: jest.fn(key => data.delete(key)),
    };
    state.preferences = { pseudo: 'Anonyme', sound: true };
    state.recentGames = [];
    state.activeTab = 'parcours';
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.localStorage = originalStorage;
    jest.restoreAllMocks();
  });

  it('charge les préférences historiques et les formats bruts', () => {
    data.set('player', '{"name":"Ada"}');
    data.set('preferences', '{"sound":false}');
    data.set('recent_games', '[{"id":"test","type":"game","timestamp":1}]');
    data.set('playlab42.activeTab', 'games');
    expect(loadPreferences()).toBe(true);
    expect(state.preferences).toEqual({ pseudo: 'Ada', sound: false });
    expect(state.activeTab).toBe('games');
    expect(state.recentGames[0].id).toBe('test');
  });

  it('ne charge pas partiellement des préférences corrompues', () => {
    data.set('player', '{"name":"Ada"}');
    data.set('preferences', '{"sound":"oui"}');
    expect(loadPreferences()).toBe(false);
    expect(state.preferences).toEqual({ pseudo: 'Anonyme', sound: true });
    expect(data.get('preferences')).toBe('{"sound":"oui"}');
  });

  it('sauvegarde le format historique et la métadonnée', () => {
    state.preferences = { pseudo: 'Ada', sound: false };
    expect(savePreferences()).toBe(true);
    expect(JSON.parse(data.get('player'))).toEqual({ name: 'Ada' });
    expect(JSON.parse(data.get('preferences'))).toEqual({ sound: false });
    expect(data.get('playlab42.activeTab')).toBe('parcours');
    expect(JSON.parse(data.get(LOCAL_DATA_SCHEMA_KEY)).version).toBe(1);
  });

  it('préserve un original corrompu lors de la sauvegarde normale', () => {
    data.set('preferences', '{bad');
    expect(savePreferences()).toBe(false);
    expect(data.get('preferences')).toBe('{bad');
    expect(data.has('player')).toBe(false);
  });

  it('remonte le quota et annule les préférences partiellement écrites', () => {
    data.set('player', '{"name":"Ada"}');
    const original = globalThis.localStorage.setItem.getMockImplementation();
    globalThis.localStorage.setItem.mockImplementation((key, raw) => {
      if (key === 'preferences') { throw new Error('quota'); }
      original(key, raw);
    });
    expect(savePreferences()).toBe(false);
    expect(data.get('player')).toBe('{"name":"Ada"}');
    expect(data.has(LOCAL_DATA_SCHEMA_KEY)).toBe(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('lit les parcours et préserve les erreurs originales', () => {
    data.set('parcours-progress', '{"epic":{"visited":["intro"],"current":"intro"}}');
    expect(getEpicProgress('epic')).toEqual({ visited: ['intro'], current: 'intro' });
    expect(getEpicProgress('absent')).toEqual({ visited: [], current: null });
    data.set('parcours-progress', '{"epic":{"visited":12,"current":null}}');
    expect(getEpicProgress('epic')).toEqual({ visited: [], current: null });
    expect(data.get('parcours-progress')).toContain('"visited":12');
    expect(console.warn).toHaveBeenCalled();
  });

  it('recharge le pseudo et le son importés via l’API existante', () => {
    importLocalData(JSON.stringify({
      format: BACKUP_FORMAT, version: 1,
      entries: { player: '{"name":"Grace"}', preferences: '{"sound":false}' },
    }));
    expect(loadPreferences()).toBe(true);
    expect(state.preferences).toEqual({ pseudo: 'Grace', sound: false });
  });
});
