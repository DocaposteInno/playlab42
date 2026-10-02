/** @jest-environment jsdom */
import { jest } from '@jest/globals';
import { createPlacementControls } from './placement-controls.js';
import { createRackButton } from './rack-button.js';
import { TriominoEngine } from './engine.ts';

describe('Placement accessible des triominos', () => {
  const pos = { col: 0, row: 0, orientation: 'up' };
  const actions = [
    { pos, placed: [1, 2, 3] },
    { pos, placed: [2, 3, 1] },
    { pos: { col: 1, row: 0, orientation: 'down' }, placed: [3, 1, 2] },
  ];
  let container;
  let controls;
  let onPlace;
  let onPreview;
  beforeEach(() => {
    document.body.innerHTML = '<div id="controls"></div>';
    container = document.getElementById('controls');
    onPlace = jest.fn();
    onPreview = jest.fn();
    controls = createPlacementControls(container, { onPlace, onPreview });
    controls.update(actions);
  });

  test('la sélection native et la rotation posent exactement les sommets choisis', () => {
    const select = container.querySelector('select');
    expect(select.labels[0].textContent).toContain('Destination');
    container.querySelector('#rotate-tile').click();
    expect(controls.getSelected()).toBe(actions[1]);
    expect(onPreview).toHaveBeenLastCalledWith(actions[1]);
    container.querySelector('#place-tile').click();
    expect(onPlace).toHaveBeenLastCalledWith(pos, [2, 3, 1]);
    select.value = '2';
    select.dispatchEvent(new Event('change'));
    expect(container.querySelector('#rotate-tile').disabled).toBe(true);
    container.querySelector('#place-tile').click();
    expect(onPlace).toHaveBeenLastCalledWith(actions[2].pos, actions[2].placed);
  });

  test('un rendu conserve la rotation choisie et ne recrée pas les commandes focalisées', () => {
    const rotate = container.querySelector('#rotate-tile');
    rotate.focus();
    rotate.click();
    controls.update(actions.map(action => ({ ...action, placed: [...action.placed] })));
    expect(document.activeElement).toBe(rotate);
    expect(controls.getSelected().placed).toEqual([2, 3, 1]);
  });

  test('aucun placement ni rotation pendant un tour de bot ou sans coup légal', () => {
    controls.update(actions, false);
    expect(container.querySelector('select').disabled).toBe(true);
    container.querySelector('#place-tile').click();
    expect(onPlace).not.toHaveBeenCalled();
    controls.update([]);
    expect(container.querySelector('#rotate-tile').disabled).toBe(true);
    expect(controls.getSelected()).toBeNull();
  });

  test('sélection native, rotation et placement appliquent une vraie action légale du moteur', () => {
    const engine = new TriominoEngine();
    let state = engine.init({ seed: 42, mode: 'standard', playerIds: ['human'] });
    const tile = state.players[0].rack.find(item => new Set(item.values).size > 1);
    expect(tile).toBeDefined();
    const rackLength = state.players[0].rack.length;
    let selectedId = null;
    let placedAction = null;
    const realControls = createPlacementControls(container, {
      onPreview: () => {},
      onPlace: (position, placed) => {
        placedAction = { type: 'PLACE', triominoId: selectedId, position, placed };
        expect(engine.isValidAction(state, placedAction, 'human')).toBe(true);
        state = engine.applyAction(state, placedAction, 'human');
        button.remove();
        realControls.update([], false);
      },
    });
    realControls.update([], false);
    const button = createRackButton(tile, {
      selected: false,
      drawn: false,
      onSelect: id => {
        selectedId = id;
        button.setAttribute('aria-pressed', 'true');
        const placements = engine.getLegalActions(state, 'human')
          .filter(action => action.type === 'PLACE' && action.triominoId === id)
          .map(action => ({ pos: action.position, placed: action.placed }));
        realControls.update(placements);
      },
    });
    document.body.appendChild(button);
    button.focus();
    button.click();
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    const initialValues = [...realControls.getSelected().placed];
    container.querySelector('#rotate-tile').click();
    const rotatedValues = [...realControls.getSelected().placed];
    expect(rotatedValues).not.toEqual(initialValues);
    container.querySelector('#place-tile').click();
    const { col, row, orientation } = placedAction.position;
    expect(state.board[`${col},${row},${orientation}`].placed).toEqual(rotatedValues);
    expect(state.players[0].rack).toHaveLength(rackLength - 1);
    expect(button.isConnected).toBe(false);
    expect(container.querySelector('#place-tile').disabled).toBe(true);
  });

  test('la commande native transmet aussi la tuile dont l’identifiant vaut zéro', () => {
    const onSelect = jest.fn();
    const button = createRackButton({ id: 0, values: [0, 0, 0] }, { selected: true, drawn: true, onSelect });
    button.click();
    expect(onSelect).toHaveBeenCalledWith(0);
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toContain('dernière tuile piochée');
  });
});
