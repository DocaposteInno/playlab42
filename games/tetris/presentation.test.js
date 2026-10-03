/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { TetrisAudio } from './audio.js';
import { TetrisRenderer } from './renderer.js';
import { TetrisEngine } from './engine.js';

describe('Rendu haute densité', () => {
  it('dessine la grille, la projection et les aperçus sans modifier le moteur', () => {
    const contexts = [];
    const canvases = {};
    for (const id of ['board', 'hold', 'next']) {
      const canvas = document.createElement('canvas');
      const context = {
        setTransform: jest.fn(), clearRect: jest.fn(), fillRect: jest.fn(),
        strokeRect: jest.fn(), save: jest.fn(), restore: jest.fn(),
        beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), stroke: jest.fn(),
      };
      canvas.getContext = () => context;
      contexts.push(context);
      canvases[id] = canvas;
    }
    const engine = new TetrisEngine();
    const state = engine.init({ seed: 42, playerIds: ['human'], mode: 'marathon' });
    const serialized = JSON.stringify(state);
    const originalRatio = window.devicePixelRatio;
    Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: 2 });
    try {
      const renderer = new TetrisRenderer(canvases);
      renderer.draw(state);
      expect(canvases.board.width).toBe(600);
      expect(canvases.board.height).toBe(1200);
      expect(contexts[0].setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
      expect(contexts[0].strokeRect).toHaveBeenCalled();
      expect(contexts[2].fillRect).toHaveBeenCalled();
      expect(canvases.next.getAttribute('aria-label')).toContain(state.queue[0]);
      expect(JSON.stringify(state)).toBe(serialized);
      renderer.draw({ ...state, gameOver: true });
      expect(JSON.stringify(state)).toBe(serialized);
    } finally {
      Object.defineProperty(window, 'devicePixelRatio', { configurable: true, value: originalRatio });
    }
  });

  it('signale explicitement un Canvas 2D indisponible', () => {
    const canvas = document.createElement('canvas');
    canvas.getContext = () => null;
    const renderer = new TetrisRenderer({ board: canvas, hold: canvas, next: canvas });
    const engine = new TetrisEngine();
    expect(() => renderer.draw(engine.init({ seed: 42, playerIds: ['human'] }))).toThrow('Canvas 2D indisponible');
  });
});

describe('Sons synthétisés', () => {
  it('ne crée aucun contexte avant activation, produit des notes courtes et libère les ressources', () => {
    const nodes = [];
    const context = {
      state: 'running', currentTime: 10, destination: {},
      createOscillator: jest.fn(() => {
        const node = {
          frequency: { setValueAtTime: jest.fn() },
          connect: jest.fn(), disconnect: jest.fn(), start: jest.fn(), stop: jest.fn(),
        };
        nodes.push(node);
        return node;
      }),
      createGain: jest.fn(() => ({
        gain: { setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
        connect: jest.fn(), disconnect: jest.fn(),
      })),
      close: jest.fn(() => Promise.resolve()),
    };
    function MockAudioContext() { return context; }
    const AudioContext = jest.fn(MockAudioContext);
    const audio = new TetrisAudio({ AudioContext });
    audio.play('clear');
    expect(AudioContext).not.toHaveBeenCalled();
    expect(audio.setEnabled(true)).toBe(true);
    audio.play('clear');
    expect(nodes).toHaveLength(4);
    expect(nodes[0].start).toHaveBeenCalledWith(10);
    expect(nodes[0].stop).toHaveBeenCalledWith(10.1);
    nodes[0].onended();
    expect(nodes[0].disconnect).toHaveBeenCalled();
    audio.setEnabled(false);
    audio.play('clear');
    expect(nodes).toHaveLength(4);
    audio.dispose();
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(audio.context).toBeNull();
  });

  it('rapporte une capacité audio absente sans prétendre avoir activé le son', () => {
    const audio = new TetrisAudio({});
    expect(audio.setEnabled(true)).toBe(false);
    expect(audio.enabled).toBe(false);
  });

  it('désactive la préférence et notifie un refus de reprise audio', async () => {
    const error = new DOMException('Lecture refusée', 'NotAllowedError');
    const context = { state: 'suspended', resume: () => Promise.reject(error) };
    const browser = { AudioContext: function () { return context; } };
    const notify = jest.fn();
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const audio = new TetrisAudio(browser, notify);
      audio.setEnabled(true);
      await Promise.resolve();
      expect(audio.enabled).toBe(false);
      expect(notify).toHaveBeenCalledWith(expect.stringContaining('refusé'));
    } finally {
      warn.mockRestore();
    }
  });
});
