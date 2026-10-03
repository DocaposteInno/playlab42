/**
 * @jest-environment jsdom
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { ParcoursUI } from '../ParcoursUI.js';
import { ParcoursViewer } from '../../parcours-viewer.js';

describe('lecteur pédagogique éditorial', () => {
  let ui;
  let index;
  const slides = ['a', 'b', 'c'].map(id => ({ id, title: `Étape ${id}`, path: [] }));
  const visited = new Set(['a']);

  beforeEach(() => {
    document.body.innerHTML = '<div id="reader"></div>';
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 1024 });
    index = 0;
    ui = new ParcoursUI(document.getElementById('reader'), {
      title: 'Un parcours', path: 'parcours/epics/test', duration: '20 min', structure: slides.map(slide => ({ ...slide, type: 'slide' })),
    }, slides, { isVisited: id => visited.has(id) },
    { getCurrentIndex: () => index, getCurrentSlide: () => slides[index] });
    ui.render();
  });

  it('distingue la position de lecture de la progression réellement parcourue', () => {
    index = 2;
    ui.updateUI();
    expect(ui.el.progressText.textContent).toBe('Étape 3 sur 3');
    expect(ui.el.progressSummary.textContent).toBe('1 parcourue · 33 %');
    expect(ui.el.progressFill.parentElement.getAttribute('aria-valuenow')).toBe('33');
    expect(ui.el.slideFrame.title).toBe('Étape c');
    expect(ui.el.menu.querySelector('[aria-current="page"] .pv-menu-item').getAttribute('aria-current')).toBe('page');
    expect(document.querySelector('.pv-plan-summary').textContent).toBe('20 min · 3 étapes');
  });

  it('rend le plan mobile accessible puis restitue le focus à sa fermeture', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    ui.toggleMenu(true);
    expect(document.activeElement).toBe(ui.el.btnCloseMenu);
    ui.toggleMenu(false);
    expect(document.activeElement).toBe(ui.el.btnMenu);
    expect(ui.el.sidebar.getAttribute('aria-hidden')).toBe('true');
  });

  it('échappe les titres, icônes et IDs du plan', () => {
    const markup = ui.buildMenuHTML([{ type: 'slide', id: 'x" onclick="bad', title: '<script>bad</script>', icon: '<img>' }]);
    expect(markup).not.toContain('<script>');
    expect(markup).not.toContain('<img>');
    expect(markup).toContain('&quot;');
  });

  it('boucle le clavier dans le plan mobile sans atteindre les commandes masquées', () => {
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const viewer = new ParcoursViewer(document.getElementById('reader'));
    viewer.ui = ui;
    ui.toggleMenu(true);
    const buttons = [...ui.el.sidebar.querySelectorAll('button')];
    buttons.forEach(button => { button.getClientRects = () => [{ width: 44, height: 44 }]; });
    const last = buttons[buttons.length - 1];
    const preventDefault = jest.fn();
    last.focus();
    viewer.handleKeydown({ key: 'Tab', target: last, preventDefault });
    expect(document.activeElement).toBe(buttons[0]);
    viewer.handleKeydown({ key: 'Tab', shiftKey: true, target: buttons[0], preventDefault });
    expect(document.activeElement).toBe(last);
    ui.el.btnNext.focus();
    viewer.handleKeydown({ key: 'Tab', shiftKey: true, target: ui.el.btnNext, preventDefault });
    expect(document.activeElement).toBe(last);
    expect(preventDefault).toHaveBeenCalledTimes(3);
    viewer.handleKeydown({ key: 'Tab', ctrlKey: true, target: last, preventDefault });
    viewer.handleKeydown({ key: 'Tab', metaKey: true, target: last, preventDefault });
    expect(preventDefault).toHaveBeenCalledTimes(3);
  });

  it('ne détourne pas les flèches dans les champs et ferme le plan avant le lecteur', () => {
    const viewer = new ParcoursViewer(document.getElementById('reader'));
    viewer.ui = ui;
    viewer.next = jest.fn();
    viewer.close = jest.fn();
    const input = document.createElement('input');
    viewer.handleKeydown({ key: 'ArrowRight', target: input });
    expect(viewer.next).not.toHaveBeenCalled();
    ui.toggleMenu(true);
    viewer.handleKeydown({ key: 'Escape', target: ui.el.btnMenu, preventDefault: jest.fn() });
    expect(ui.menuOpen).toBe(false);
    expect(viewer.close).not.toHaveBeenCalled();
    viewer.handleKeydown({ key: 'Escape', target: ui.el.btnMenu, preventDefault: jest.fn() });
    expect(viewer.close).toHaveBeenCalled();
  });
});
