import { jest } from '@jest/globals';
import { AudioEngine } from './AudioEngine.js';

describe('AudioEngine : un seul démarrage et destruction définitive', () => {
  test('deux démarrages partagent la même initialisation et le même synthétiseur', async () => {
    const engine = new AudioEngine();
    let ready;
    engine.ready = true;
    engine.Tone = { start: jest.fn(() => new Promise((resolve) => { ready = resolve; })) };
    engine._createEffectsChain = jest.fn().mockResolvedValue();
    engine._createSynth = jest.fn();
    const first = engine.start();
    expect(engine.start()).toBe(first);
    ready();
    await first;
    expect(engine.Tone.start).toHaveBeenCalledTimes(1);
    expect(engine._createSynth).toHaveBeenCalledTimes(1);
    expect(engine.started).toBe(true);
    engine.dispose();
  });

  test('détruire pendant Tone.start ne recrée pas les effets', async () => {
    const engine = new AudioEngine();
    let ready;
    engine.ready = true;
    engine.Tone = { start: () => new Promise((resolve) => { ready = resolve; }) };
    engine._createEffectsChain = jest.fn();
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const pending = engine.start();
      engine.dispose();
      ready();
      await expect(pending).rejects.toThrow('Moteur audio détruit');
      expect(engine._createEffectsChain).not.toHaveBeenCalled();
      expect(engine.started).toBe(false);
      expect(engine.Tone).toBeNull();
      await expect(engine.start()).rejects.toThrow('Moteur audio détruit');
    } finally {
      logged.mockRestore();
    }
  });

  test('un échec pendant les effets nettoie les ressources partielles', async () => {
    const engine = new AudioEngine();
    engine.ready = true;
    engine.Tone = { start: jest.fn().mockResolvedValue() };
    const filter = { dispose: jest.fn() };
    engine._createEffectsChain = jest.fn(() => {
      engine.effects.filter = filter;
      throw new Error('reverb indisponible');
    });
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await expect(engine.start()).rejects.toThrow('reverb indisponible');
      expect(filter.dispose).toHaveBeenCalledTimes(1);
      expect(engine.effects.filter).toBeNull();
      engine._createEffectsChain.mockResolvedValueOnce();
      engine._createSynth = jest.fn();
      await engine.start();
      expect(engine.started).toBe(true);
      engine.dispose();
    } finally {
      logged.mockRestore();
    }
  });
});
