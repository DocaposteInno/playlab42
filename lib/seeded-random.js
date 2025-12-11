/**
 * SeededRandom - Générateur de nombres pseudo-aléatoires déterministe
 * Utilise l'algorithme Mulberry32
 *
 * @see openspec/specs/seeded-random/spec.md
 */

export class SeededRandom {
  #state;

  /**
   * Crée un générateur avec une seed donnée.
   * @param {number} seed - Nombre entier pour initialiser le générateur
   */
  constructor(seed) {
    // S'assurer que la seed est un entier 32 bits non signé
    this.#state = seed >>> 0;
  }

  /**
   * Retourne un nombre flottant dans [0, 1[
   * Équivalent de Math.random() mais déterministe.
   * @returns {number}
   */
  random() {
    // Algorithme Mulberry32
    let t = (this.#state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Retourne un entier dans [min, max] (inclus).
   * @param {number} min - Borne inférieure (incluse)
   * @param {number} max - Borne supérieure (incluse)
   * @returns {number}
   */
  int(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  /**
   * Retourne un élément aléatoire d'un tableau.
   * @template T
   * @param {T[]} array - Tableau non vide
   * @returns {T}
   * @throws {Error} Si le tableau est vide
   */
  pick(array) {
    if (array.length === 0) {
      throw new Error('Cannot pick from empty array');
    }
    return array[this.int(0, array.length - 1)];
  }

  /**
   * Mélange un tableau en place (Fisher-Yates).
   * @template T
   * @param {T[]} array - Tableau à mélanger
   * @returns {T[]} Le même tableau, mélangé
   */
  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = this.int(0, i);
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  /**
   * Retourne true avec une probabilité donnée.
   * @param {number} probability - Probabilité entre 0 et 1
   * @returns {boolean}
   */
  chance(probability) {
    return this.random() < probability;
  }

  /**
   * Retourne l'état actuel (pour sérialisation).
   * @returns {number}
   */
  getState() {
    return this.#state;
  }

  /**
   * Clone le générateur dans son état actuel.
   * @returns {SeededRandom}
   */
  clone() {
    const clone = new SeededRandom(0);
    clone.#state = this.#state;
    return clone;
  }

  /**
   * Crée un générateur depuis un état sauvegardé.
   * @param {number} state - État sauvegardé
   * @returns {SeededRandom}
   */
  static fromState(state) {
    const rng = new SeededRandom(0);
    rng.#state = state >>> 0;
    return rng;
  }
}

// Export par défaut pour compatibilité
export default SeededRandom;
