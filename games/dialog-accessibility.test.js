/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { observeDialog } from './dialog-accessibility.js';

describe('Focus des modales de jeux', () => {
  test('reprend le focus si la transition commence apres le premier RAF, sans le voler ensuite', async () => {
    document.body.innerHTML = '<button id="open">Ouvrir</button><div id="overlay" style="visibility: hidden"><button id="close">Fermer</button><button id="last">Confirmer</button></div>';
    const overlay = document.getElementById('overlay');
    const trigger = document.getElementById('open');
    let render;
    const animation = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      render = callback;
      return 1;
    });
    const cleanup = observeDialog(overlay, { openClass: 'visible', onClose: () => {} });
    try {
      trigger.focus();
      overlay.classList.add('visible');
      await Promise.resolve();
      render();
      expect(document.activeElement).toBe(trigger);
      overlay.style.visibility = 'visible';
      overlay.dispatchEvent(new Event('transitionstart'));
      expect(document.activeElement).toBe(document.getElementById('close'));
      document.getElementById('last').focus();
      overlay.dispatchEvent(new Event('transitionend'));
      expect(document.activeElement).toBe(document.getElementById('last'));
    } finally {
      cleanup();
      animation.mockRestore();
    }
  });

  test('une fermeture avant la transition annule le focus differe', async () => {
    document.body.innerHTML = '<button id="open">Ouvrir</button><div id="overlay" style="visibility: hidden"><button id="close">Fermer</button></div>';
    const overlay = document.getElementById('overlay');
    const trigger = document.getElementById('open');
    let render;
    const animation = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      render = callback;
      return 1;
    });
    const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const cleanup = observeDialog(overlay, { openClass: 'visible', onClose: () => {} });
    try {
      trigger.focus();
      overlay.classList.add('visible');
      await Promise.resolve();
      overlay.classList.remove('visible');
      await Promise.resolve();
      expect(cancel).toHaveBeenCalledWith(1);
      overlay.style.visibility = 'visible';
      overlay.dispatchEvent(new Event('transitionend'));
      render();
      expect(document.activeElement).toBe(trigger);
    } finally {
      cleanup();
      animation.mockRestore();
      cancel.mockRestore();
    }
  });

  test('attend le premier rendu lorsque visibility est encore en transition', async () => {
    document.body.innerHTML = '<button id="open">Ouvrir</button><div id="overlay" style="visibility: hidden"><button id="close">Fermer</button></div>';
    const overlay = document.getElementById('overlay');
    const trigger = document.getElementById('open');
    let render;
    const animation = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
      render = callback;
      return 1;
    });
    const cleanup = observeDialog(overlay, { openClass: 'visible', onClose: () => {} });
    try {
      trigger.focus();
      overlay.classList.add('visible');
      await Promise.resolve();
      expect(document.activeElement).toBe(trigger);
      overlay.style.visibility = 'visible';
      render();
      expect(document.activeElement).toBe(document.getElementById('close'));
    } finally {
      cleanup();
      animation.mockRestore();
    }
  });

  test('les contrôles dans une section masquée ne participent pas à la boucle Tab', async () => {
    document.body.innerHTML = '<div id="overlay"><div style="display: none"><button>Masqué</button></div><button id="visible">Visible</button><div style="display: none"><button>Masqué aussi</button></div></div>';
    const overlay = document.getElementById('overlay');
    const visible = document.getElementById('visible');
    const cleanup = observeDialog(overlay, { openClass: 'visible', onClose: () => {} });
    overlay.classList.add('visible');
    await Promise.resolve();
    expect(document.activeElement).toBe(visible);
    visible.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
    expect(document.activeElement).toBe(visible);
    cleanup();
  });

  test('ouverture, boucle Tab, Échap et retour au bouton déclencheur', async () => {
    document.body.innerHTML = '<button id="open">Ouvrir</button><div id="overlay"><button id="first">Fermer</button><button id="last">Confirmer</button></div>';
    const overlay = document.getElementById('overlay');
    const trigger = document.getElementById('open');
    const first = document.getElementById('first');
    const last = document.getElementById('last');
    const cleanup = observeDialog(overlay, {
      openClass: 'visible',
      onClose: () => overlay.classList.remove('visible'),
    });
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    trigger.focus();
    overlay.classList.add('visible');
    await Promise.resolve();
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }));
    expect(document.activeElement).toBe(last);
    last.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(first);
    first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await Promise.resolve();
    expect(document.activeElement).toBe(trigger);
    expect(overlay.getAttribute('aria-hidden')).toBe('true');
    cleanup();
  });
});
