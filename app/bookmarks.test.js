/**
 * @jest-environment jsdom
 *
 * Bibliothèque de liens : cartes, navigation, recherche et états de chargement.
 */

import { readFileSync } from 'node:fs';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const state = { bookmarksCatalogue: null, bookmarkTagFilter: null, activeTab: 'bookmarks' };
const el = {};
const originalFetch = globalThis.fetch;
jest.unstable_mockModule('./state.js', () => ({
  state,
  setState: updates => Object.assign(state, updates),
}));
jest.unstable_mockModule('./dom-cache.js', () => ({ el }));

const {
  renderBookmarks, selectBookmarkTag, loadBookmarksCatalogue, showBookmarkPreview, hideBookmarkPreview,
} = await import('./bookmarks.js');

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const templates = ['bookmark-category-template', 'bookmark-item-template']
  .map(id => index.match(new RegExp(`<template id="${id}">[\\s\\S]*?</template>`))[0]).join('');

/**
 * Petit catalogue couvrant les métadonnées éditoriales et enrichies.
 * @returns {Object} Catalogue indépendant pour chaque test
 */
function catalogue() {
  return {
    tags: [{ id: 'ide', count: 1 }, { id: 'cli', count: 1 }],
    categories: [
      {
        id: 'coding-tools', label: 'Outils de Coding IA',
        bookmarks: [{
          title: 'Cursor', displayTitle: 'Cursor — présentation enrichie',
          description: 'Éditeur de code IA-native basé sur VS Code',
          displayDescription: 'Une présentation enrichie pour développer',
          url: 'https://cursor.com', domain: 'cursor.com', tags: ['ide', 'ia-native'],
        }],
      },
      {
        id: 'resources', label: 'Ressources & Formation',
        bookmarks: [{
          title: 'Aider', description: 'Programmation en terminal',
          url: 'https://aider.chat', domain: 'aider.chat', tags: ['cli'],
        }],
      },
    ],
  };
}

beforeEach(() => {
  document.body.innerHTML = `${templates}
    <input id="search"><div id="bookmark-filters"></div>
    <div id="bookmark-tree"></div><p id="empty-bookmarks"></p>
    <p id="catalogue-status"></p><div id="bookmark-preview" class="visible"></div>`;
  Object.assign(el, {
    search: document.getElementById('search'),
    bookmarkFilters: document.getElementById('bookmark-filters'),
    bookmarkTree: document.getElementById('bookmark-tree'),
    emptyBookmarks: document.getElementById('empty-bookmarks'),
    bookmarkPreview: document.getElementById('bookmark-preview'),
  });
  Object.assign(state, { bookmarksCatalogue: catalogue(), bookmarkTagFilter: null, activeTab: 'bookmarks' });
});

afterEach(() => {
  jest.restoreAllMocks();
  globalThis.fetch = originalFetch;
});

describe('bibliothèque de liens', () => {
  it('rend chaque ressource avec son texte utile et un lien externe natif', () => {
    renderBookmarks();
    const links = el.bookmarkTree.querySelectorAll('.bookmark-item a');
    expect(links).toHaveLength(2);
    expect(links[0].href).toBe('https://cursor.com/');
    expect(links[0].target).toBe('_blank');
    expect(links[0].rel).toContain('noopener');
    expect(links[0].querySelector('.bookmark-title').textContent).toBe('Cursor');
    expect(links[0].textContent).toContain('Éditeur de code');
    expect(links[0].textContent).toContain('cursor.com');
    expect(links[0].textContent).toContain('Nouvelle fenêtre');
    expect(links[0].hasAttribute('data-bookmark')).toBe(false);
    expect(el.bookmarkTree.querySelector('.bookmark-icon, .bookmark-category-icon, img')).toBeNull();
    expect(document.getElementById('catalogue-status').textContent).toBe('2 liens');
  });

  it('utilise les métadonnées enrichies et le domaine URL en repli', () => {
    const bookmark = state.bookmarksCatalogue.categories[0].bookmarks[0];
    delete bookmark.title;
    delete bookmark.description;
    delete bookmark.domain;
    renderBookmarks();
    expect(el.bookmarkTree.querySelector('.bookmark-title').textContent).toBe('Cursor — présentation enrichie');
    expect(el.bookmarkTree.querySelector('.bookmark-description').textContent).toContain('présentation enrichie');
    expect(el.bookmarkTree.querySelector('.bookmark-domain').textContent).toBe('cursor.com');
  });

  it('propose des ancres de catégories dont les titres reçoivent le focus', () => {
    renderBookmarks();
    const nav = el.bookmarkTree.querySelector('nav');
    const options = el.bookmarkTree.querySelector('.bookmark-navigation-disclosure');
    expect(options.open).toBe(false);
    options.open = true;
    expect(nav.getAttribute('aria-label')).toBe('Catégories de liens');
    expect(nav.querySelectorAll('a')).toHaveLength(2);
    const link = nav.querySelector('a');
    expect(link.getAttribute('href')).toBe('#bookmark-category-coding-tools-title');
    link.click();
    expect(options.open).toBe(false);
    const heading = document.getElementById('bookmark-category-coding-tools-title');
    expect(document.activeElement).toBe(heading);
    expect(heading.textContent).toContain('1 lien');
    expect(document.getElementById('bookmark-category-coding-tools').getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('cherche tous les mots sans accents, indépendamment de leur ordre', () => {
    el.search.value = '  CODE editeur  ';
    renderBookmarks();
    expect(el.bookmarkTree.querySelectorAll('.bookmark-item')).toHaveLength(1);
    expect(el.bookmarkTree.textContent).toContain('Cursor');
    el.search.value = 'éditeur absent';
    renderBookmarks();
    expect(el.bookmarkTree.querySelectorAll('.bookmark-item')).toHaveLength(0);
  });

  it('recherche aussi dans domaines, tags, catégories et métadonnées enrichies', () => {
    for (const query of ['CURSOR.COM', 'ia-native', 'coding', 'presentation developper']) {
      el.search.value = query;
      renderBookmarks();
      expect(el.bookmarkTree.querySelectorAll('.bookmark-item')).toHaveLength(1);
      expect(el.bookmarkTree.textContent).toContain('Cursor');
    }
  });

  it('combine le tag et la recherche puis remet le tag à zéro', () => {
    selectBookmarkTag('cli');
    expect(el.bookmarkTree.querySelectorAll('.bookmark-item')).toHaveLength(1);
    expect(el.bookmarkFilters.querySelector('[data-tag="cli"]').getAttribute('aria-pressed')).toBe('true');
    el.search.value = 'cursor';
    renderBookmarks();
    expect(el.emptyBookmarks.classList.contains('visible')).toBe(true);
    selectBookmarkTag(null);
    expect(el.bookmarkTree.querySelectorAll('.bookmark-item')).toHaveLength(1);
    expect(el.emptyBookmarks.classList.contains('visible')).toBe(false);
  });

  it('conserve le bouton et le focus pendant le filtre et la recherche', () => {
    renderBookmarks();
    const button = el.bookmarkFilters.querySelector('[data-tag="ide"]');
    button.focus();
    selectBookmarkTag('ide');
    el.search.value = 'code';
    renderBookmarks();
    expect(document.activeElement).toBe(button);
    expect(el.bookmarkFilters.querySelector('[data-tag="ide"]')).toBe(button);
    el.search.focus();
    renderBookmarks();
    expect(document.activeElement).toBe(el.search);
  });

  it('ne tronque pas les tags au dixième filtre', () => {
    state.bookmarksCatalogue.tags = Array.from({ length: 12 }, (_, index) => ({ id: `tag-${index}`, count: 1 }));
    renderBookmarks();
    expect(el.bookmarkFilters.querySelectorAll('button')).toHaveLength(13);
    expect(el.bookmarkFilters.querySelector('[data-tag="tag-11"]')).not.toBeNull();
  });

  it('distingue indisponibilité, catalogue vide et sélection sans résultat', () => {
    state.bookmarksCatalogue = null;
    renderBookmarks();
    expect(el.emptyBookmarks.textContent).toContain('indisponibles');
    expect(el.emptyBookmarks.classList.contains('visible')).toBe(true);
    expect(el.emptyBookmarks.getAttribute('role')).toBe('alert');
    expect(document.getElementById('catalogue-status').textContent).toBe('Liens indisponibles');
    state.bookmarksCatalogue = { categories: [], tags: [] };
    renderBookmarks();
    expect(el.emptyBookmarks.hasAttribute('role')).toBe(false);
    expect(el.emptyBookmarks.textContent).toBe('Aucun lien disponible pour le moment.');
    state.bookmarksCatalogue = catalogue();
    el.search.value = 'aucune-correspondance';
    renderBookmarks();
    expect(el.emptyBookmarks.textContent).toContain('ne correspond');
    expect(el.bookmarkTree.children).toHaveLength(0);
    expect(document.getElementById('catalogue-status').textContent).toBe('0 liens');
  });

  it('nettoie les cartes précédentes après une indisponibilité', () => {
    renderBookmarks();
    state.bookmarksCatalogue = null;
    renderBookmarks();
    expect(el.bookmarkTree.children).toHaveLength(0);
    expect(el.bookmarkFilters.querySelectorAll('button')).toHaveLength(1);
  });

  it("n'écrase pas le compteur de l'onglet actif en arrière-plan", () => {
    state.activeTab = 'games';
    document.getElementById('catalogue-status').textContent = '8 jeux';
    renderBookmarks();
    expect(document.getElementById('catalogue-status').textContent).toBe('8 jeux');
  });

  it('désactive les appels historiques de preview', () => {
    showBookmarkPreview({ title: 'Cursor' }, document.createElement('a'));
    expect(el.bookmarkPreview.classList.contains('visible')).toBe(false);
    expect(el.bookmarkPreview.getAttribute('aria-hidden')).toBe('true');
    el.bookmarkPreview = null;
    expect(() => hideBookmarkPreview()).not.toThrow();
  });
});

describe('chargement du catalogue des liens', () => {
  it('charge le catalogue disponible', async () => {
    const data = catalogue();
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue(data) });
    await loadBookmarksCatalogue();
    expect(globalThis.fetch).toHaveBeenCalledWith('./data/bookmarks.json');
    expect(state.bookmarksCatalogue).toBe(data);
  });

  it.each([
    ['HTTP', () => Promise.resolve({ ok: false })],
    ['réseau', () => Promise.reject(new Error('hors ligne'))],
    ['JSON', () => Promise.resolve({ ok: true, json: jest.fn().mockRejectedValue(new Error('JSON invalide')) })],
    ['format', () => Promise.resolve({ ok: true, json: jest.fn().mockResolvedValue({}) })],
    ['catégorie invalide', () => Promise.resolve({ ok: true, json: jest.fn().mockResolvedValue({ categories: [{}] }) })],
  ])('rend explicite une erreur %s', async (_name, response) => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    globalThis.fetch = jest.fn().mockImplementation(response);
    await loadBookmarksCatalogue();
    expect(state.bookmarksCatalogue).toBeNull();
    renderBookmarks();
    expect(el.emptyBookmarks.textContent).toContain('indisponibles');
  });
});
