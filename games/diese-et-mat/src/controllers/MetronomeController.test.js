/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { MetronomeController } from './MetronomeController.js';

describe('Contrôle du métronome pendant le démarrage audio', () => {
  test('fermer avant que l’audio soit prêt ne lance pas le métronome', async () => {
    let ready;
    const controller = new MetronomeController({}, {
      ensureAudioReady: () => new Promise((resolve) => { ready = resolve; }),
    });
    const create = jest.spyOn(controller, '_createMetronome').mockImplementation(() => {});
    const start = controller.start();
    controller.hide();
    ready();
    await start;
    expect(controller.playing).toBe(false);
    expect(controller._playRequest).toBeNull();
    controller.dispose();
    create.mockRestore();
  });

  test('détruire pendant la préparation ne recrée pas une instance', async () => {
    let ready;
    const controller = new MetronomeController({}, {
      ensureAudioReady: () => new Promise((resolve) => { ready = resolve; }),
    });
    const create = jest.spyOn(controller, '_createMetronome');
    const pending = controller.ensureReady();
    controller.dispose();
    ready();
    expect(await pending).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });
});
