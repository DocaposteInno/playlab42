/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { MenuController } from '../src/controllers/MenuController.js';
import { PianoController } from '../src/controllers/PianoController.js';
import { RhythmController } from '../src/controllers/RhythmController.js';

describe('Commandes accessibles de Diese & Mat', () => {
  test('TAP accepte Entrée, Espace et activation accessible sans doubler le raccourci global', () => {
    document.body.innerHTML = '<div id="rhythm"></div>';
    const rhythm = new RhythmController();
    rhythm._handleTap = jest.fn();
    rhythm.show({
      tempo: 120,
      beatsPerMeasure: 4,
      pattern: [{ startBeat: 0, duration: 'quarter' }],
    }, document.getElementById('rhythm'));
    const tap = document.getElementById('rhythm-tap-zone');
    const globalShortcut = jest.fn();
    document.addEventListener('keydown', globalShortcut);
    expect(tap.tagName).toBe('BUTTON');
    tap.focus();
    for (const key of ['Enter', ' ']) {
      tap.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
    }
    tap.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', repeat: true, bubbles: true }));
    expect(globalShortcut).not.toHaveBeenCalled();
    expect(rhythm._handleTap).toHaveBeenCalledTimes(2);
    tap.click();
    expect(rhythm._handleTap).toHaveBeenCalledTimes(3);
    document.removeEventListener('keydown', globalShortcut);
    rhythm.dispose();
  });

  test('les filtres gardent le focus et les cartes natives ne déclenchent qu’un événement', () => {
    document.body.innerHTML = '<div id="menu"></div>';
    const menu = new MenuController({
      container: document.getElementById('menu'),
      exercises: [
        { id: 'notes', title: 'Lire les notes', description: 'Exercice', category: 'notes', difficulty: 1 },
        { id: 'locked', title: 'Exercice verrouillé', description: 'Exercice', category: 'notes', difficulty: 2 },
      ],
      isUnlocked: id => id !== 'locked',
    });
    const onSelected = jest.fn();
    menu.on('exercise-selected', onSelected);
    menu.render();
    const category = document.querySelector('[data-filter="category"] [data-value="notes"]');
    category.focus();
    category.click();
    expect(document.activeElement.dataset.value).toBe('notes');
    expect(document.activeElement.getAttribute('aria-pressed')).toBe('true');
    menu.refresh();
    menu.refresh();
    const card = document.querySelector('[data-exercise-id="notes"]');
    expect(card.tagName).toBe('BUTTON');
    card.click();
    expect(onSelected).toHaveBeenCalledTimes(1);
    expect(onSelected).toHaveBeenCalledWith({ exerciseId: 'notes' });
    const locked = document.querySelector('[data-exercise-id="locked"]');
    expect(locked.disabled).toBe(true);
    locked.click();
    expect(onSelected).toHaveBeenCalledTimes(1);
    menu.dispose();
  });

  test('toutes les touches du piano sont nommées et jouent avec Entrée ou Espace, même sans raccourci AZERTY', async () => {
    document.body.innerHTML = '<div id="keyboard"></div>';
    const synthManager = { noteOn: jest.fn(), noteOff: jest.fn(), stopAllNotes: jest.fn() };
    const piano = new PianoController({ keyboard: document.getElementById('keyboard') }, { synthManager });
    piano._buildKeyboard();
    const keys = [...document.querySelectorAll('.piano-key')];
    expect(keys).toHaveLength(24);
    expect(keys.every(key => key.tagName === 'BUTTON' && key.getAttribute('aria-label'))).toBe(true);
    const key = document.querySelector('[data-note="F#5"]');
    for (const activation of ['Enter', ' ']) {
      key.focus();
      key.dispatchEvent(new KeyboardEvent('keydown', { key: activation, bubbles: true, cancelable: true }));
      expect(synthManager.noteOn).toHaveBeenLastCalledWith('F#5');
      expect(key.getAttribute('aria-pressed')).toBe('true');
      key.dispatchEvent(new KeyboardEvent('keyup', { key: activation, bubbles: true, cancelable: true }));
      expect(synthManager.noteOff).toHaveBeenLastCalledWith('F#5');
      expect(key.getAttribute('aria-pressed')).toBe('false');
    }
    await Promise.resolve();
    piano.dispose();
  });
});
