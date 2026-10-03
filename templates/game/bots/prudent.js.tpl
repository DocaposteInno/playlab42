/** Bot déterministe conforme au contrat Bot, sans accès à l'état privé. */
export class PrudentBot {
  name = 'Prudent';
  description = 'Laisse si possible un multiple de trois à son adversaire.';
  difficulty = 'easy';

  /**
   * @param {{remaining: number}} view Vue publique du joueur.
   * @param {{type: 'take', count: number}[]} validActions Actions légales.
   * @returns {{type: 'take', count: number}} Action choisie.
   */
  chooseAction(view, validActions) {
    if (!validActions.length) { throw new Error('Le bot ne peut pas jouer sans action légale.'); }
    return validActions.find(action => (view.remaining - action.count) % 3 === 0) || validActions[0];
  }
}

export default PrudentBot;
