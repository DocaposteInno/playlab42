/** @jest-environment jsdom */
import { observeDialog } from './dialog-accessibility.js';

describe('Focus des modales de jeux', () => {
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
