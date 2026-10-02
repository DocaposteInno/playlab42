/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { RhythmController } from './RhythmController.js';

describe('Rythme : annulation du démarrage', () => {
  test('fermer pendant le démarrage audio ne lance pas de compte à rebours', async () => {
    let ready;
    const controller = new RhythmController({
      ensureAudioReady: () => new Promise((resolve) => { ready = resolve; }),
    });
    controller._state = { tempo: 120, beatsPerMeasure: 4 };
    const countdown = jest.spyOn(controller, '_countdown');
    const pending = controller.start();
    controller.dispose();
    ready();
    await pending;
    expect(countdown).not.toHaveBeenCalled();
  });

  test('arrêter le compte à rebours annule ses délais', () => {
    jest.useFakeTimers();
    try {
      const controller = new RhythmController();
      controller._state = { beatDuration: 100 };
      controller._countdown(3);
      expect(jest.getTimerCount()).toBe(1);
      controller.stop();
      expect(jest.getTimerCount()).toBe(0);
      jest.runAllTimers();
    } finally {
      jest.useRealTimers();
    }
  });
});
