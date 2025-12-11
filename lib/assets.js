/**
 * AssetLoader - Chargeur d'assets pour les jeux
 * Gère le chargement et le cache des images, sons et données JSON
 *
 * @see openspec/specs/gamekit/spec.md
 */

export class AssetLoader {
  #gameName;
  #basePath;
  #images = new Map();
  #audio = new Map();
  #data = new Map();
  #audioInstances = [];

  /**
   * Crée un nouveau chargeur d'assets pour un jeu.
   * @param {string} gameName - Identifiant du jeu
   */
  constructor(gameName) {
    this.#gameName = gameName;
    this.#basePath = `/games/${gameName}/`;
  }

  /**
   * Résout un chemin relatif en chemin absolu.
   * @param {string} src - Chemin relatif
   * @returns {string}
   */
  #resolvePath(src) {
    // Si le chemin est déjà absolu, le retourner tel quel
    if (src.startsWith('/') || src.startsWith('http')) {
      return src;
    }
    return this.#basePath + src;
  }

  /**
   * Charge une image.
   * @param {string} src - Chemin vers l'image (relatif au dossier du jeu)
   * @returns {Promise<HTMLImageElement>}
   */
  async loadImage(src) {
    const fullPath = this.#resolvePath(src);

    // Vérifier le cache
    if (this.#images.has(fullPath)) {
      return this.#images.get(fullPath);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.#images.set(fullPath, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${fullPath}`));
      };
      img.src = fullPath;
    });
  }

  /**
   * Charge un fichier audio.
   * @param {string} src - Chemin vers le fichier audio (relatif au dossier du jeu)
   * @returns {Promise<HTMLAudioElement>}
   */
  async loadAudio(src) {
    const fullPath = this.#resolvePath(src);

    // Vérifier le cache
    if (this.#audio.has(fullPath)) {
      return this.#audio.get(fullPath).cloneNode();
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio();
      audio.oncanplaythrough = () => {
        this.#audio.set(fullPath, audio);
        resolve(audio.cloneNode());
      };
      audio.onerror = () => {
        reject(new Error(`Failed to load audio: ${fullPath}`));
      };
      audio.src = fullPath;
      audio.load();
    });
  }

  /**
   * Charge et parse un fichier JSON.
   * @template T
   * @param {string} src - Chemin vers le fichier JSON (relatif au dossier du jeu)
   * @returns {Promise<T>}
   */
  async loadJSON(src) {
    const fullPath = this.#resolvePath(src);

    // Vérifier le cache
    if (this.#data.has(fullPath)) {
      return structuredClone(this.#data.get(fullPath));
    }

    const response = await fetch(fullPath);
    if (!response.ok) {
      throw new Error(`Failed to load JSON: ${fullPath}`);
    }

    const data = await response.json();
    this.#data.set(fullPath, data);
    return structuredClone(data);
  }

  /**
   * Précharge plusieurs assets avec suivi de progression.
   * @param {Array<{type: 'image'|'audio'|'json', src: string}>} manifest
   * @param {(progress: number) => void} [onProgress] - Callback de progression (0-1)
   * @returns {Promise<{loaded: string[], failed: Array<{src: string, error: string}>}>}
   */
  async preload(manifest, onProgress) {
    const results = {
      loaded: [],
      failed: []
    };

    let completed = 0;
    const total = manifest.length;

    const updateProgress = () => {
      completed++;
      if (onProgress) {
        onProgress(completed / total);
      }
    };

    const loadPromises = manifest.map(async ({ type, src }) => {
      try {
        switch (type) {
          case 'image':
            await this.loadImage(src);
            break;
          case 'audio':
            await this.loadAudio(src);
            break;
          case 'json':
            await this.loadJSON(src);
            break;
          default:
            throw new Error(`Unknown asset type: ${type}`);
        }
        results.loaded.push(src);
      } catch (error) {
        results.failed.push({
          src,
          error: error.message
        });
      } finally {
        updateProgress();
      }
    });

    await Promise.all(loadPromises);
    return results;
  }

  /**
   * Récupère une image déjà chargée.
   * @param {string} src - Chemin de l'image
   * @returns {HTMLImageElement|undefined}
   */
  getImage(src) {
    const fullPath = this.#resolvePath(src);
    return this.#images.get(fullPath);
  }

  /**
   * Récupère un clone d'un audio déjà chargé.
   * Permet la lecture simultanée de plusieurs instances.
   * @param {string} src - Chemin de l'audio
   * @returns {HTMLAudioElement|null}
   */
  getAudio(src) {
    const fullPath = this.#resolvePath(src);
    const original = this.#audio.get(fullPath);
    if (!original) return null;

    const clone = original.cloneNode();
    this.#audioInstances.push(clone);
    return clone;
  }

  /**
   * Récupère un clone des données JSON déjà chargées.
   * @template T
   * @param {string} src - Chemin du fichier JSON
   * @returns {T|null}
   */
  getData(src) {
    const fullPath = this.#resolvePath(src);
    const data = this.#data.get(fullPath);
    return data ? structuredClone(data) : null;
  }

  /**
   * Libère toutes les ressources et arrête tous les sons.
   */
  dispose() {
    // Arrêter tous les audios en cours
    for (const audio of this.#audioInstances) {
      audio.pause();
      audio.src = '';
    }
    for (const audio of this.#audio.values()) {
      audio.pause();
      audio.src = '';
    }

    // Vider les caches
    this.#images.clear();
    this.#audio.clear();
    this.#data.clear();
    this.#audioInstances = [];
  }
}

// Export par défaut pour compatibilité
export default AssetLoader;
