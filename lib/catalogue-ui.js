/**
 * Contrôles de découverte partagés entre les catalogues du portail.
 * @module lib/catalogue-ui
 */

function normalize(text) {
  return String(text ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}

/**
 * Recherche chaque mot de la requête dans les champs fournis.
 * @param {string} query - Requête
 * @param {...string} texts - Champs recherchables
 * @returns {boolean} Vrai si tous les mots correspondent
 */
export function matchesQuery(query, ...texts) {
  const haystack = normalize(texts.join(' '));
  return normalize(query).trim().split(/\s+/u).every(word => haystack.includes(word));
}

/**
 * Met à jour les filtres sans perdre le contrôle utilisé au clavier.
 * @param {HTMLElement} container - Conteneur des filtres
 * @param {Array<{id: string, label: string, count?: number}>} tags - Filtres disponibles
 * @param {string|null} activeTag - Filtre sélectionné
 * @param {Object} options - Attribut dataset et libellé sans filtre
 */
export function renderTagFilters(container, tags, activeTag, { attribute = 'tag', allLabel = 'Tous' } = {}) {
  const focused = container.contains(document.activeElement) ? document.activeElement : null;
  const focusedId = focused?.dataset[attribute];
  const existing = new Map(Array.from(container.querySelectorAll('.filter'), button => [
    button.dataset[attribute], button,
  ]));
  const filters = [{ id: '', label: allLabel }, ...tags];

  for (const [index, tag] of filters.entries()) {
    const button = existing.get(tag.id) || document.createElement('button');
    button.type = 'button';
    button.dataset[attribute] = tag.id;
    button.className = 'filter';
    const selected = tag.id === (activeTag || '');
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
    button.textContent = tag.count === undefined ? tag.label : `${tag.label} (${tag.count})`;
    if (container.children[index] !== button) {
      container.insertBefore(button, container.children[index] || null);
    }
    existing.delete(tag.id);
  }
  for (const button of existing.values()) { button.remove(); }
  if (focused && document.activeElement !== focused) {
    const target = Array.from(container.children).find(button => button.dataset[attribute] === focusedId);
    (target || container.querySelector('.filter.active'))?.focus({ preventScroll: true });
  }
}

/**
 * Annonce les résultats du catalogue actif et rend son filtre visible même replié.
 * @param {number} count - Nombre de résultats visibles
 * @param {string} noun - Libellé, généralement au pluriel
 */
export function setDiscoveryCount(count, noun) {
  const singular = { parcours: 'parcours', outils: 'outil', jeux: 'jeu', ressources: 'ressource', liens: 'lien' };
  setDiscoveryMessage(`${count} ${count === 1 ? (singular[noun] || noun) : noun}`);
}

/**
 * Annonce un état sans le présenter comme un résultat vide.
 * @param {string} message - État explicite du catalogue actif
 */
export function setDiscoveryMessage(message) {
  const status = document.getElementById('catalogue-status');
  if (!status) { return; }
  status.textContent = message;
  updateDiscoveryControls();
}

/**
 * Synchronise le résumé des filtres et l'action de réinitialisation.
 */
export function updateDiscoveryControls() {
  const options = document.getElementById('discovery-options');
  if (!options) { return; }
  const group = Array.from(options.querySelector('.discovery-filter-groups').children)
    .find(container => !container.hidden);
  const active = group?.querySelector('.filter.active');
  const filtered = Boolean(active && (active.dataset.tag || active.dataset.category));
  document.getElementById('discovery-filter-label').textContent = filtered
    ? `Filtre : ${active.textContent}` : 'Affiner la sélection';
  const search = document.getElementById('search');
  document.getElementById('btn-reset-discovery').hidden = !filtered && !search.value.trim();
}
