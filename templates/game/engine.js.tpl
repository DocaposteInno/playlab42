import { SeededRandom } from '../../lib/seeded-random.js';

/** @typedef {{type: 'take', count: number}} Action */
/**
 * @typedef {Object} State
 * @property {number} rngState État du générateur déterministe.
 * @property {string[]} playerIds Les deux joueurs.
 * @property {string|null} currentPlayerId Joueur actif.
 * @property {number} remaining Pierres restantes.
 * @property {number} turn Nombre d'actions jouées.
 * @property {boolean} gameOver Partie terminée.
 * @property {string[]|null} winners Gagnant, ou null en cours de partie.
 */

/** Moteur pur conforme au contrat GameEngine ; aucune dépendance au DOM. */
export class Engine {
  /**
   * @param {{seed: number, playerIds: string[]}} config Configuration de la partie.
   * @returns {State} État initial sérialisable.
   */
  init({ seed, playerIds }) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff
      || !Array.isArray(playerIds) || playerIds.length !== 2
      || playerIds.some(id => typeof id !== 'string' || !id.trim())
      || new Set(playerIds).size !== 2) {
      throw new Error('Fournir une seed entière 32 bits et deux identifiants de joueurs distincts.');
    }
    const rng = new SeededRandom(seed);
    const remaining = rng.int(9, 15);
    return {
      rngState: rng.getState(),
      playerIds: [...playerIds],
      currentPlayerId: playerIds[0],
      remaining,
      turn: 0,
      gameOver: false,
      winners: null,
    };
  }

  /**
   * @param {State} state État courant.
   * @param {Action} action Action proposée.
   * @param {string} playerId Joueur demandeur.
   * @returns {boolean} L'action respecte les règles.
   */
  isValidAction(state, action, playerId) {
    return !state.gameOver && state.currentPlayerId === playerId
      && action?.type === 'take' && [1, 2].includes(action.count)
      && action.count <= state.remaining;
  }

  /**
   * @param {State} state État courant, jamais modifié.
   * @param {Action} action Action proposée.
   * @param {string} playerId Joueur demandeur.
   * @returns {State} Nouvel état indépendant.
   */
  applyAction(state, action, playerId) {
    if (!this.isValidAction(state, action, playerId)) { throw new Error('Action interdite : vérifier le tour et le nombre de pierres.'); }
    const remaining = state.remaining - action.count;
    return {
      ...state,
      playerIds: [...state.playerIds],
      remaining,
      turn: state.turn + 1,
      gameOver: remaining === 0,
      winners: remaining === 0 ? [playerId] : null,
      currentPlayerId: remaining === 0 ? null : state.playerIds.find(id => id !== playerId),
    };
  }

  /**
   * @param {State} state État courant.
   * @param {string} playerId Joueur demandeur.
   * @returns {Action[]} Actions légales.
   */
  getValidActions(state, playerId) {
    return [1, 2].map(count => ({ type: 'take', count }))
      .filter(action => this.isValidAction(state, action, playerId));
  }

  /**
   * @param {State} state État courant, entièrement public.
   * @param {string} playerId Joueur destinataire.
   * @returns {State} Copie sans référence mutable partagée.
   */
  getPlayerView(state, playerId) {
    if (!state.playerIds.includes(playerId)) { throw new Error('Joueur inconnu.'); }
    return { ...state, playerIds: [...state.playerIds], winners: state.winners ? [...state.winners] : null };
  }

  /** @param {State} state État courant. @returns {boolean} Partie terminée. */
  isGameOver(state) { return state.gameOver; }
  /** @param {State} state État courant. @returns {string[]|null} Gagnants. */
  getWinners(state) { return state.winners ? [...state.winners] : null; }
  /** @param {State} state État courant. @returns {string|null} Joueur actif. */
  getCurrentPlayer(state) { return state.currentPlayerId; }
}
