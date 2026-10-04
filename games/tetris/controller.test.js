/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { TetrisController } from './controller.js';
import { TetrisRecords, isRecordData } from './records.js';
import { formatTime, formatClearLabel } from './renderer.js';

const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

describe('Neon Stack : parcours utilisateur', () => {
  let controller;
  let kit;
  let audio;
  let renderer;
  let frames;
  let frameSequence;

  beforeEach(() => {
    document.documentElement.innerHTML = html.replace(/<!doctype html>/i, '');
    frames = new Map();
    frameSequence = 0;
    window.requestAnimationFrame = jest.fn(callback => {
      frames.set(++frameSequence, callback);
      return frameSequence;
    });
    window.cancelAnimationFrame = jest.fn(id => frames.delete(id));
    kit = {
      init: jest.fn(), loadProgress: jest.fn(() => null),
      saveProgress: jest.fn(() => true), saveScore: jest.fn(() => true),
      isSoundEnabled: jest.fn(() => true), quit: jest.fn(),
    };
    audio = {
      enabled: false, play: jest.fn(), dispose: jest.fn(),
      setEnabled: jest.fn(value => { audio.enabled = value; return value; }),
    };
    renderer = { draw: jest.fn() };
    controller = new TetrisController({ document, window, kit, renderer, audio });
  });

  afterEach(() => controller.dispose());

  function click(id) { document.getElementById(id).click(); }
  function key(code, target = document.activeElement, repeat = false) {
    const event = new KeyboardEvent('keydown', { code, bubbles: true, cancelable: true, repeat });
    target.dispatchEvent(event);
    return event;
  }
  function advance(timestamp) {
    const [id, callback] = frames.entries().next().value;
    frames.delete(id);
    callback(timestamp);
  }

  it('présente les trois modes puis démarre le mode sélectionné avec focus grille', () => {
    expect(controller.running).toBe(false);
    expect(document.getElementById('overlay').hidden).toBe(false);
    expect(kit.init).toHaveBeenCalledWith('tetris');
    document.querySelector('[value="sprint"]').checked = true;
    click('start');
    expect(controller.state.mode).toBe('sprint');
    expect(controller.running).toBe(true);
    expect(document.activeElement.id).toBe('board');
    expect(document.getElementById('overlay').hidden).toBe(true);
    expect(document.getElementById('progress').getAttribute('aria-valuemax')).toBe('40');
  });

  it('déplace, tourne, réserve et pose une pièce avec les vrais contrôles', () => {
    controller.start(17);
    const x = controller.state.active.x;
    key('ArrowLeft');
    expect(controller.state.active.x).toBe(x - 1);
    key('ArrowUp');
    key('KeyC');
    expect(controller.state.hold).not.toBeNull();
    expect(controller.state.canHold).toBe(false);
    const held = controller.state.hold;
    key('KeyC');
    expect(controller.state.hold).toBe(held);
    key('Space');
    expect(controller.state.piecesPlaced).toBe(1);
    expect(controller.state.score).toBeGreaterThan(0);
    expect(controller.state.canHold).toBe(true);
  });

  it('répète les déplacements à partir du temps simulé et ignore la répétition OS', () => {
    controller.start(17);
    key('ArrowLeft');
    const x = controller.state.active.x;
    key('ArrowLeft', document.activeElement, true);
    expect(controller.state.active.x).toBe(x);
    advance(0);
    advance(100);
    expect(controller.state.active.x).toBe(x);
    advance(200);
    expect(controller.state.active.x).toBeLessThan(x);
    document.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowLeft' }));
    expect(controller.held.size).toBe(0);
  });

  it('gèle le temps en pause, relâche les touches et reprend explicitement avec P', () => {
    click('start');
    advance(0);
    advance(100);
    key('ArrowRight');
    const elapsed = controller.state.elapsed;
    key('KeyP');
    expect(controller.running).toBe(false);
    expect(controller.held.size).toBe(0);
    expect(frames.size).toBe(0);
    expect(document.activeElement.id).toBe('resume');
    expect(controller.state.elapsed).toBe(elapsed);
    key('KeyP');
    expect(controller.running).toBe(true);
    advance(10000);
    expect(controller.state.elapsed).toBe(elapsed);
    advance(10100);
    expect(controller.state.elapsed).toBeGreaterThan(elapsed);
  });

  it('perte de focus et pause du portail ne reprennent jamais automatiquement', () => {
    click('start');
    window.dispatchEvent(new Event('blur'));
    expect(controller.running).toBe(false);
    window.onGameResume();
    expect(controller.running).toBe(false);
    click('resume');
    window.onGamePause();
    expect(controller.running).toBe(false);
  });

  it('une longue interruption de rendu produit une pause au lieu de sauter le temps', () => {
    click('start');
    advance(0);
    advance(1000);
    expect(controller.running).toBe(false);
    expect(controller.state.elapsed).toBe(0);
  });

  it('permet de reprendre après ouverture du menu sans perdre la partie', () => {
    click('start');
    key('Space');
    const state = controller.state;
    click('menu');
    expect(controller.running).toBe(false);
    expect(document.getElementById('modes').hidden).toBe(false);
    click('resume');
    expect(controller.state).toBe(state);
    expect(controller.running).toBe(true);
  });

  it('les boutons tactiles capturent, répètent puis relâchent les pointeurs', () => {
    controller.start(17);
    const button = document.querySelector('[data-action="left"]');
    const pointer = new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0 });
    Object.defineProperty(pointer, 'pointerId', { value: 3 });
    const x = controller.state.active.x;
    button.dispatchEvent(pointer);
    expect(controller.state.active.x).toBe(x - 1);
    expect(controller.held.has('pointer:3')).toBe(true);
    const cancel = new Event('pointercancel');
    Object.defineProperty(cancel, 'pointerId', { value: 3 });
    button.dispatchEvent(cancel);
    expect(controller.held.size).toBe(0);
  });

  it('les activations clavier des boutons ne posent pas une pièce supplémentaire', () => {
    click('start');
    const button = document.querySelector('[data-action="hardDrop"]');
    button.focus();
    expect(key('Space', button).defaultPrevented).toBe(false);
    expect(controller.state.piecesPlaced).toBe(0);
    button.click();
    expect(controller.state.piecesPlaced).toBe(1);
  });

  it('affiche le bilan terminal et ne sauvegarde pas deux fois', () => {
    controller.start(17);
    for (let i = 0; i < 100 && controller.running; i++) { controller.act('hardDrop'); }
    expect(controller.state.gameOver).toBe(true);
    expect(controller.running).toBe(false);
    expect(document.getElementById('overlay').hidden).toBe(false);
    expect(document.getElementById('resume').hidden).toBe(true);
    expect(kit.saveScore).toHaveBeenCalledTimes(1);
    controller.act('hardDrop');
    expect(kit.saveScore).toHaveBeenCalledTimes(1);
  });

  it('annonce les T-spins sans ligne, pas uniquement les effacements', () => {
    controller.start(17);
    controller.state = {
      ...controller.state,
      active: { type: 'T', x: 3, y: 15, rotation: 0 },
      board: Array.from({ length: 20 }, () => Array(10).fill(null)),
    };
    controller.state.board[17][3] = 'J';
    controller.state.board[19][3] = 'J';
    controller.state.board[19][5] = 'J';
    controller.act('rotateCW');
    controller.act('hardDrop');
    expect(document.getElementById('announcement').textContent).toContain('T-spin mini · +100 points');
  });

  it('la simulation termine Ultra exactement à 120 secondes et présente son bilan', () => {
    document.querySelector('[value="ultra"]').checked = true;
    controller.start(17);
    controller.state = { ...controller.state, elapsed: 119995 };
    advance(0);
    advance(20);
    expect(controller.state.elapsed).toBe(120000);
    expect(controller.running).toBe(false);
    expect(document.getElementById('overlay-title').textContent).toBe('Temps écoulé.');
    expect(document.getElementById('time').textContent).toBe('00:00.00');
    expect(kit.saveScore).toHaveBeenCalledTimes(1);
  });

  it('présente le temps victorieux du Sprint sans le publier comme score descendant', () => {
    document.querySelector('[value="sprint"]').checked = true;
    controller.start(17);
    const board = Array.from({ length: 20 }, () => Array(10).fill(null));
    for (let y = 16; y < 20; y++) {
      board[y].fill('J');
      board[y][5] = null;
    }
    controller.state = {
      ...controller.state, board, lines: 36, level: 4, elapsed: 54321,
      active: { type: 'I', rotation: 1, x: 3, y: 16 },
    };
    controller.act('hardDrop');
    expect(controller.state.gameOver).toBe(true);
    expect(document.getElementById('overlay-title').textContent).toBe('40 lignes.\nBien joué.');
    expect(document.getElementById('record').textContent).toBe('00:54.32');
    expect(kit.saveScore).not.toHaveBeenCalled();
    expect(kit.saveProgress).toHaveBeenCalledWith(expect.objectContaining({ sprint: 54321 }));
  });

  it('montre une erreur visible quand un record ne peut pas être sauvegardé', () => {
    kit.saveProgress.mockReturnValue(false);
    kit.saveScore.mockReturnValue(false);
    controller.start(17);
    for (let i = 0; i < 100 && controller.running; i++) { controller.act('hardDrop'); }
    const notice = document.getElementById('storage-notice');
    expect(notice.hidden).toBe(false);
    expect(notice.textContent).toContain('stockage est indisponible');
  });

  it('active le son seulement par geste et respecte le portail', () => {
    expect(audio.setEnabled).not.toHaveBeenCalled();
    click('sound');
    expect(audio.enabled).toBe(true);
    expect(document.getElementById('sound').getAttribute('aria-pressed')).toBe('true');
    window.onSoundChange(false);
    expect(audio.enabled).toBe(false);
    kit.isSoundEnabled.mockReturnValue(false);
    click('sound');
    expect(audio.enabled).toBe(false);
    expect(document.getElementById('storage-notice').textContent).toContain('préférences du portail');
  });

  it('libère animation, audio, entrées et hooks lors du démontage', () => {
    click('start');
    const state = controller.state;
    window.onGameDispose();
    expect(controller.disposed).toBe(true);
    expect(frames.size).toBe(0);
    expect(audio.dispose).toHaveBeenCalledTimes(1);
    key('Space', document.getElementById('board'));
    click('start');
    expect(controller.state).toBe(state);
    expect(window.onGamePause).toBeUndefined();
  });
});

describe('Records et chronomètre', () => {
  it('formate les centièmes et ne produit jamais de durée négative', () => {
    expect(formatTime(61239)).toBe('01:01.23');
    expect(formatTime(-10)).toBe('00:00.00');
  });

  it('localise les clears tout en conservant les noms usuels de T-spins', () => {
    expect(formatClearLabel('Single')).toBe('Ligne simple');
    expect(formatClearLabel('Tetris')).toBe('Quatre lignes');
    expect(formatClearLabel('T-spin mini Single')).toBe('T-spin mini simple');
  });

  it('valide le schéma et refuse les records corrompus', () => {
    expect(isRecordData({ version: 1, marathon: 0, sprint: 1, ultra: null })).toBe(true);
    for (const value of [null, {}, { version: 1 }, { version: 1, marathon: -1, sprint: null, ultra: null }]) {
      expect(isRecordData(value)).toBe(false);
    }
  });

  it('garde le Sprint le plus rapide et ignore les parties perdues', () => {
    const kit = {
      loadProgress: () => ({ version: 1, marathon: 50, sprint: 90000, ultra: 80 }),
      saveProgress: jest.fn(() => true), saveScore: jest.fn(() => true),
    };
    const records = new TetrisRecords(kit, jest.fn());
    expect(records.finish({ mode: 'sprint', elapsed: 80000, lines: 39, score: 9000 })).toBe(false);
    expect(records.get('sprint')).toBe(90000);
    expect(records.finish({ mode: 'sprint', elapsed: 95000, lines: 40, score: 9000 })).toBe(false);
    expect(records.finish({ mode: 'sprint', elapsed: 80000, lines: 40, score: 500 })).toBe(true);
    expect(records.get('sprint')).toBe(80000);
    expect(records.get('marathon')).toBe(50);
    expect(records.get('ultra')).toBe(80);
    expect(kit.saveScore).not.toHaveBeenCalled();
  });
});
