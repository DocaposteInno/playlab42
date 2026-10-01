/** @jest-environment jsdom */
import { createBoardNavigation } from './board-navigation.js';

describe('Navigation clavier des plateaux', () => {
  let board;
  let navigation;
  beforeEach(() => {
    document.body.innerHTML = '<div id="board"></div>';
    board = document.getElementById('board');
    board.innerHTML = Array.from({ length: 9 }, (_, i) => `<button aria-label="Case ${i}"></button>`).join('');
    navigation = createBoardNavigation(board, 3);
    navigation.afterRender();
  });

  function press(key, ctrlKey = false) {
    document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key, ctrlKey, bubbles: true }));
  }

  test('un seul arrêt Tab et déplacement vertical et horizontal sans débordement', () => {
    const buttons = board.querySelectorAll('button');
    expect([...buttons].filter(button => button.tabIndex === 0)).toHaveLength(1);
    buttons[0].focus();
    press('ArrowDown');
    expect(document.activeElement).toBe(buttons[3]);
    press('ArrowRight');
    expect(document.activeElement).toBe(buttons[4]);
    press('End');
    expect(document.activeElement).toBe(buttons[5]);
    press('ArrowRight');
    expect(document.activeElement).toBe(buttons[5]);
    press('Home', true);
    expect(document.activeElement).toBe(buttons[0]);
    press('End', true);
    expect(document.activeElement).toBe(buttons[8]);
  });

  test('la sélection et le déplacement gardent le focus après reconstruction du damier', () => {
    board.querySelectorAll('button')[4].focus();
    navigation.beforeRender();
    board.innerHTML = Array.from({ length: 9 }, () => '<button></button>').join('');
    navigation.afterRender();
    expect(document.activeElement).toBe(board.querySelectorAll('button')[4]);
    expect(document.activeElement.tabIndex).toBe(0);
  });

  test('un rendu de bot ne vole pas le focus hors du plateau', () => {
    const outside = document.createElement('button');
    document.body.appendChild(outside);
    outside.focus();
    navigation.beforeRender();
    navigation.afterRender();
    expect(document.activeElement).toBe(outside);
  });
});
