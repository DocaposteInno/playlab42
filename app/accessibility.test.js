/**
 * @jest-environment jsdom
 *
 * Régressions des parcours clavier et des états accessibles du portail.
 */
import { readFileSync } from 'node:fs';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
document.body.innerHTML = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));

const { state, setState } = await import('./state.js');
const { el } = await import('./dom-cache.js');
const { setupEventListeners } = await import('./events.js');
const { updateTabUI } = await import('./tabs.js');
const { createEpicCardElement } = await import('./parcours.js');
const { showSettings, hideSettings, setSoundPreference, setThemePreference } = await import('./settings.js');
const { loadGame, updateSoundButton } = await import('./game-loader.js');
const { ParcoursViewer } = await import('../lib/parcours-viewer.js');

setupEventListeners();

function key(target, value, modifiers = {}) {
  const event = new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...modifiers });
  target.dispatchEvent(event);
  return event;
}

describe('Accessibilité du portail', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    localStorage.clear();
    setState({
      activeTab: 'parcours', currentView: 'catalogue', activeFilter: '',
      parcoursCategory: null, bookmarkTagFilter: null, catalogue: null,
      parcoursCatalogue: null, bookmarksCatalogue: null, recentGames: [],
      preferences: { sound: true, pseudo: 'Anonyme' },
    });
    el.search.value = '';
    el.viewCatalogue.classList.add('active');
    el.viewSettings.classList.remove('active');
    el.viewGame.classList.remove('active');
    document.body.classList.remove('game-active');
    updateTabUI();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('navigue dans les quatre onglets aux flèches et avec Home/End', () => {
    el.tabParcours.focus();
    expect(key(el.tabParcours, 'ArrowRight').defaultPrevented).toBe(true);
    expect(state.activeTab).toBe('tools');
    expect(document.activeElement).toBe(el.tabTools);
    expect(el.tabTools.getAttribute('aria-selected')).toBe('true');
    expect(el.tabParcours.tabIndex).toBe(-1);
    key(el.tabTools, 'End');
    expect(document.activeElement).toBe(el.tabBookmarks);
    key(el.tabBookmarks, 'ArrowRight');
    expect(document.activeElement).toBe(el.tabParcours);
    key(el.tabParcours, 'ArrowLeft');
    expect(document.activeElement).toBe(el.tabBookmarks);
    key(el.tabBookmarks, 'Home');
    expect(document.activeElement).toBe(el.tabParcours);
    expect([el.tabParcours, el.tabTools, el.tabGames, el.tabBookmarks].filter(tab => tab.tabIndex === 0)).toHaveLength(1);
  });

  it('ne vole pas les caractères de recherche ni les raccourcis du navigateur', () => {
    el.search.focus();
    expect(key(el.search, '/').defaultPrevented).toBe(false);
    expect(key(el.search, '2').defaultPrevented).toBe(false);
    expect(state.activeTab).toBe('parcours');
    el.tabParcours.focus();
    expect(key(el.tabParcours, '/', { ctrlKey: true }).defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(el.tabParcours);
    key(el.tabParcours, '/');
    expect(document.activeElement).toBe(el.search);
  });

  it('préserve aussi la saisie dans une zone editable imbriquée', () => {
    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    editor.setAttribute('contenteditable', 'true');
    editor.innerHTML = '<span>Texte</span>';
    document.body.appendChild(editor);
    expect(key(editor.firstElementChild, '/').defaultPrevented).toBe(false);
    key(editor.firstElementChild, '3');
    expect(state.activeTab).toBe('parcours');
    editor.remove();
  });

  it('rend les parcours comme liens natifs et affiche une progression lisible', () => {
    const epic = {
      id: 'exemple', title: 'Exemple', description: 'Description',
      path: 'parcours/epics/exemple', slideCount: 4, tags: [],
    };
    let card = createEpicCardElement(epic).querySelector('.epic-card');
    expect(card.tagName).toBe('A');
    expect(card.getAttribute('href')).toBe('#/parcours/exemple');
    expect(card.tabIndex).toBe(0);
    expect(card.querySelector('.epic-progress-label').textContent).toBe('Commencer le parcours');
    localStorage.setItem('parcours-progress', JSON.stringify({ exemple: { visited: ['a', 'b'] } }));
    card = createEpicCardElement(epic).querySelector('.epic-card');
    expect(card.querySelector('.epic-progress-label').textContent).toContain('50 %');
    expect(card.classList.contains('in-progress')).toBe(true);
  });

  it('annonce les choix son/thème et restaure le focus à la fermeture', () => {
    el.btnSettings.focus();
    showSettings();
    expect(document.activeElement).toBe(el.inputPseudo);
    setSoundPreference(false);
    expect(el.soundOn.getAttribute('aria-pressed')).toBe('false');
    expect(el.soundOff.getAttribute('aria-pressed')).toBe('true');
    setThemePreference('light');
    expect(el.themeLight.getAttribute('aria-pressed')).toBe('true');
    expect(el.themeSystem.getAttribute('aria-pressed')).toBe('false');
    hideSettings();
    expect(document.activeElement).toBe(el.btnSettings);
  });

  it('nomme le contenu embarqué et annonce le bouton du son', () => {
    loadGame('games/exemple/index.html', 'Jeu exemple', 'game', 'exemple');
    expect(el.gameIframe.title).toBe('Jeu : Jeu exemple');
    state.preferences.sound = false;
    updateSoundButton();
    expect(el.btnSound.getAttribute('aria-label')).toBe('Activer le son');
    expect(el.btnSound.getAttribute('aria-pressed')).toBe('false');
  });

  it('le lien d’évitement déplace le focus sans modifier le routage', () => {
    const hash = window.location.hash;
    document.querySelector('.skip-link').click();
    expect(document.activeElement.id).toBe('main');
    expect(window.location.hash).toBe(hash);
  });

  it('Échap ferme d’abord le plan ouvert automatiquement, pas le parcours', () => {
    const viewer = new ParcoursViewer(el.viewParcours);
    viewer.ui = { menuOpen: true };
    viewer.toggleMenu = jest.fn();
    viewer.close = jest.fn();
    viewer.handleKeydown({ key: 'Escape', target: document.body, preventDefault: jest.fn() });
    expect(viewer.toggleMenu).toHaveBeenCalledWith(false);
    expect(viewer.close).not.toHaveBeenCalled();
  });
});
