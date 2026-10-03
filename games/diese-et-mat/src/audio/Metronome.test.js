import { jest } from '@jest/globals';
import { Metronome } from './Metronome.js';

describe('Métronome : cycle de vie asynchrone', () => {
  test('start-stop-start conserve la derniere demande et un seul intervalle', async () => {
    jest.useFakeTimers();
    const metronome = new Metronome({});
    const pending = [];
    metronome._initClickSynth = jest.fn(() => new Promise(resolve => pending.push(resolve)));
    const tick = jest.spyOn(metronome, '_tick').mockImplementation(() => {});
    try {
      const first = metronome.start();
      metronome.stop();
      const latest = metronome.start();
      expect(latest).not.toBe(first);
      pending[0]();
      await first;
      expect(metronome.start()).toBe(latest);
      expect(metronome.playing).toBe(false);
      pending[1]();
      await latest;
      expect(metronome.playing).toBe(true);
      expect(tick).toHaveBeenCalledTimes(1);
      expect(jest.getTimerCount()).toBe(1);
      metronome.dispose();
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      metronome.dispose();
      jest.useRealTimers();
    }
  });

  test('stop avant initialisation interdit le démarrage différé', async () => {
    const metronome = new Metronome({});
    let ready;
    metronome._initClickSynth = jest.fn(() => new Promise((resolve) => { ready = resolve; }));
    const tick = jest.spyOn(metronome, '_tick');
    const first = metronome.start();
    expect(metronome.start()).toBe(first);
    metronome.stop();
    ready();
    await first;
    expect(metronome.playing).toBe(false);
    expect(metronome._intervalId).toBeNull();
    expect(tick).not.toHaveBeenCalled();
  });

  test('dispose pendant le démarrage interdit de créer un click synth', async () => {
    let ready;
    const Synth = jest.fn();
    const audio = {
      started: false,
      start: () => new Promise((resolve) => { ready = resolve; }),
      Tone: { Synth },
    };
    const metronome = new Metronome(audio);
    const pending = metronome.start();
    metronome.dispose();
    ready();
    await pending;
    expect(Synth).not.toHaveBeenCalled();
    expect(metronome.playing).toBe(false);
  });
});
