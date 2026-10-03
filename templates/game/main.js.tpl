import { GameKit } from '../../lib/gamekit.js';
import { initTheme, toggleTheme } from '../../lib/theme.js';
import { Engine } from './engine.js';
import { PrudentBot } from './bots/prudent.js';

initTheme();
GameKit.init('{{ID}}');
const engine = new Engine();
const bot = new PrudentBot();
let state;
const status = document.getElementById('status');
const buttons = [document.getElementById('take-one'), document.getElementById('take-two')];

/** Affiche l'état public et garde les actions illégales désactivées. */
function render() {
  document.getElementById('stones').textContent = `${state.remaining} pierre(s) restante(s)`;
  buttons.forEach((button, index) => {
    button.disabled = GameKit.isPaused()
      || !engine.isValidAction(state, { type: 'take', count: index + 1 }, 'humain');
  });
  status.textContent = GameKit.isPaused() ? 'Partie en pause.'
    : state.gameOver ? `${state.winners[0] === 'humain' ? 'Vous avez gagné' : 'Le bot a gagné'} en ${state.turn} tours.`
      : 'À vous de jouer.';
}

/** Initialise une partie reproductible à partir du formulaire validé. */
function start() {
  state = engine.init({
    seed: Number(document.getElementById('seed').value),
    playerIds: ['humain', 'bot'],
  });
  render();
}

buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    if (GameKit.isPaused()) {
      status.textContent = 'Partie en pause : reprendre avant de jouer.';
      return;
    }
    state = engine.applyAction(state, { type: 'take', count: index + 1 }, 'humain');
    if (!engine.isGameOver(state)) {
      state = engine.applyAction(state,
        bot.chooseAction(engine.getPlayerView(state, 'bot'), engine.getValidActions(state, 'bot')), 'bot');
    }
    render();
    if (state.gameOver && state.winners[0] === 'humain' && !GameKit.saveScore(1)) {
      status.textContent += ' Le score n’a pas pu être enregistré.';
    }
  });
});
document.getElementById('new-game').addEventListener('submit', event => {
  event.preventDefault();
  start();
});
document.getElementById('theme').addEventListener('click', toggleTheme);
window.onGamePause = render;
window.onGameResume = render;
start();
