/** Régressions tactiques du bot : captures, défense, yeux et déterminisme. */
import { Go9x9Engine } from '../engine.js';
import { GreedyBot } from './greedy.js';
import { SeededRandom } from '../../../lib/seeded-random.js';

const engine = new Go9x9Engine();

/** Crée une position de problème sans modifier les règles du moteur. */
function position(black = [], white = [], player = 'black') {
  const state = engine.init({ seed: 42, playerIds: ['black', 'white'] });
  for (const [x, y] of black) { state.board[y][x] = 1; }
  for (const [x, y] of white) { state.board[y][x] = 2; }
  state.currentPlayerId = player;
  return state;
}

/** Demande une décision parmi les coups légaux. */
function choose(state, seed = 42) {
  return new GreedyBot(engine).chooseAction(state,
    engine.getValidActions(state, state.currentPlayerId), new SeededRandom(seed));
}

describe('GreedyBot tactique', () => {
  it('capture un groupe adverse en atari', () => {
    const state = position([[3, 4], [5, 4], [4, 5]], [[4, 4]]);
    expect(choose(state)).toEqual({ type: 'place', x: 4, y: 3 });
  });

  it('sauve une chaîne de deux pierres en atari', () => {
    const state = position([[4, 4], [4, 5]], [[3, 4], [5, 4], [3, 5], [5, 5], [4, 6]]);
    expect(choose(state)).toEqual({ type: 'place', x: 4, y: 3 });
  });

  it('ne se jette pas dans un auto-atari au coin', () => {
    const state = position([], [[1, 0]]);
    const actions = [{ type: 'place', x: 0, y: 0 }, { type: 'place', x: 5, y: 5 }];
    expect(new GreedyBot(engine).chooseAction(state, actions)).toEqual(actions[1]);
  });

  it('respecte le ko simple au cours de la recherche', () => {
    const state = position([[4, 4], [3, 3], [5, 3], [4, 2]],
      [[3, 4], [5, 4], [4, 5]], 'white');
    state.previousBoard = state.board.map((row) => [...row]);
    state.previousBoard[4][4] = 0;
    state.previousBoard[3][4] = 2;
    const recapture = { type: 'place', x: 4, y: 3 };
    expect(engine.isValidAction(state, recapture, 'white')).toBe(false);
    const action = choose(state);
    expect(action).not.toEqual(recapture);
    expect(engine.isValidAction(state, action, 'white')).toBe(true);
  });

  it('préserve ses deux yeux et passe quand le plateau est réglé', () => {
    const state = position();
    state.board = Array.from({ length: 9 }, () => Array(9).fill(1));
    state.board[4][4] = 0;
    state.board[6][6] = 0;
    expect(choose(state)).toEqual({ type: 'pass' });
  });

  it('termine par une passe lorsque le score final est favorable', () => {
    const state = position([], [[4, 4]], 'white');
    state.passesInARow = 1;
    expect(choose(state)).toEqual({ type: 'pass' });
  });

  it('ne termine pas volontairement une partie perdue avec des coups utiles', () => {
    const state = position([[4, 4]], [], 'white');
    state.passesInARow = 1;
    expect(choose(state).type).toBe('place');
  });

  it('reste déterministe et ne modifie ni la vue ni les actions', () => {
    const state = position([[4, 4]], [], 'white');
    const actions = engine.getValidActions(state, 'white');
    const snapshot = JSON.stringify({ state, actions });
    const bot = new GreedyBot(engine);
    const action = bot.chooseAction(state, actions, new SeededRandom(123));
    expect(bot.chooseAction(state, actions, new SeededRandom(123))).toEqual(action);
    expect(JSON.stringify({ state, actions })).toBe(snapshot);
    expect(actions).toContainEqual(action);
  });

  it('sait jouer les deux couleurs et accepte un identifiant égal à zéro', () => {
    const state = engine.init({ seed: 0, playerIds: [0, 1] });
    const bot = new GreedyBot(engine);
    bot.onGameStart(0);
    const action = bot.chooseAction(state, engine.getValidActions(state, 0));
    expect(engine.isValidAction(state, action, 0)).toBe(true);
  });

  it('renvoie null lorsque la partie est terminée', () => {
    const state = position();
    state.gameOver = true;
    expect(new GreedyBot(engine).chooseAction(state, [])).toBeNull();
  });
});
