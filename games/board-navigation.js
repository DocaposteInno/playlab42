/**
 * Navigation d'un plateau de boutons : un seul arrêt Tab, flèches et Home/End.
 * Les boutons conservent leur activation native par Entrée et Espace.
 * @param {HTMLElement} board Plateau contenant les boutons.
 * @param {number} columns Nombre de colonnes.
 * @returns {{beforeRender: Function, afterRender: Function}} Gestion du focus au rendu.
 */
export function createBoardNavigation(board, columns) {
  let activeIndex = 0;
  let restoreFocus = false;
  const cells = () => [...board.querySelectorAll('button')];

  board.addEventListener('focusin', (event) => {
    const index = cells().indexOf(event.target);
    if (index < 0) {return;}
    activeIndex = index;
    cells().forEach((cell, i) => { cell.tabIndex = i === index ? 0 : -1; });
  });

  board.addEventListener('keydown', (event) => {
    const items = cells();
    const index = items.indexOf(event.target);
    if (index < 0) {return;}
    const rowStart = Math.floor(index / columns) * columns;
    const rowEnd = Math.min(rowStart + columns - 1, items.length - 1);
    const destinations = {
      ArrowLeft: Math.max(rowStart, index - 1),
      ArrowRight: Math.min(rowEnd, index + 1),
      ArrowUp: Math.max(index % columns, index - columns),
      ArrowDown: index + columns < items.length ? index + columns : index,
      Home: event.ctrlKey ? 0 : rowStart,
      End: event.ctrlKey ? items.length - 1 : rowEnd,
    };
    if (!(event.key in destinations)) {return;}
    event.preventDefault();
    items[destinations[event.key]]?.focus();
  });

  return {
    beforeRender() {
      restoreFocus = board.contains(document.activeElement);
    },
    afterRender() {
      const items = cells();
      activeIndex = Math.min(activeIndex, Math.max(0, items.length - 1));
      items.forEach((cell, i) => { cell.tabIndex = i === activeIndex ? 0 : -1; });
      if (restoreFocus) {items[activeIndex]?.focus();}
      restoreFocus = false;
    },
  };
}
