/**
 * Bot Random - Joue un Triomino au hasard parmi les actions légales
 * @see openspec/specs/bot/spec.md
 */

import type { PlayerView, TriominoAction } from '../../dist/engine.js';

/** Interface minimale du générateur aléatoire */
interface Rng {
  pick<T>(array: T[]): T;
}

export class RandomBot {
  name = 'Random';
  description = 'Joue au hasard parmi les actions légales';
  difficulty = 'easy';

  /**
   * Choisit une action au hasard parmi les actions légales.
   * @param _view - Vue du jeu (non utilisée)
   * @param validActions - Actions légales disponibles
   * @param rng - Générateur aléatoire déterministe
   */
  chooseAction(
    _view: PlayerView,
    validActions: TriominoAction[],
    rng: Rng,
  ): TriominoAction {
    return rng.pick(validActions);
  }
}

export default RandomBot;
