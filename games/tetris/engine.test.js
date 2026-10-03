/**
 * Tests du moteur : règles, SRS, temps simulé, sérialisation et immutabilité.
 */
import TetrisEngine, { PIECES, getCells, getGhostPiece, getDropInterval } from './engine.js';

const engine = new TetrisEngine();
const PLAYER = 'human';
const init = (mode = 'marathon', seed = 42) => engine.init({ seed, playerIds: [PLAYER], mode });
const act = (state, type, delta) => engine.applyAction(
  state, delta === undefined ? { type } : { type, delta }, PLAYER,
);
const emptyBoard = () => Array.from({ length: 20 }, () => Array(10).fill(null));
const fixture = (type = 'T', x = 3, y = 0, rotation = 0) => ({
  ...init(), active: { type, x, y, rotation }, board: emptyBoard(),
});

/** Gèle récursivement une entrée afin de détecter toute écriture interne. */
function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

/** Prépare quatre lignes avec une colonne libre pour un I vertical. */
function tetris(state = init()) {
  const board = emptyBoard();
  for (let y = 16; y < 20; y++) {
    board[y].fill('J');
    board[y][5] = null;
  }
  return {
    ...state, board, active: { type: 'I', rotation: 1, x: 3, y: 16 },
    gravityElapsed: 0, lockElapsed: 0, lockResets: 0, lastRotation: null,
  };
}

/** Prépare un T-spin authentique obtenu par une rotation de gauche vers zéro. */
function spin({ mini = false, clear = false } = {}) {
  const state = fixture('T', 3, 17, 3);
  state.board[17][3] = 'J';
  if (!mini) { state.board[17][5] = 'J'; }
  state.board[19][3] = 'J';
  state.board[19][5] = 'J';
  if (clear) {
    state.board[18].fill('J');
    for (const x of [3, 4, 5]) { state.board[18][x] = null; }
  }
  return act(state, 'rotateCW');
}

describe('Contrat moteur Tetris', () => {
  test('initialise vingt lignes indépendantes, cinq aperçus et un spawn caché', () => {
    const state = init();
    expect(state.board).toHaveLength(20);
    expect(state.board.every(row => row.length === 10 && row.every(cell => cell === null))).toBe(true);
    expect(new Set(state.board).size).toBe(20);
    expect(state.queue.length).toBeGreaterThanOrEqual(5);
    expect(state.active.y).toBe(-1);
    expect(state).toMatchObject({
      score: 0, lines: 0, level: 1, elapsed: 0, hold: null, canHold: true,
      gameOver: false, winners: null, piecesPlaced: 0, combo: -1, backToBack: false,
      lastClear: { lines: 0, label: 'None', points: 0 }, currentPlayerId: PLAYER,
      gravityElapsed: 0, lockElapsed: 0, lockResets: 0, lastRotation: null,
    });
    expect(engine.getPlayerView(state, PLAYER)).toBe(state);
    expect(engine.getCurrentPlayer(state)).toBe(PLAYER);
    expect(engine.getWinners(state)).toBe(null);
    expect(engine.isGameOver(state)).toBe(false);
    expect(engine.init({ seed: 0, playerIds: [PLAYER] }).mode).toBe('marathon');
  });

  test.each([
    null, {}, { seed: NaN, playerIds: [PLAYER] }, { seed: Infinity, playerIds: [PLAYER] },
    { seed: 1.5, playerIds: [PLAYER] }, { seed: 1, playerIds: [] },
    { seed: 1, playerIds: [PLAYER, 'other'] }, { seed: 1, playerIds: [''] },
    { seed: 1, playerIds: ['   '] }, { seed: 1, playerIds: [42] },
    { seed: 1, playerIds: [PLAYER], mode: 'bad' },
    { seed: 1, playerIds: [PLAYER], mode: null },
  ])('rejette une configuration incorrecte : %j', config => {
    expect(() => engine.init(config)).toThrow();
  });

  test.each([null, undefined, {}, [], 'left', { type: 'bad' }, { type: 'tick' }])(
    'rejette les actions inconnues ou mal formées : %j', action => {
      expect(engine.isValidAction(init(), action, PLAYER)).toBe(false);
      expect(() => engine.applyAction(init(), action, PLAYER)).toThrow('Invalid action');
    },
  );

  test.each([-1, 1000.01, NaN, Infinity, -Infinity, '20', null, undefined])(
    'rejette le delta %j', delta => {
      const action = { type: 'tick', delta };
      expect(engine.isValidAction(init(), action, PLAYER)).toBe(false);
      expect(() => engine.applyAction(init(), action, PLAYER)).toThrow();
    },
  );

  test.each([0, 0.5, 1000])('accepte le delta %s', delta => {
    expect(engine.isValidAction(init(), { type: 'tick', delta }, PLAYER)).toBe(true);
    expect(act(init(), 'tick', delta).elapsed).toBe(delta);
  });

  test('énumère des actions réellement valides et respecte le joueur', () => {
    const state = init();
    const actions = engine.getValidActions(state, PLAYER);
    expect(actions).toHaveLength(8);
    expect(actions).toContainEqual({ type: 'tick', delta: 0 });
    expect(actions.every(action => engine.isValidAction(state, action, PLAYER))).toBe(true);
    expect(engine.getValidActions(state, 'intruder')).toEqual([]);
    expect(engine.isValidAction(state, { type: 'left' }, 'intruder')).toBe(false);
    expect(() => engine.applyAction(state, { type: 'left' }, 'intruder')).toThrow();
    expect(engine.getValidActions({ ...state, gameOver: true }, PLAYER)).toEqual([]);
    expect(() => act({ ...state, gameOver: true }, 'hardDrop')).toThrow();
    expect(engine.getValidActions(act(state, 'hold'), PLAYER).map(action => action.type)).not.toContain('hold');
  });
});

describe('Déterminisme, reprise et sacs de sept', () => {
  test('des replays identiques restent égaux, y compris après restauration JSON', () => {
    let direct = init('marathon', 983);
    let restored = JSON.parse(JSON.stringify(direct));
    const actions = [
      { type: 'left' }, { type: 'rotateCW' }, { type: 'softDrop' },
      { type: 'tick', delta: 1000 }, { type: 'hold' }, { type: 'hardDrop' },
      { type: 'right' }, { type: 'rotateCCW' }, { type: 'hardDrop' },
    ];
    for (let i = 0; i < 6; i++) {
      for (const action of actions) {
        if (direct.gameOver || !engine.isValidAction(direct, action, PLAYER)) { continue; }
        direct = engine.applyAction(freeze(direct), freeze(action), PLAYER);
        restored = engine.applyAction(restored, action, PLAYER);
        restored = JSON.parse(JSON.stringify(restored));
        expect(restored).toEqual(direct);
      }
    }
    expect(init('marathon', 983)).toEqual(init('marathon', 983));
    expect(init('marathon', 984).queue).not.toEqual(init('marathon', 983).queue);
  });

  test('toute action conserve les entrées gelées et les matrices publiques', () => {
    for (const action of engine.getValidActions(init(), PLAYER)) {
      const state = freeze(init());
      const before = JSON.stringify(state);
      const next = engine.applyAction(state, freeze(action), PLAYER);
      expect(JSON.stringify(state)).toBe(before);
      expect(next).not.toBe(state);
      expect(next.board).not.toBe(state.board);
    }
    expect(Object.isFrozen(PIECES)).toBe(true);
    expect(Object.values(PIECES).every(matrix => Object.isFrozen(matrix) && matrix.every(Object.isFrozen))).toBe(true);
  });

  test('vingt sacs consécutifs contiennent chacun exactement sept types', () => {
    let state = init('marathon', 2026);
    const drawn = [];
    for (let i = 0; i < 140; i++) {
      drawn.push(state.active.type);
      state = act({ ...state, board: emptyBoard() }, 'hardDrop');
      expect(state.queue.length).toBeGreaterThanOrEqual(5);
      expect(state.rngState).toBeGreaterThanOrEqual(0);
      expect(state.rngState).toBeLessThan(2 ** 32);
    }
    for (let i = 0; i < drawn.length; i += 7) {
      expect(drawn.slice(i, i + 7).sort()).toEqual(Object.keys(PIECES).sort());
    }
  });
});

describe('Cellules, obstacles, projection et déplacements', () => {
  test.each(Object.keys(PIECES))('retourne quatre coordonnées absolues pour %s', type => {
    for (let rotation = 0; rotation < 4; rotation++) {
      const cells = getCells({ type, rotation, x: -2, y: -1 });
      expect(cells).toHaveLength(4);
      expect(cells.every(cell => Object.keys(cell).sort().join() === 'x,y')).toBe(true);
      expect(new Set(cells.map(({ x, y }) => `${x},${y}`)).size).toBe(4);
    }
  });

  test('la matrice I pivote autour de son centre SRS et O ne se déplace pas', () => {
    expect(getCells({ type: 'I', rotation: 1, x: 0, y: 0 })).toEqual([
      { x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
    ]);
    const state = fixture('O', 4, 18);
    expect(act(state, 'rotateCW').active).toEqual(state.active);
    expect(act(state, 'rotateCCW').lockResets).toBe(0);
  });

  test('les murs et le sol sont des no-op valides sans points ni resets', () => {
    let state = fixture('O', 0, 18);
    expect(engine.isValidAction(state, { type: 'left' }, PLAYER)).toBe(true);
    expect(act(state, 'left')).toEqual(state);
    expect(act(state, 'softDrop')).toEqual(state);
    state = fixture('O', 8, 18);
    expect(act(state, 'right')).toEqual(state);
  });

  test('un obstacle interdit la translation et le soft drop', () => {
    const state = fixture('O', 4, 5);
    state.board[5][3] = 'Z';
    state.board[7][4] = 'Z';
    expect(act(state, 'left').active).toEqual(state.active);
    expect(act(state, 'softDrop').score).toBe(0);
    expect(getGhostPiece(state)).toEqual(state.active);
  });

  test('la projection correspond exactement à la pose et est pure', () => {
    const state = fixture('T', 3, -1);
    state.board[15][4] = 'L';
    const ghost = getGhostPiece(freeze(state));
    expect(ghost.y).toBe(13);
    expect(state.active.y).toBe(-1);
    const next = act(state, 'hardDrop');
    for (const { x, y } of getCells(ghost)) { expect(next.board[y][x]).toBe('T'); }
    expect(next.score).toBe(28);
    expect(getGhostPiece({ ...state, active: null })).toBe(null);
  });

  test('soft drop rapporte un point par case et hard drop deux', () => {
    const state = fixture('O', 4, 0);
    const soft = act(state, 'softDrop');
    expect(soft.score).toBe(1);
    expect(soft.active.y).toBe(1);
    const hard = act(soft, 'hardDrop');
    expect(hard.score).toBe(1 + 17 * 2);
    expect(hard.piecesPlaced).toBe(1);
  });
});

// Référence SRS indépendante du moteur : offsets en coordonnées écran (y descend).
const REFERENCE_KICKS = {
  T: {
    '0>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '1>0': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '1>2': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    '2>1': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    '2>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    '3>2': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '3>0': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    '0>3': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  },
  I: {
    '0>1': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    '1>0': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    '1>2': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
    '2>1': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    '2>3': [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    '3>2': [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    '3>0': [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    '0>3': [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
  },
};

/**
 * Construit un obstacle bloquant tous les essais précédents, mais ni la pièce
 * initiale ni le kick attendu. Les bords complètent les blocages nécessaires.
 */
function kickFixture(type, from, to, desired) {
  const kicks = REFERENCE_KICKS[type === 'I' ? 'I' : 'T'][`${from}>${to}`];
  const inBounds = ({ x, y }) => x >= 0 && x < 10 && y < 20;
  const key = ({ x, y }) => `${x},${y}`;
  for (let y = -1; y < 20; y++) {
    for (let x = -3; x < 10; x++) {
      const state = fixture(type, x, y, from);
      const [dx, dy] = kicks[desired];
      const target = { type, rotation: to, x: x + dx, y: y + dy };
      const protectedCells = [...getCells(state.active), ...getCells(target)];
      if (!protectedCells.every(inBounds)) { continue; }
      const protectedKeys = new Set(protectedCells.map(key));
      let possible = true;
      for (const [kx, ky] of kicks.slice(0, desired)) {
        const candidate = getCells({ type, rotation: to, x: x + kx, y: y + ky });
        if (!candidate.every(inBounds)) { continue; }
        const obstacle = candidate.find(cell => cell.y >= 0 && !protectedKeys.has(key(cell)));
        if (!obstacle) { possible = false; break; }
        state.board[obstacle.y][obstacle.x] = 'Z';
      }
      if (possible) { return { state, target }; }
    }
  }
  throw new Error(`Fixture SRS introuvable : ${type} ${from}>${to} kick ${desired}`);
}

describe('Les huit transitions SRS', () => {
  for (const type of ['I', 'J', 'L', 'S', 'T', 'Z']) {
    for (const transition of Object.keys(REFERENCE_KICKS.T)) {
      const [from, to] = transition.split('>').map(Number);
      test(`${type} ${transition} essaie les offsets dans l'ordre`, () => {
        const { state, target } = kickFixture(type, from, to, 1);
        const action = (from + 1) % 4 === to ? 'rotateCW' : 'rotateCCW';
        const next = act(freeze(state), action);
        expect(next.active).toEqual(target);
        expect(next.lastRotation.kick).toBe(1);
      });
    }
  }

  test.each(['I', 'T'])('%s peut utiliser le cinquième kick après quatre échecs', type => {
    const { state, target } = kickFixture(type, 0, 1, 4);
    const next = act(state, 'rotateCW');
    expect(next.active).toEqual(target);
    expect(next.lastRotation.kick).toBe(4);
  });

  test('un I au plancher se soulève avec son kick spécifique', () => {
    const state = fixture('I', 3, 18);
    expect(act(state, 'rotateCW').active).toEqual({ type: 'I', rotation: 1, x: 4, y: 16 });
  });

  test('des obstacles peuvent refuser tous les kicks sans reset', () => {
    const state = fixture('T', 3, 8);
    state.board = Array.from({ length: 20 }, () => Array(10).fill('J'));
    for (const { x, y } of getCells(state.active)) { state.board[y][x] = null; }
    state.lockElapsed = 350;
    expect(act(state, 'rotateCW')).toEqual(state);
    expect(act(state, 'rotateCCW')).toEqual(state);
  });
});

describe('Réserve', () => {
  test('la première réserve prend la file et ne permet pas une deuxième réserve', () => {
    const state = init();
    const nextType = state.queue[0];
    const held = act(state, 'hold');
    expect(held.hold).toBe(state.active.type);
    expect(held.active.type).toBe(nextType);
    expect(held.canHold).toBe(false);
    expect(() => act(held, 'hold')).toThrow();
    expect(act(held, 'hardDrop').canHold).toBe(true);
  });

  test('échanger la réserve restaure orientation, spawn et délais sans consommer la file', () => {
    const state = {
      ...fixture('J', 2, 10, 2), hold: 'I', gravityElapsed: 300,
      lockElapsed: 400, lockResets: 12, lastRotation: { kick: 2 },
    };
    const next = act(state, 'hold');
    expect(next.active).toEqual({ type: 'I', x: 3, y: -1, rotation: 0 });
    expect(next.hold).toBe('J');
    expect(next.queue).toEqual(state.queue);
    expect(next).toMatchObject({ gravityElapsed: 0, lockElapsed: 0, lockResets: 0, lastRotation: null });
  });
});

describe('Gravité, délais et budgets de verrouillage', () => {
  test('la gravité ne marque pas de point et attend son intervalle', () => {
    const state = fixture('O', 4, 0);
    const before = act(state, 'tick', 999);
    expect(before.active.y).toBe(0);
    const after = act(before, 'tick', 1);
    expect(after.active.y).toBe(1);
    expect(after.score).toBe(0);
    expect(getDropInterval(1)).toBe(1000);
    expect(getDropInterval(2)).toBe(800);
    expect(getDropInterval(100)).toBe(50);
  });

  test('le délai démarre au contact, pas au début du tick', () => {
    const state = { ...fixture('O', 4, 17), gravityElapsed: 750 };
    const next = act(state, 'tick', 749);
    expect(next.active.y).toBe(18);
    expect(next.lockElapsed).toBe(499);
    expect(next.piecesPlaced).toBe(0);
    const locked = act(next, 'tick', 1);
    expect(locked.piecesPlaced).toBe(1);
    expect(locked.elapsed).toBe(750);
  });

  test('un tick continue à simuler la pièce suivante après le verrouillage', () => {
    const state = fixture('O', 4, 18);
    const next = act(state, 'tick', 1000);
    expect(next.piecesPlaced).toBe(1);
    expect(next.gravityElapsed).toBe(500);
    expect(next.elapsed).toBe(1000);
  });

  test('quinze manipulations réussies au sol au maximum réinitialisent le délai', () => {
    let state = fixture('O', 4, 18);
    for (let i = 0; i < 15; i++) {
      state = act(state, 'tick', 400);
      state = act(state, i % 2 ? 'left' : 'right');
      expect(state.lockElapsed).toBe(0);
      expect(state.lockResets).toBe(i + 1);
    }
    state = act(state, 'tick', 400);
    state = act(state, 'left');
    expect(state.lockElapsed).toBe(400);
    expect(state.lockResets).toBe(15);
    expect(act(state, 'tick', 100).piecesPlaced).toBe(1);
  });

  test('une translation aérienne ne consomme pas de reset', () => {
    const state = act(fixture('T', 3, 0), 'left');
    expect(state.lockResets).toBe(0);
  });

  test('un kick de plancher consomme un reset et le budget survit au décollage', () => {
    const state = { ...fixture('I', 3, 18), lockElapsed: 450, lockResets: 14 };
    const next = act(state, 'rotateCW');
    expect(next.lockResets).toBe(15);
    expect(next.lockElapsed).toBe(0);
    const capped = act({ ...state, lockResets: 15 }, 'rotateCW');
    expect(capped.lockElapsed).toBe(450);
    expect(capped.lockResets).toBe(15);
  });

  test.each([1, 5, 20])('le découpage entier des ticks est invariant au niveau %s', level => {
    const state = { ...fixture('O', 4, 17), level, lines: (level - 1) * 10 };
    let whole = state;
    let split = state;
    for (let i = 0; i < 30 && !whole.gameOver; i++) { whole = act(whole, 'tick', 1000); }
    for (let i = 0; i < 300 && !split.gameOver; i++) { split = act(split, 'tick', 100); }
    expect(split).toEqual(whole);
  });

  test('des ticks fractionnaires ne perdent pas le temps simulé', () => {
    let state = fixture('O', 4, 0);
    for (let i = 0; i < 120; i++) { state = act(state, 'tick', 1000 / 120); }
    expect(state.elapsed).toBeCloseTo(1000, 8);
    expect(state.gravityElapsed).toBeCloseTo(0, 8);
    expect(state.active.y).toBe(1);
  });
});

describe('Scores, lignes, combos et back-to-back', () => {
  test.each([[1, 100], [2, 300], [3, 500], [4, 800]])(
    '%s lignes valent %s points au niveau un', (count, points) => {
      const state = tetris();
      for (let y = 16; y < 20 - count; y++) { state.board[y] = Array(10).fill(null); }
      const next = act(state, 'hardDrop');
      expect(next.lastClear).toMatchObject({ lines: count, points });
      expect(next.score).toBe(points);
      expect(next.lines).toBe(count);
      expect(next.board).toHaveLength(20);
      expect(next.combo).toBe(0);
    },
  );

  test('quatre lignes vident la grille et la seconde suite ajoute B2B et combo', () => {
    const first = act(tetris(), 'hardDrop');
    expect(first.board.every(row => row.every(cell => cell === null))).toBe(true);
    expect(first.backToBack).toBe(true);
    expect(first.lastClear.label).toBe('Tetris');
    const second = act(tetris(first), 'hardDrop');
    expect(second.lastClear.points).toBe(800 * 1.5 + 50);
    expect(second.combo).toBe(1);
    expect(second.score).toBe(2050);
    const empty = act({ ...second, board: emptyBoard(), active: { type: 'O', rotation: 0, x: 0, y: 18 } }, 'hardDrop');
    expect(empty.combo).toBe(-1);
    expect(empty.backToBack).toBe(true);
    const single = tetris(empty);
    for (let y = 16; y < 19; y++) { single.board[y] = Array(10).fill(null); }
    expect(act(single, 'hardDrop').backToBack).toBe(false);
  });

  test('le score utilise le niveau avant clear, puis actualise le niveau', () => {
    const next = act(tetris({ ...init(), lines: 8 }), 'hardDrop');
    expect(next.lastClear.points).toBe(800);
    expect(next.lines).toBe(12);
    expect(next.level).toBe(2);
    const after = act(tetris(next), 'hardDrop');
    expect(after.lastClear.points).toBe((1200 + 50) * 2);
  });

  test.each([
    [{}, 'T-spin', 400],
    [{ mini: true }, 'T-spin mini', 100],
    [{ clear: true }, 'T-spin Single', 800],
    [{ mini: true, clear: true }, 'T-spin mini Single', 200],
  ])('reconnaît et score %s', (options, label, points) => {
    const state = spin(options);
    expect(state.active).toMatchObject({ rotation: 0, x: 3, y: 17 });
    const next = act(state, 'hardDrop');
    expect(next.lastClear).toEqual({ label, points, lines: options.clear ? 1 : 0 });
    expect(next.backToBack).toBe(Boolean(options.clear));
  });

  test('trois coins sans rotation ne donnent pas de T-spin', () => {
    const next = act({ ...spin(), lastRotation: null }, 'hardDrop');
    expect(next.lastClear.points).toBe(0);
    expect(next.lastClear.label).toBe('None');
  });

  test('une chute immédiate conserve la rotation pour un T-spin mini après descente', () => {
    const state = fixture('T', 3, 15);
    state.board[17][3] = 'J';
    state.board[19][3] = 'J';
    state.board[19][5] = 'J';
    const rotated = act(state, 'rotateCW');
    expect(rotated.active).toMatchObject({ rotation: 1, y: 15 });
    expect(getGhostPiece(rotated).y).toBe(17);
    const next = act(rotated, 'hardDrop');
    expect(next.lastClear).toEqual({ lines: 0, label: 'T-spin mini', points: 100 });
    expect(next.score).toBe(104);
  });

  test('une cinquième tentative promeut le mini en spin complet', () => {
    const next = act({ ...spin({ mini: true }), lastRotation: { kick: 4 } }, 'hardDrop');
    expect(next.lastClear.label).toBe('T-spin');
    expect(next.lastClear.points).toBe(400);
  });

  test('un T-spin Double ferme deux lignes et marque 1200 points', () => {
    const state = spin({ clear: true });
    state.board[17].fill('J');
    state.board[17][4] = null;
    const next = act(state, 'hardDrop');
    expect(next.lastClear).toEqual({ lines: 2, label: 'T-spin Double', points: 1200 });
    expect(next.backToBack).toBe(true);
  });

  test('un vrai T-spin Triple utilise le cinquième kick et marque 1600 points', () => {
    const state = fixture('T', 4, 14);
    for (let y = 16; y <= 18; y++) { state.board[y].fill('J'); }
    for (const { x, y } of getCells({ type: 'T', rotation: 1, x: 3, y: 16 })) {
      state.board[y][x] = null;
    }
    state.board[13][4] = 'J';
    state.board[14][4] = 'J';
    state.board[19][4] = 'J';
    const rotated = act(state, 'rotateCW');
    expect(rotated.active).toEqual({ type: 'T', rotation: 1, x: 3, y: 16 });
    expect(rotated.lastRotation.kick).toBe(4);
    const next = act(rotated, 'hardDrop');
    expect(next.lastClear).toEqual({ lines: 3, label: 'T-spin Triple', points: 1600 });
    expect(next.backToBack).toBe(true);
  });

  test('des T-spins consécutifs appliquent également combo et back-to-back', () => {
    const next = act({
      ...spin({ clear: true }), backToBack: true, combo: 2, level: 3,
    }, 'hardDrop');
    expect(next.lastClear.points).toBe((800 * 1.5 + 3 * 50) * 3);
  });

  test('une translation réussie annule la rotation mais une collision la préserve', () => {
    const state = { ...fixture('T', 3, 0), lastRotation: { kick: 0 } };
    expect(act(state, 'left').lastRotation).toBe(null);
    expect(act(state, 'softDrop').lastRotation).toBe(null);
    expect(act(state, 'hardDrop').lastClear.label).toBe('None');
    const blocked = spin();
    expect(act(blocked, 'softDrop').lastRotation).toEqual(blocked.lastRotation);
  });
});

describe('Objectifs et dépassements', () => {
  test('Sprint gagne à quarante lignes exactement, avec le temps préservé', () => {
    const state = { ...init('sprint'), lines: 36, level: 4, elapsed: 54321 };
    const next = act(tetris(state), 'hardDrop');
    expect(next).toMatchObject({ lines: 40, gameOver: true, elapsed: 54321, active: null });
    expect(engine.getWinners(next)).toEqual([PLAYER]);
    expect(engine.getValidActions(next, PLAYER)).toEqual([]);
  });

  test('Marathon continue au-delà de quarante lignes', () => {
    expect(act(tetris({ ...init(), lines: 39, level: 4 }), 'hardDrop').gameOver).toBe(false);
  });

  test('Ultra termine exactement à 120 secondes, sans action après la limite', () => {
    const state = { ...init('ultra'), elapsed: 119750 };
    const next = act(state, 'tick', 1000);
    expect(next.elapsed).toBe(120000);
    expect(next.gameOver).toBe(true);
    expect(next.winners).toEqual([PLAYER]);
    expect(next.active).toBe(null);
    expect(() => act(next, 'left')).toThrow();
  });

  test('la limite Ultra gagne sur un verrouillage simultané', () => {
    const state = { ...fixture('O', 4, 18), mode: 'ultra', elapsed: 119500 };
    const next = act(state, 'tick', 500);
    expect(next.piecesPlaced).toBe(0);
    expect(next.gameOver).toBe(true);
  });

  test('le spawn obstrué termine sans écraser les cellules', () => {
    const state = fixture('O', 0, 18);
    state.queue[0] = 'I';
    state.board[0][3] = 'Z';
    const next = act(state, 'hardDrop');
    expect(next.gameOver).toBe(true);
    expect(next.winners).toBe(null);
    expect(next.board[0][3]).toBe('Z');
    expect(next.piecesPlaced).toBe(1);
  });

  test('le spawn obstrué par une réserve termine aussi', () => {
    const state = { ...fixture('O', 0, 18), hold: 'I' };
    state.board[0][3] = 'Z';
    const next = act(state, 'hold');
    expect(next.gameOver).toBe(true);
    expect(next.board).toEqual(state.board);
  });

  test('une pose partiellement cachée perd sans écrire une seule cellule', () => {
    const state = fixture('T', 3, -1);
    state.board[1][3] = 'Z';
    const next = act(state, 'hardDrop');
    expect(next.gameOver).toBe(true);
    expect(next.board).toEqual(state.board);
    expect(next.piecesPlaced).toBe(0);
    expect(next.winners).toBe(null);
  });

  test('le dépassement au verrouillage stoppe le temps au moment exact', () => {
    const state = fixture('T', 3, -1);
    state.board[1][3] = 'Z';
    const next = act(state, 'tick', 1000);
    expect(next.gameOver).toBe(true);
    expect(next.elapsed).toBe(500);
    expect(next.board).toEqual(state.board);
  });
});
