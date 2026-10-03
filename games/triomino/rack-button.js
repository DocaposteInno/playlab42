/**
 * Crée une commande native de sélection de tuile, utilisable au clavier.
 * @param {{id: number, values: number[]}} tile Tuile de la réglette.
 * @param {{selected: boolean, drawn: boolean, onSelect: Function}} options État et sélection.
 * @returns {HTMLButtonElement} Bouton à compléter avec le dessin de la tuile.
 */
export function createRackButton(tile, { selected, drawn, onSelect }) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'rack-button';
  button.dataset.tileId = tile.id;
  button.setAttribute('aria-label', `Tuile ${tile.values.join(', ')}${drawn ? ', dernière tuile piochée' : ''}`);
  button.setAttribute('aria-pressed', String(selected));
  button.addEventListener('click', () => onSelect(tile.id));
  return button;
}
