/**
 * Commandes natives pour choisir une destination et une rotation légales.
 * Chaque option correspond exactement à une action proposée par le moteur.
 * @param {HTMLElement} container Conteneur des commandes.
 * @param {{onPlace: Function, onPreview: Function}} callbacks Actions de l'interface.
 * @returns {{update: Function, getSelected: Function}} Commandes de placement.
 */
export function createPlacementControls(container, { onPlace, onPreview }) {
  container.innerHTML = `
    <label for="placement-target">Destination et valeurs aux sommets</label>
    <select id="placement-target"></select>
    <button type="button" id="rotate-tile">Rotation suivante à cette destination</button>
    <button type="button" id="place-tile">Poser la tuile sélectionnée</button>
  `;
  const select = container.querySelector('select');
  const rotate = container.querySelector('#rotate-tile');
  const place = container.querySelector('#place-tile');
  let positions = [];
  const positionKey = ({ pos }) => `${pos.col},${pos.row},${pos.orientation}`;
  const actionKey = (action) => `${positionKey(action)}:${action.placed.join(',')}`;
  const getSelected = () => positions[Number(select.value)] ?? null;
  const preview = () => {
    const selected = getSelected();
    rotate.disabled = !selected || positions.filter(action => positionKey(action) === positionKey(selected)).length < 2;
    onPreview(selected);
  };
  select.addEventListener('change', preview);
  rotate.addEventListener('click', () => {
    const selected = getSelected();
    if (!selected) {return;}
    const rotations = positions.filter(action => positionKey(action) === positionKey(selected));
    const next = rotations[(rotations.indexOf(selected) + 1) % rotations.length];
    select.value = String(positions.indexOf(next));
    preview();
  });
  place.addEventListener('click', () => {
    const selected = getSelected();
    if (selected && !place.disabled) {onPlace(selected.pos, selected.placed);}
  });

  return {
    getSelected,
    update(legalPositions, enabled = true) {
      const previous = getSelected();
      positions = enabled ? legalPositions : [];
      select.replaceChildren();
      positions.forEach((action, index) => {
        const option = document.createElement('option');
        option.value = String(index);
        const { pos, placed } = action;
        const orientation = pos.orientation.toUpperCase() === 'UP' ? 'pointe en haut' : 'pointe en bas';
        option.textContent = `Colonne ${pos.col}, ligne ${pos.row}, ${orientation} : sommets ${placed.join(', ')}`;
        select.appendChild(option);
      });
      if (!positions.length) {
        const option = document.createElement('option');
        option.textContent = 'Aucun placement disponible';
        select.appendChild(option);
      } else {
        const previousIndex = previous ? positions.findIndex(action => actionKey(action) === actionKey(previous)) : -1;
        select.value = String(Math.max(0, previousIndex));
      }
      select.disabled = !positions.length;
      place.disabled = !positions.length;
      const selected = getSelected();
      rotate.disabled = !selected || positions.filter(action => positionKey(action) === positionKey(selected)).length < 2;
    },
  };
}
