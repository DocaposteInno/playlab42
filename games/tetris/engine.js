/**
 * Moteur Tetris déterministe, isomorphe et sérialisable.
 * Les seuls temps utilisés sont les millisecondes explicites des actions tick.
 */
import { SeededRandom } from '../../lib/seeded-random.js';

/**
 * @typedef {'I'|'J'|'L'|'O'|'S'|'T'|'Z'} PieceType
 * @typedef {{type: PieceType, rotation: number, x: number, y: number}} Piece
 * @typedef {{type: string, delta?: number}} TetrisAction
 * @typedef {Object} TetrisState
 * @property {(PieceType|null)[][]} board - Vingt lignes visibles de dix cases.
 * @property {Piece|null} active - Pièce mobile, éventuellement au-dessus de la grille.
 * @property {PieceType[]} queue - File comprenant au moins cinq prochaines pièces.
 * @property {PieceType|null} hold - Réserve.
 * @property {boolean} canHold - Une réserve autorisée par pièce.
 * @property {number} score - Points cumulés.
 * @property {number} lines - Lignes cumulées.
 * @property {number} level - Niveau, une augmentation toutes les dix lignes.
 * @property {number} elapsed - Temps simulé écoulé en millisecondes.
 * @property {'marathon'|'sprint'|'ultra'} mode - Objectif de la partie.
 * @property {boolean} gameOver - Partie terminée.
 * @property {string[]|null} winners - Joueur gagnant ou null en cas de dépassement.
 * @property {number} piecesPlaced - Nombre de pièces verrouillées.
 * @property {number} combo - Série de clears ; -1 avant le premier clear.
 * @property {boolean} backToBack - Série de clears difficiles en cours.
 * @property {{lines:number,label:string,points:number}} lastClear - Dernier verrouillage.
 * @property {string} currentPlayerId - Joueur solo.
 * @property {number} rngState - État 32 bits du générateur.
 * @property {number} gravityElapsed - Temps depuis le dernier pas de gravité.
 * @property {number} lockElapsed - Temps passé posé depuis le dernier reset.
 * @property {number} lockResets - Resets de verrouillage consommés (maximum quinze).
 * @property {{kick:number}|null} lastRotation - Rotation non annulée par un déplacement manuel.
 */

/** Matrices initiales SRS, protégées contre les mutations extérieures. */
export const PIECES = Object.freeze(Object.fromEntries(Object.entries({
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
  O: [[1, 1], [1, 1]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
}).map(([type, matrix]) => [
  type, Object.freeze(matrix.map(row => Object.freeze(row))),
])));

const TYPES = Object.keys(PIECES);
const ACTIONS = ['left', 'right', 'rotateCW', 'rotateCCW', 'softDrop', 'hardDrop', 'hold', 'tick'];
const LOCK_DELAY = 500;
const MAX_RESETS = 15;
const ULTRA_DURATION = 120000;
// Les pas de requestAnimationFrame peuvent additionner 999,999999999998 ms.
const TIME_EPSILON = 1e-9;

// Coordonnées SRS publiées avec y vers le haut ; conversion lors de l'essai.
const JLSTZ_KICKS = {
  '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
};
const I_KICKS = {
  '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
};

/**
 * Retourne les quatre cellules absolues d'une pièce (y négatif autorisé).
 * @param {Piece} piece - Pièce SRS.
 * @returns {{x:number,y:number}[]} Cellules occupées.
 */
export function getCells(piece) {
  const matrix = PIECES[piece.type];
  const size = matrix.length;
  const cells = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!matrix[y][x]) { continue; }
      let rx = x;
      let ry = y;
      if (piece.type !== 'O') {
        for (let i = 0; i < piece.rotation; i++) {
          [rx, ry] = [size - 1 - ry, rx];
        }
      }
      cells.push({ x: piece.x + rx, y: piece.y + ry });
    }
  }
  return cells;
}

/**
 * Intervalle progressif de gravité, borné à 50 ms.
 * @param {number} level - Niveau positif.
 * @returns {number} Millisecondes entières par case.
 */
export function getDropInterval(level) {
  return Math.max(50, Math.floor(1000 * 0.8 ** (Math.max(1, level) - 1)));
}

/**
 * Détecte murs, plancher et blocs sans considérer le haut comme un mur.
 * @param {TetrisState} state - État.
 * @param {Piece} piece - Position à tester.
 * @returns {boolean} Position libre.
 */
function fits(state, piece) {
  return getCells(piece).every(({ x, y }) =>
    x >= 0 && x < 10 && y < 20 && (y < 0 || state.board[y][x] === null));
}

/**
 * Projette la pièce jusqu'à sa position de verrouillage, sans modifier l'état.
 * @param {TetrisState} state - État.
 * @returns {Piece|null} Projection ou null sans pièce active.
 */
export function getGhostPiece(state) {
  if (!state.active) { return null; }
  const ghost = { ...state.active };
  while (fits(state, { ...ghost, y: ghost.y + 1 })) { ghost.y++; }
  return ghost;
}

/**
 * Complète la file uniquement par sacs complets de sept pièces.
 * @param {TetrisState} state - Copie mutable privée.
 */
function refill(state) {
  if (state.queue.length >= 5) { return; }
  const rng = SeededRandom.fromState(state.rngState);
  state.queue.push(...rng.shuffle([...TYPES]));
  state.rngState = rng.getState() >>> 0;
}

/**
 * Termine une partie ; un dépassement n'est pas une victoire.
 * @param {TetrisState} state - Copie privée.
 * @param {boolean} victory - Objectif accompli.
 */
function finish(state, victory) {
  state.gameOver = true;
  state.winners = victory ? [state.currentPlayerId] : null;
  state.active = null;
}

/**
 * Fait apparaître une pièce avec des délais vierges.
 * @param {TetrisState} state - Copie privée.
 * @param {PieceType} type - Type.
 */
function spawn(state, type) {
  state.active = { type, rotation: 0, x: type === 'O' ? 4 : 3, y: -1 };
  state.gravityElapsed = 0;
  state.lockElapsed = 0;
  state.lockResets = 0;
  state.lastRotation = null;
  if (!fits(state, state.active)) { finish(state, false); }
}

/**
 * Prend la pièce suivante en garantissant cinq aperçus.
 * @param {TetrisState} state - Copie privée.
 */
function spawnNext(state) {
  refill(state);
  const type = state.queue.shift();
  refill(state);
  spawn(state, type);
}

/**
 * Une rotation T et trois coins occupés distinguent spin complet et mini.
 * La gravité conserve cette rotation ; une translation manuelle réussie l'annule.
 * Les deux coins avant ou le cinquième kick SRS font un spin complet.
 * @param {TetrisState} state - État avant pose.
 * @returns {string|null} 'T-spin', 'T-spin mini' ou null.
 */
function getSpin(state) {
  const piece = state.active;
  if (piece.type !== 'T' || !state.lastRotation) { return null; }
  const x = piece.x + 1;
  const y = piece.y + 1;
  const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([dx, dy]) => {
    const cx = x + dx;
    const cy = y + dy;
    return cx < 0 || cx >= 10 || cy < 0 || cy >= 20 || state.board[cy][cx] !== null;
  });
  if (corners.filter(Boolean).length < 3) { return null; }
  const front = [[0, 1], [1, 2], [2, 3], [3, 0]][piece.rotation];
  return (front.every(index => corners[index]) || state.lastRotation.kick === 4)
    ? 'T-spin' : 'T-spin mini';
}

/**
 * Verrouille sans jamais écrire une cellule cachée ou remplacer un bloc.
 * Barème : lignes 100/300/500/800, spins 400/800/1200/1600,
 * minis 100/200/400 ; B2B ×1,5 et combo 50 × index, multipliés par niveau.
 * @param {TetrisState} state - Copie privée.
 */
function lock(state) {
  const cells = getCells(state.active);
  if (cells.some(({ y }) => y < 0) || !fits(state, state.active)) {
    finish(state, false);
    return;
  }
  const spin = getSpin(state);
  for (const { x, y } of cells) { state.board[y][x] = state.active.type; }
  const remaining = state.board.filter(row => row.some(cell => cell === null));
  const lines = 20 - remaining.length;
  state.board = [
    ...Array.from({ length: lines }, () => Array(10).fill(null)), ...remaining,
  ];
  const difficult = lines > 0 && (lines === 4 || spin !== null);
  let base = spin === 'T-spin' ? [400, 800, 1200, 1600][lines]
    : spin === 'T-spin mini' ? [100, 200, 400][lines]
      : [0, 100, 300, 500, 800][lines];
  if (difficult && state.backToBack) { base *= 1.5; }
  state.combo = lines > 0 ? state.combo + 1 : -1;
  const points = (base + (lines > 0 ? 50 * state.combo : 0)) * state.level;
  state.score += points;
  state.lines += lines;
  state.level = 1 + Math.floor(state.lines / 10);
  state.piecesPlaced++;
  state.lastClear = {
    lines,
    label: spin ? `${spin}${lines ? ` ${['', 'Single', 'Double', 'Triple'][lines]}` : ''}`
      : ['None', 'Single', 'Double', 'Triple', 'Tetris'][lines],
    points,
  };
  if (lines > 0) { state.backToBack = difficult; }
  state.canHold = true;
  if (state.mode === 'sprint' && state.lines >= 40) { finish(state, true); }
  else { spawnNext(state); }
}

/**
 * Réinitialise le délai après une manipulation réussie commencée au sol.
 * Le budget persiste même lorsque le kick soulève momentanément la pièce.
 * @param {TetrisState} state - Copie privée.
 * @param {boolean} grounded - Pièce posée avant manipulation.
 */
function resetLock(state, grounded) {
  if (grounded && state.lockResets < MAX_RESETS) {
    state.lockElapsed = 0;
    state.lockResets++;
  }
}

/**
 * Avance jusqu'au prochain événement plutôt qu'arrondir par frame.
 * Gravité, contact, verrouillage et limite Ultra restent indépendants du découpage.
 * @param {TetrisState} state - Copie privée.
 * @param {number} delta - Millisecondes à simuler.
 */
function tick(state, delta) {
  let remaining = delta;
  while (remaining > 0 && !state.gameOver) {
    const interval = getDropInterval(state.level);
    const grounded = !fits(state, { ...state.active, y: state.active.y + 1 });
    const untilGravity = Math.max(0, interval - state.gravityElapsed);
    const untilLock = grounded ? Math.max(0, LOCK_DELAY - state.lockElapsed) : Infinity;
    const untilEnd = state.mode === 'ultra' ? ULTRA_DURATION - state.elapsed : Infinity;
    const step = Math.min(remaining, untilGravity, untilLock, untilEnd);
    state.elapsed += step;
    state.gravityElapsed += step;
    if (grounded) { state.lockElapsed += step; }
    remaining -= step;
    if (state.mode === 'ultra' && state.elapsed >= ULTRA_DURATION - TIME_EPSILON) {
      state.elapsed = ULTRA_DURATION;
      finish(state, true);
    } else if (grounded && state.lockElapsed >= LOCK_DELAY - TIME_EPSILON) {
      lock(state);
    } else if (state.gravityElapsed >= interval - TIME_EPSILON) {
      state.gravityElapsed = 0;
      const down = { ...state.active, y: state.active.y + 1 };
      if (fits(state, down)) { state.active = down; }
    }
  }
}

/** Moteur solo conforme au contrat GameEngine du dépôt. */
export class TetrisEngine {
  /**
   * @param {{seed:number,playerIds:[string],mode?:'marathon'|'sprint'|'ultra'}} config - Configuration.
   * @returns {TetrisState} État initial complet.
   */
  init(config) {
    if (!config || !Number.isInteger(config.seed) || !Number.isFinite(config.seed)
      || !Array.isArray(config.playerIds) || config.playerIds.length !== 1
      || typeof config.playerIds[0] !== 'string' || !config.playerIds[0].trim()
      || !['marathon', 'sprint', 'ultra'].includes(config.mode === undefined ? 'marathon' : config.mode)) {
      throw new Error('Invalid Tetris configuration');
    }
    const state = {
      board: Array.from({ length: 20 }, () => Array(10).fill(null)),
      active: null, queue: [], hold: null, canHold: true,
      score: 0, lines: 0, level: 1, elapsed: 0,
      mode: config.mode ?? 'marathon', gameOver: false, winners: null,
      piecesPlaced: 0, combo: -1, backToBack: false,
      lastClear: { lines: 0, label: 'None', points: 0 },
      currentPlayerId: config.playerIds[0], rngState: config.seed >>> 0,
      gravityElapsed: 0, lockElapsed: 0, lockResets: 0, lastRotation: null,
    };
    spawnNext(state);
    return state;
  }

  /**
   * Une collision est une action valide sans effet, contrairement à une mauvaise entrée.
   * @param {TetrisState} state - État.
   * @param {TetrisAction} action - Action.
   * @param {string} playerId - Joueur.
   * @returns {boolean} Action autorisée.
   */
  isValidAction(state, action, playerId) {
    return Boolean(state && !state.gameOver && state.active
      && state.currentPlayerId === playerId && action && typeof action === 'object' && !Array.isArray(action)
      && ACTIONS.includes(action.type)
      && (action.type !== 'hold' || state.canHold)
      && (action.type !== 'tick' || (Number.isFinite(action.delta)
        && action.delta >= 0 && action.delta <= 1000)));
  }

  /**
   * Retourne des actions concrètes valides ; tick(0) représente l'action paramétrée.
   * @param {TetrisState} state - État.
   * @param {string} playerId - Joueur.
   * @returns {TetrisAction[]} Actions disponibles.
   */
  getValidActions(state, playerId) {
    return ACTIONS.map(type => type === 'tick' ? { type, delta: 0 } : { type })
      .filter(action => this.isValidAction(state, action, playerId));
  }

  /**
   * Copie les structures modifiées ; aucune entrée, même gelée, n'est mutée.
   * @param {TetrisState} state - État précédent.
   * @param {TetrisAction} action - Action validée.
   * @param {string} playerId - Joueur.
   * @returns {TetrisState} Nouvel état.
   */
  applyAction(state, action, playerId) {
    if (!this.isValidAction(state, action, playerId)) { throw new Error('Invalid action'); }
    const next = {
      ...state, board: state.board.map(row => [...row]), queue: [...state.queue],
      active: { ...state.active }, lastClear: { ...state.lastClear },
      lastRotation: state.lastRotation ? { ...state.lastRotation } : null,
      winners: state.winners ? [...state.winners] : null,
    };
    const piece = next.active;
    const grounded = !fits(next, { ...piece, y: piece.y + 1 });
    if (action.type === 'tick') {
      tick(next, action.delta);
    } else if (action.type === 'hold') {
      const held = next.hold;
      next.hold = piece.type;
      if (held) { spawn(next, held); } else { spawnNext(next); }
      next.canHold = false;
    } else if (action.type === 'hardDrop') {
      next.active = getGhostPiece(next);
      const distance = next.active.y - piece.y;
      next.score += distance * 2;
      lock(next);
    } else if (action.type === 'rotateCW' || action.type === 'rotateCCW') {
      if (piece.type === 'O') { return next; }
      const rotation = (piece.rotation + (action.type === 'rotateCW' ? 1 : 3)) % 4;
      const table = piece.type === 'I' ? I_KICKS : JLSTZ_KICKS;
      const kicks = table[`${piece.rotation}>${rotation}`];
      for (let i = 0; i < kicks.length; i++) {
        const [dx, dy] = kicks[i];
        const candidate = { ...piece, rotation, x: piece.x + dx, y: piece.y - dy };
        if (fits(next, candidate)) {
          next.active = candidate;
          next.lastRotation = { kick: i };
          resetLock(next, grounded);
          break;
        }
      }
    } else {
      const candidate = {
        ...piece,
        x: piece.x + (action.type === 'left' ? -1 : action.type === 'right' ? 1 : 0),
        y: piece.y + (action.type === 'softDrop' ? 1 : 0),
      };
      if (fits(next, candidate)) {
        next.active = candidate;
        next.lastRotation = null;
        if (action.type === 'softDrop') { next.score++; }
        else { resetLock(next, grounded); }
      }
    }
    return next;
  }

  /**
   * @param {TetrisState} state - État sans information cachée.
   * @param {string} _playerId - Joueur.
   * @returns {TetrisState} Vue complète.
   */
  getPlayerView(state, _playerId) { return state; }

  /** @param {TetrisState} state - État. @returns {boolean} Partie terminée. */
  isGameOver(state) { return state.gameOver; }

  /** @param {TetrisState} state - État. @returns {string[]|null} Gagnants. */
  getWinners(state) { return state.winners; }

  /** @param {TetrisState} state - État. @returns {string} Joueur actif. */
  getCurrentPlayer(state) { return state.currentPlayerId; }
}

export default TetrisEngine;
