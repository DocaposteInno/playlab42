/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
document.body.innerHTML = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>'));

const { state, setState } = await import('./state.js');
const { el } = await import('./dom-cache.js');
const { renderCatalogue, loadCatalogue, filterItems } = await import('./catalogue.js');
const { updateTabUI } = await import('./tabs.js');
const { setupEventListeners } = await import('./events.js');
setupEventListeners();
const originalFetch = globalThis.fetch;

const games = [
  { id: 'echecs', name: 'Échecs', description: 'Réfléchir ensemble', tags: ['stratégie'], path: 'games/echecs/index.html' },
  { id: 'calcul', name: 'Calcul', description: 'Pratiquer les nombres', tags: ['math'], path: 'games/calcul/index.html' },
];

describe('decouverte editoriale du portail', () => {
  beforeEach(() => {
    globalThis.fetch = jest.fn();
    setState({
      activeTab: 'games', activeFilter: '', parcoursCategory: null, bookmarkTagFilter: null,
      catalogue: { games, tools: [] },
    });
    el.search.value = '';
    el.discoveryOptions.open = false;
    updateTabUI();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalFetch) { globalThis.fetch = originalFetch; }
    else { delete globalThis.fetch; }
  });

  it('propose un seul panneau ferme avec les filtres de la section active', () => {
    renderCatalogue();
    expect(document.querySelectorAll('#view-catalogue details')).toHaveLength(1);
    expect(el.discoveryOptions.open).toBe(false);
    expect(el.filters.hidden).toBe(false);
    expect(el.bookmarkFilters.hidden).toBe(true);
    expect(el.parcoursCategoryFilters.hidden).toBe(true);
    expect(el.catalogueStatus.textContent).toBe('2 jeux');
    expect(el.searchLabel.textContent).toBe('Rechercher dans les jeux');
  });

  it('recherche chaque mot sur les noms, descriptions et tags sans accents', () => {
    el.search.value = ' STRATEGIE reflechir ';
    expect(filterItems(games)).toEqual([games[0]]);
    renderCatalogue();
    expect(el.cardsGames.querySelectorAll('.card')).toHaveLength(1);
    expect(el.catalogueStatus.textContent).toBe('1 jeu');
    expect(el.resetDiscovery.hidden).toBe(false);
  });

  it('garde un filtre replie identifiable et le focus apres un nouveau rendu', () => {
    renderCatalogue();
    const button = el.filters.querySelector('[data-tag="stratégie"]');
    button.focus();
    button.click();
    renderCatalogue();
    expect(document.activeElement).toBe(button);
    expect(document.getElementById('discovery-filter-label').textContent).toContain('stratégie');
    expect(el.catalogueStatus.textContent).toBe('1 jeu');
    expect(el.discoveryOptions.open).toBe(false);
  });

  it('remet a zero recherche et filtre puis rend le focus a la recherche', () => {
    setState({ activeFilter: 'stratégie' });
    el.search.value = 'introuvable';
    renderCatalogue();
    expect(el.emptyGames.classList.contains('visible')).toBe(true);
    el.resetDiscovery.click();
    expect(el.search.value).toBe('');
    expect(state.activeFilter).toBe('');
    expect(el.cardsGames.querySelectorAll('.card')).toHaveLength(2);
    expect(el.resetDiscovery.hidden).toBe(true);
    expect(document.activeElement).toBe(el.search);
  });

  it('ne vole pas le compteur des parcours lors du chargement concurrent des jeux', async () => {
    setState({ activeTab: 'parcours', catalogue: null });
    updateTabUI();
    el.catalogueStatus.textContent = '7 parcours';
    globalThis.fetch.mockResolvedValue({
      ok: true, json: () => Promise.resolve({ games, tools: [] }),
    });
    await loadCatalogue();
    expect(el.catalogueStatus.textContent).toBe('7 parcours');
  });

  it('explique un catalogue vide plutot que laisser une grille sans contenu', () => {
    setState({ activeTab: 'tools' });
    updateTabUI();
    renderCatalogue();
    expect(el.emptyTools.classList.contains('visible')).toBe(true);
    expect(el.emptyTools.textContent).toContain('pour le moment');
    expect(el.catalogueStatus.textContent).toBe('0 outils');
  });

  it('expose une erreur dans les deux sections sans annoncer zero resultat', async () => {
    setState({ activeTab: 'tools' });
    updateTabUI();
    globalThis.fetch.mockResolvedValue({ ok: false });
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await loadCatalogue();
    expect(error).toHaveBeenCalled();
    expect(el.cardsTools.querySelector('[role="alert"]').textContent).toContain('Impossible');
    expect(el.cardsGames.querySelector('[role="alert"]').textContent).toContain('Impossible');
    expect(el.catalogueStatus.textContent).toContain('Impossible');
    expect(el.emptyTools.classList.contains('visible')).toBe(false);
    expect(el.emptyGames.classList.contains('visible')).toBe(false);
  });
});
