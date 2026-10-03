/**
 * Gestion des parcours pédagogiques (epics)
 * @module app/parcours
 *
 * Chargement, filtrage et affichage des parcours.
 * Intégration avec le ParcoursViewer.
 */

import { state, setState } from './state.js';
import { el } from './dom-cache.js';
import { getEpicProgress } from './storage.js';
import { cloneTemplate } from '../lib/dom.js';
import { ParcoursViewer } from '../lib/parcours-viewer.js';
import { matchesQuery, renderTagFilters, setDiscoveryCount, setDiscoveryMessage } from '../lib/catalogue-ui.js';

// Dimensions intrinsèques des vignettes : standard de fait du dépôt 380x180
// (ratio 19/9, cf. --thumb-ratio dans style.css). Posées en attributs width/
// height sur les <img> pour réserver la place avant chargement (anti-CLS) ;
// le rendu final reste piloté par le CSS (width/height 100% + object-fit).
const THUMB_WIDTH = 380;
const THUMB_HEIGHT = 180;
let returnFocus = null;
let returnFocusEpicId = null;
let cardSequence = 0;

/**
 * Charge le catalogue parcours depuis le serveur
 */
export async function loadParcoursCatalogue() {
  try {
    const response = await fetch('./data/parcours.json');
    if (!response.ok) { throw new Error('Catalogue parcours introuvable'); }
    setState({ parcoursCatalogue: await response.json() });
  } catch (e) {
    console.warn('Catalogue parcours non disponible:', e.message);
    setState({ parcoursCatalogue: null });
  }
}

/**
 * Crée un élément carte Epic
 * @param {Object} epic - Données de l'epic
 * @returns {DocumentFragment} Fragment DOM
 */
export function createEpicCardElement(epic) {
  const fragment = cloneTemplate('epic-card-template');
  const card = fragment.querySelector('.epic-card');
  const thumb = fragment.querySelector('.epic-thumb');
  const title = fragment.querySelector('.epic-title');
  const desc = fragment.querySelector('.epic-description');
  const duration = fragment.querySelector('.epic-duration');
  const slides = fragment.querySelector('.epic-slides');
  const tagsContainer = fragment.querySelector('.epic-tags');
  const progressBar = fragment.querySelector('.epic-progress-bar');
  const progressLabel = fragment.querySelector('.epic-progress-label');

  // Data attributes
  card.dataset.epicId = epic.id;
  card.dataset.path = epic.path;
  card.href = `#/parcours/${epic.id}`;

  // Thumbnail
  const defaultIcon = epic.icon || '📚';
  if (epic.thumbnail) {
    const img = document.createElement('img');
    img.src = epic.thumbnail;
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = THUMB_WIDTH;
    img.height = THUMB_HEIGHT;
    img.onerror = () => {
      // Repli : l'emoji remplace l'image cassée dans le conteneur
      thumb.textContent = defaultIcon;
    };
    thumb.appendChild(img);
  } else {
    thumb.textContent = defaultIcon;
  }

  // Info
  title.textContent = epic.title;
  const instance = ++cardSequence;
  title.id = `epic-title-${instance}`;
  progressLabel.id = `epic-progress-${instance}`;
  card.setAttribute('aria-labelledby', title.id);
  card.setAttribute('aria-describedby', progressLabel.id);
  desc.textContent = epic.description;

  // Meta
  if (epic.duration) {
    duration.textContent = epic.duration;
  }
  const chapterCount = epic.structure?.filter(item => item.type === 'section').length || 0;
  slides.textContent = chapterCount > 0
    ? `${chapterCount} chapitre${chapterCount > 1 ? 's' : ''} · ${epic.slideCount} étapes`
    : `${epic.slideCount} étape${epic.slideCount > 1 ? 's' : ''}`;

  // Tags
  if (epic.tags?.length) {
    for (const tag of epic.tags.slice(0, 3)) {
      const tagEl = document.createElement('span');
      tagEl.className = 'epic-tag';
      tagEl.textContent = tag;
      tagsContainer.appendChild(tagEl);
    }
  }

  // Progress
  const progress = getEpicProgress(epic.id);
  const visitedCount = new Set(progress.visited || []).size;
  const progressPercent = epic.slideCount > 0 ? Math.min(100, Math.round((visitedCount / epic.slideCount) * 100)) : 0;
  progressBar.style.width = `${progressPercent}%`;
  progressBar.parentElement.setAttribute('aria-hidden', 'true');
  progressLabel.textContent = progressPercent >= 100 ? 'Terminé · Relire' :
    (progressPercent > 0 ? `Continuer · ${progressPercent} % parcouru` : 'Commencer le parcours');

  if (progressPercent >= 100) {
    card.classList.add('completed');
  } else if (progressPercent > 0) {
    card.classList.add('in-progress');
  }

  return fragment;
}

/**
 * Filtre les epics selon la recherche et la catégorie active
 * @param {Object[]} epics - Liste des epics
 * @returns {Object[]} Epics filtrés
 */
function filterEpics(epics) {
  const search = el.search.value.trim();
  return epics.filter(epic => {
    // Filtre par catégorie
    if (state.parcoursCategory && (epic.hierarchy?.[0] || 'autres') !== state.parcoursCategory) {
      return false;
    }
    // Filtre par tag
    if (state.activeFilter && !epic.tags?.includes(state.activeFilter)) {
      return false;
    }
    // Filtre par recherche
    return matchesQuery(search, epic.title, epic.description, epic.tags?.join(' '),
      typeof epic.author === 'object' ? epic.author?.name : epic.author);
  });
}

/**
 * Rend les filtres par catégorie pour les parcours
 */
function renderParcoursCategoryFilters() {
  if (!state.parcoursCatalogue) { return; }

  const { epics, taxonomy } = state.parcoursCatalogue;

  // Construire les catégories à partir des epics réels
  const categoriesWithCount = {};
  for (const epic of epics) {
    const catId = epic.hierarchy?.[0] || 'autres';
    if (!categoriesWithCount[catId]) {
      const taxCat = taxonomy?.hierarchy?.find(h => h.id === catId);
      categoriesWithCount[catId] = {
        id: catId,
        label: taxCat?.label || catId,
        icon: taxCat?.icon || '📁',
        order: catId === 'playlab42' ? 0 : (catId === 'autres' ? 99 : (taxCat?.order || 50)),
        count: 0,
      };
    }
    categoriesWithCount[catId].count++;
  }

  // Boutons par catégorie (ordre: playlab42 en premier, autres en dernier)
  const sortedCategories = Object.values(categoriesWithCount).sort((a, b) => {
    if (a.id === 'playlab42') { return -1; }
    if (b.id === 'playlab42') { return 1; }
    if (a.id === 'autres') { return 1; }
    if (b.id === 'autres') { return -1; }
    return (a.order || 0) - (b.order || 0);
  });

  renderTagFilters(el.parcoursCategoryFilters, sortedCategories,
    state.parcoursCategory, { attribute: 'category', allLabel: 'Tous les parcours' });
}

/**
 * Crée une section de catégorie dépliée
 * @param {Object} category - Données de la catégorie
 * @param {Object[]} epicsInCategory - Epics de la catégorie
 * @returns {DocumentFragment} Fragment DOM
 */
function createCategorySectionElement(category, epicsInCategory) {
  const fragment = cloneTemplate('category-section-template');
  const title = fragment.querySelector('.category-section-title');
  const epicsContainer = fragment.querySelector('.category-epics');

  title.textContent = category.label;
  fragment.querySelector('.category-section')?.setAttribute('data-collection', category.id);

  for (const epic of epicsInCategory) {
    epicsContainer.appendChild(createEpicCardElement(epic));
  }

  return fragment;
}

/**
 * Rend la page d'accueil Parcours
 *
 * La collection de reprise précède le catalogue, sans dupliquer les cartes.
 */
export function renderParcours() {
  if (state.activeTab !== 'parcours') { return; }
  if (!state.parcoursCatalogue) {
    el.emptyParcours.textContent = 'Impossible de charger les parcours. Rechargez la page pour réessayer.';
    el.emptyParcours.setAttribute('role', 'alert');
    el.emptyParcours.classList.add('visible');
    el.parcoursCategoriesExpanded.textContent = '';
    el.cardsParcours.textContent = '';
    renderTagFilters(el.parcoursCategoryFilters, [], null, { attribute: 'category', allLabel: 'Tous les parcours' });
    setDiscoveryMessage('Parcours indisponibles');
    return;
  }

  const { epics } = state.parcoursCatalogue;
  const focusedEpicId = document.activeElement?.closest('.epic-card')?.dataset.epicId;

  // Reset
  el.parcoursCategoriesExpanded.textContent = '';
  el.cardsParcours.textContent = '';

  renderParcoursCategoryFilters();

  const filteredEpics = filterEpics(epics);
  setDiscoveryCount(filteredEpics.length, 'parcours');
  el.emptyParcours.removeAttribute('role');
  el.emptyParcours.textContent = epics.length
    ? 'Aucun parcours ne correspond à cette sélection.' : 'Aucun parcours disponible pour le moment.';
  el.emptyParcours.classList.toggle('visible', filteredEpics.length === 0);
  const hasSearch = Boolean(el.search.value.trim() || state.parcoursCategory || state.activeFilter);

  if (hasSearch) {
    // Masquer accueil, afficher liste
    el.parcoursCategoriesExpanded.style.display = 'none';
    el.parcoursList.style.display = 'block';

    for (const epic of filteredEpics) {
      el.cardsParcours.appendChild(createEpicCardElement(epic));
    }
  } else {
    el.parcoursList.style.display = 'none';
    el.parcoursCategoriesExpanded.style.display = 'block';
    const continuing = filteredEpics.filter(epic => {
      const progress = getEpicProgress(epic.id);
      const visited = new Set(progress.visited || []).size;
      return visited > 0 && visited < epic.slideCount;
    });
    const continuingIds = new Set(continuing.map(epic => epic.id));
    const available = filteredEpics.filter(epic => !continuingIds.has(epic.id));
    if (continuing.length) {
      el.parcoursCategoriesExpanded.appendChild(
        createCategorySectionElement({ id: 'continue', label: 'Continuer votre lecture' }, continuing),
      );
    }
    if (available.length) {
      el.parcoursCategoriesExpanded.appendChild(createCategorySectionElement({
        id: 'explore', label: continuing.length ? 'Découvrir les parcours' : 'Tous les parcours',
      }, available));
    }
  }
  if (focusedEpicId) {
    [...el.viewCatalogue.querySelectorAll('.epic-card')]
      .find(card => card.dataset.epicId === focusedEpicId)?.focus({ preventScroll: true });
  }
}

/**
 * Ouvre un Epic dans le viewer
 * @param {string} epicId - ID de l'epic
 * @param {string} [slideId] - ID de la slide (optionnel)
 */
export function openEpic(epicId, slideId = null) {
  if (state.currentView !== 'parcours') {
    returnFocus = document.activeElement === document.body ? null : document.activeElement;
    returnFocusEpicId = returnFocus?.closest('.epic-card')?.dataset.epicId || epicId;
  }
  // Masquer les autres vues
  el.viewCatalogue.classList.remove('active');
  el.viewGame.classList.remove('active');
  el.viewSettings.classList.remove('active');
  el.viewParcours.classList.add('active');

  setState({ currentView: 'parcours' });

  // Créer le viewer s'il n'existe pas
  if (!state.parcoursViewer) {
    state.parcoursViewer = new ParcoursViewer(el.viewParcours, {
      onClose: () => {
        closeParcours();
      },
      onSlideChange: (slide, index) => {
        console.log(`[Portal] Slide ${index + 1}: ${slide.title}`);
      },
    });
  }

  // Charger l'epic
  state.parcoursViewer.load(epicId, slideId);
}

/**
 * Ferme le viewer de parcours et retourne au catalogue
 */
export function closeParcours() {
  el.viewParcours.classList.remove('active');
  el.viewCatalogue.classList.add('active');
  setState({ currentView: 'catalogue' });
  if (state.parcoursCatalogue) { renderParcours(); }
  // Le rendu differe de la recherche peut remplacer la carte pendant la lecture.
  const target = returnFocus?.isConnected ? returnFocus
    : [...el.viewCatalogue.querySelectorAll('.epic-card')]
      .find(card => card.dataset.epicId === returnFocusEpicId);
  (target || el.search)?.focus();
}

/**
 * Sélectionne une catégorie pour filtrer les parcours
 * @param {string|null} categoryId - ID de la catégorie (null pour "Tous")
 */
export function selectParcoursCategory(categoryId) {
  setState({ parcoursCategory: categoryId });
  renderParcours();
}
