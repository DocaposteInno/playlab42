/** @jest-environment jsdom */

import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';

describe('Particle Life : interface de simulation', () => {
  let app;

  beforeAll(async () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    document.body.innerHTML = new DOMParser().parseFromString(html, 'text/html').body.innerHTML;
    jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({});
    jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    Object.defineProperty(document, 'readyState', { configurable: true, value: 'complete' });
    app = await import('../src/main.js');
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('synchronise le libellé et l’état accessible de pause', () => {
    const button = document.getElementById('playBtn');
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.textContent).toBe('Reprendre');
    button.click();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toContain('pause');
  });

  test('nomme chaque attraction et modifie la valeur du moteur depuis le curseur', () => {
    const slider = document.querySelector('[data-from="0"][data-to="1"]');
    expect(slider.getAttribute('aria-label')).toBe('Attraction du groupe 1 vers le groupe 2');
    slider.value = '0.7';
    slider.dispatchEvent(new Event('input'));
    expect(app.simulation.getAttractions()[0][1]).toBe(0.7);
    expect(slider.title).toBe('0.7');
  });

  test('rafraîchit la matrice visible après une nouvelle génération aléatoire', () => {
    const randomize = jest.spyOn(app.simulation, 'randomizeAttractions').mockImplementation(() => {
      app.simulation.setAttraction(0, 1, -0.8);
    });
    document.getElementById('randomBtn').click();
    expect(randomize).toHaveBeenCalledTimes(1);
    expect(document.querySelector('[data-from="0"][data-to="1"]').value).toBe('-0.8');
  });
});
