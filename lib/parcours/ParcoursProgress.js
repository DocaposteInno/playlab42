/**
 * Gestion de la progression dans un parcours
 */

import { readLocalData, writeLocalData } from '../local-data.js';

const STORAGE_KEY = 'parcours-progress';

export class ParcoursProgress {
  /**
   * @param {string} epicId - ID de l'epic
   */
  constructor(epicId) {
    this.epicId = epicId;
    this.data = { visited: [], current: null };
    this.lastError = null;
  }

  /**
   * Charge la progression validée, sans supprimer les originaux invalides.
   * @returns {boolean} Succès de la lecture.
   */
  load() {
    try {
      const all = readLocalData(STORAGE_KEY, {});
      this.data = Object.hasOwn(all, this.epicId) ? all[this.epicId] : { visited: [], current: null };
      this.lastError = null;
      return true;
    } catch (error) {
      this.lastError = error;
      console.warn('Erreur lecture progression:', error);
      return false;
    }
  }

  /**
   * Sauvegarde sans écraser un document invalide ou une version future.
   * @returns {boolean} Succès de la sauvegarde.
   */
  save() {
    try {
      const all = readLocalData(STORAGE_KEY, {});
      writeLocalData(STORAGE_KEY, { ...all, [this.epicId]: this.data });
      this.lastError = null;
      return true;
    } catch (e) {
      this.lastError = e;
      console.warn('Erreur sauvegarde progression:', e);
      return false;
    }
  }

  /**
   * Marque une slide comme visitée
   * @param {string} slideId
   * @returns {boolean} Succès de la sauvegarde.
   */
  markVisited(slideId) {
    if (!this.data.visited.includes(slideId)) {
      this.data.visited.push(slideId);
    }
    this.data.current = slideId;
    return this.save();
  }

  /**
   * Vérifie si une slide a été visitée
   * @param {string} slideId
   * @returns {boolean}
   */
  isVisited(slideId) {
    return this.data.visited.includes(slideId);
  }

  /**
   * Retourne la slide courante
   * @returns {string|null}
   */
  getCurrentSlide() {
    return this.data.current;
  }
}
