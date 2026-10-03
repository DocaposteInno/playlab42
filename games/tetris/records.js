const MODES = ['marathon', 'sprint', 'ultra'];

/**
 * Valide le petit schéma sauvegardé sans faire confiance au stockage.
 * @param {unknown} data - Valeur chargée par GameKit.
 * @returns {boolean} Compatibilité avec les records v1.
 */
export function isRecordData(data) {
  return !!data && typeof data === 'object' && data.version === 1 &&
    MODES.every(mode => data[mode] === null ||
      (Number.isFinite(data[mode]) && data[mode] >= 0));
}

/** Records indépendants des scores génériques, particulièrement pour Sprint. */
export class TetrisRecords {
  /**
   * @param {object} kit - SDK de persistance.
   * @param {(message: string) => void} notify - Notification visible.
   */
  constructor(kit, notify) {
    this.kit = kit;
    this.notify = notify;
    const data = kit.loadProgress();
    this.data = { version: 1, marathon: null, sprint: null, ultra: null };
    if (isRecordData(data)) {
      this.data = { ...data };
    } else if (data !== null) {
      notify('Les anciens records sont illisibles. Les nouveaux records les remplaceront.');
    }
  }

  /**
   * Enregistre une seule fois le résultat terminal.
   * @param {object} state - Partie terminée.
   * @returns {boolean} Nouveau record personnel.
   */
  finish(state) {
    const completedSprint = state.mode === 'sprint' && state.lines >= 40;
    const value = state.mode === 'sprint' ? state.elapsed : state.score;
    const previous = this.data[state.mode];
    const better = (state.mode !== 'sprint' || completedSprint) &&
      (previous === null || (state.mode === 'sprint' ? value < previous : value > previous));
    if (better) {
      this.data[state.mode] = value;
      if (!this.kit.saveProgress(this.data)) {
        this.notify('Le stockage est indisponible : ce record restera uniquement en mémoire.');
      }
    }
    if (state.mode !== 'sprint' && !this.kit.saveScore(state.score)) {
      this.notify('Le stockage est indisponible : le score ne peut pas être sauvegardé.');
    }
    return better;
  }

  /**
   * @param {string} mode - Mode courant.
   * @returns {number|null} Score maximal ou temps minimal.
   */
  get(mode) {
    return this.data[mode];
  }
}
