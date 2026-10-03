/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { PianoController } from './PianoController.js';

describe('Piano : retour audio explicite', () => {
  test('un relâchement pendant le démarrage ne produit pas un événement tardif', async () => {
    let ready;
    const synthManager = {
      noteOn: jest.fn(() => new Promise((resolve) => { ready = resolve; })),
      noteOff: jest.fn(),
    };
    const key = document.createElement('button');
    const controller = new PianoController({}, { synthManager });
    const on = jest.fn();
    controller.on('note-on', on);
    const pending = controller.playNote('C4', key);
    controller.stopNote('C4', key);
    ready();
    await pending;
    expect(on).not.toHaveBeenCalled();
    expect(key.getAttribute('aria-pressed')).toBe('false');
  });

  test('annonce un rejet audio sans annoncer une note jouee ni casser le relachement', async () => {
    const error = new Error('Impossible de charger Tone.js');
    const synthManager = {
      noteOn: jest.fn().mockRejectedValue(error),
      noteOff: jest.fn(),
    };
    const noteDisplay = document.createElement('div');
    const key = document.createElement('button');
    const controller = new PianoController({ noteDisplay }, { synthManager });
    const noteOn = jest.fn();
    controller.on('note-on', noteOn);
    const logged = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      await controller.playNote('C4', key);
      expect(noteDisplay.textContent).toBe('Audio indisponible : Impossible de charger Tone.js');
      expect(logged).toHaveBeenCalledWith('Erreur lecture audio du piano:', error);
      expect(noteOn).not.toHaveBeenCalled();
      expect(key.getAttribute('aria-pressed')).toBe('true');
      controller.stopNote('C4', key);
      expect(key.getAttribute('aria-pressed')).toBe('false');
      expect(synthManager.noteOff).toHaveBeenCalledWith('C4');
    } finally {
      logged.mockRestore();
    }
  });

  test('conserve la lecture et son evenement lorsque le moteur audio reussit', async () => {
    const synthManager = { noteOn: jest.fn().mockResolvedValue(undefined) };
    const noteDisplay = document.createElement('div');
    const controller = new PianoController({ noteDisplay }, { synthManager });
    const noteOn = jest.fn();
    controller.on('note-on', noteOn);
    await controller.playNote('C4');
    expect(synthManager.noteOn).toHaveBeenCalledWith('C4');
    expect(noteOn).toHaveBeenCalledWith({ note: 'C4' });
    expect(noteDisplay.textContent).not.toContain('indisponible');
  });
});
