import { Engine } from './engine.js';
import { PrudentBot } from './bots/prudent.js';

describe('Moteur de {{ID}}', () => {
  const engine = new Engine();
  const config = { seed: 42, playerIds: ['humain', 'bot'] };

  test('la seed et les actions produisent un replay déterministe', () => {
    const replay = () => {
      let state = engine.init(config);
      const bot = new PrudentBot();
      while (!engine.isGameOver(state)) {
        const player = engine.getCurrentPlayer(state);
        const action = bot.chooseAction(engine.getPlayerView(state, player), engine.getValidActions(state, player));
        state = engine.applyAction(state, action, player);
      }
      return state;
    };
    expect(replay()).toEqual(replay());
    expect(engine.getWinners(replay())).toHaveLength(1);
  });

  test('ne modifie ni la configuration ni les états précédents', () => {
    const state = engine.init(config);
    const before = JSON.stringify(state);
    engine.applyAction(state, { type: 'take', count: 1 }, 'humain');
    const view = engine.getPlayerView(state, 'humain');
    view.playerIds.push('intrus');
    expect(JSON.stringify(state)).toBe(before);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
    expect(config.playerIds).toEqual(['humain', 'bot']);
  });

  test('refuse les configurations et actions illégales', () => {
    expect(() => engine.init({ seed: NaN, playerIds: ['a', 'a'] })).toThrow();
    const state = engine.init(config);
    expect(() => engine.applyAction(state, { type: 'take', count: 1 }, 'bot')).toThrow();
    expect(() => engine.applyAction(state, { type: 'take', count: 3 }, 'humain')).toThrow();
    expect(engine.getValidActions({ ...state, remaining: 1 }, 'humain')).toEqual([{ type: 'take', count: 1 }]);
    const final = engine.applyAction({ ...state, remaining: 1 }, { type: 'take', count: 1 }, 'humain');
    expect(engine.getWinners(final)).toEqual(['humain']);
    expect(engine.getCurrentPlayer(final)).toBeNull();
    expect(engine.getValidActions(final, 'humain')).toEqual([]);
    expect(() => engine.applyAction(final, { type: 'take', count: 1 }, 'humain')).toThrow();
    expect(() => new PrudentBot().chooseAction(state, [])).toThrow();
  });
});
