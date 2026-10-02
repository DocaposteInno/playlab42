/**
 * Données locales validées, compatibles avec les lecteurs historiques.
 * Aucun accès réseau ; les erreurs sont toujours remontées à l'appelant.
 * @module local-data
 */

export const LOCAL_DATA_VERSION = 1;
export const LOCAL_DATA_SCHEMA_KEY = 'playlab42.local-data.schema';
export const BACKUP_FORMAT = 'playlab42-local-data';
export const MAX_BACKUP_LENGTH = 5 * 1024 * 1024;

const FIXED_KEYS = new Set([
  'player', 'preferences', 'recent_games', 'playlab42.activeTab',
  'playlab42.theme', 'parcours-progress',
]);
const TABS = ['tools', 'games', 'parcours', 'bookmarks'];
const RAW_KEYS = new Set(['playlab42.activeTab', 'playlab42.theme']);

/** Erreur explicite, éventuellement accompagnée d'un échec du retour arrière. */
export class LocalDataError extends Error {
  /**
   * @param {string} code - Catégorie d'erreur.
   * @param {string} message - Message affichable.
   * @param {unknown} [cause] - Erreur initiale.
   */
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = 'LocalDataError';
    this.code = code;
    this.rollbackFailed = false;
  }
}

function invalid(message) {
  throw new LocalDataError('invalid-data', message);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

function isExcludedId(id) {
  return /neural[-_]?style|relativity/i.test(id);
}

/**
 * Reconnaît les clés historiques prises en charge, sans les états des outils exclus.
 * @param {string} key - Clé de stockage.
 * @returns {boolean}
 */
export function isManagedKey(key) {
  if (FIXED_KEYS.has(key)) { return true; }
  if (typeof key !== 'string') { return false; }
  const match = /^(?:scores|progress)_([a-z][a-z0-9_-]{0,63})$/.exec(key);
  return Boolean(match && !isExcludedId(match[1]));
}

function assertJson(value, depth = 0, seen = new Set()) {
  if (depth > 100) { invalid('Données trop profondément imbriquées.'); }
  if (value === null || typeof value === 'string' || typeof value === 'boolean') { return; }
  if (typeof value === 'number' && Number.isFinite(value)) { return; }
  if (!Array.isArray(value) && !isObject(value)) { invalid('Valeur non sérialisable en JSON.'); }
  if (seen.has(value)) { invalid('Référence circulaire dans les données.'); }
  if (Object.getOwnPropertySymbols(value).length) { invalid('Propriété Symbol non sérialisable en JSON.'); }
  seen.add(value);
  if (Array.isArray(value)) {
    if (Object.keys(value).length !== value.length) {
      invalid('Tableau JSON incomplet ou propriétés supplémentaires.');
    }
    for (let index = 0; index < value.length; index++) {
      if (!Object.hasOwn(value, index)) { invalid('Tableau JSON incomplet.'); }
    }
  }
  for (const key of Object.keys(value)) {
    if (key === '__proto__') { invalid('Propriété JSON interdite.'); }
    assertJson(value[key], depth + 1, seen);
  }
  seen.delete(value);
}

function canonical(value) {
  if (Array.isArray(value)) { return `[${value.map(canonical).join(',')}]`; }
  if (isObject(value)) {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function isOversized(text) {
  if (text.length > MAX_BACKUP_LENGTH) { return true; }
  let bytes = 0;
  for (const character of text) {
    const point = character.codePointAt(0);
    bytes += point <= 0x7f ? 1 : point <= 0x7ff ? 2 : point <= 0xffff ? 3 : 4;
    if (bytes > MAX_BACKUP_LENGTH) { return true; }
  }
  return false;
}

function parse(raw, key) {
  try {
    return JSON.parse(raw);
  } catch (cause) {
    throw new LocalDataError('invalid-data', `JSON invalide pour « ${key} » ; original conservé.`, cause);
  }
}

/**
 * Valide une valeur typée ; ne normalise ni ne modifie l'objet fourni.
 * La progression d'un jeu conserve son format JSON propre au jeu.
 * @param {string} key - Clé gérée.
 * @param {unknown} value - Valeur typée.
 * @returns {void}
 */
export function validateLocalValue(key, value) {
  if (!isManagedKey(key)) { invalid(`Clé non gérée : « ${key} ».`); }
  assertJson(value);
  let valid = true;
  if (key === 'player') {
    valid = isObject(value) && typeof value.name === 'string';
  } else if (key === 'preferences') {
    valid = isObject(value) && (value.sound === undefined || typeof value.sound === 'boolean');
  } else if (key === 'recent_games') {
    valid = Array.isArray(value) && value.every(item => isObject(item)
      && typeof item.id === 'string' && ['game', 'tool'].includes(item.type)
      && Number.isFinite(item.timestamp) && item.timestamp >= 0);
  } else if (key === 'playlab42.activeTab') {
    valid = TABS.includes(value);
  } else if (key === 'playlab42.theme') {
    valid = ['light', 'dark', 'system'].includes(value);
  } else if (key === 'parcours-progress') {
    valid = isObject(value) && Object.values(value).every(item => isObject(item)
      && Array.isArray(item.visited) && item.visited.every(id => typeof id === 'string')
      && (!Object.hasOwn(item, 'current') || item.current === null || typeof item.current === 'string'));
  } else if (key.startsWith('scores_')) {
    valid = Array.isArray(value) && value.every(item => isObject(item)
      && Number.isFinite(item.score) && Number.isFinite(item.date) && item.date >= 0
      && typeof item.player === 'string');
  }
  if (!valid) { invalid(`Type de données invalide pour « ${key} » ; original conservé.`); }
}

function decode(key, raw) {
  const value = RAW_KEYS.has(key) ? raw : parse(raw, key);
  validateLocalValue(key, value);
  return value;
}

function encode(key, value) {
  validateLocalValue(key, value);
  if (key === 'playlab42.theme' && value === 'system') { return null; }
  return RAW_KEYS.has(key) ? value : canonical(value);
}

function checkSchema(storage) {
  const raw = storage.getItem(LOCAL_DATA_SCHEMA_KEY);
  if (raw === null) { return; }
  const schema = parse(raw, LOCAL_DATA_SCHEMA_KEY);
  if (!isObject(schema) || Object.keys(schema).length !== 1
    || !Number.isInteger(schema.version) || schema.version < 0) {
    invalid('Métadonnées de schéma invalides ; original conservé.');
  }
  if (schema.version > LOCAL_DATA_VERSION) {
    throw new LocalDataError('future-version', 'Schéma local plus récent, non pris en charge.');
  }
}

function storageError(cause) {
  return cause instanceof LocalDataError ? cause
    : new LocalDataError('storage', 'Stockage inaccessible ou quota dépassé.', cause);
}

/**
 * Lit et valide une clé ; fallback est utilisé uniquement si la clé est absente.
 * @template T
 * @param {string} key - Clé historique gérée.
 * @param {T} fallback - Valeur si absente.
 * @param {Storage} [storage] - Stockage injectable.
 * @returns {T|unknown} Valeur typée, sans écriture lors de la lecture.
 * @throws {LocalDataError} Corruption, schéma futur ou stockage indisponible.
 */
export function readLocalData(key, fallback, storage) {
  try {
    storage ??= globalThis.localStorage;
    if (!isManagedKey(key)) { invalid(`Clé non gérée : « ${key} ».`); }
    checkSchema(storage);
    const raw = storage.getItem(key);
    return raw === null ? fallback : decode(key, raw);
  } catch (cause) {
    throw storageError(cause);
  }
}

function writeEntries(entries, storage, schemaRaw = '{"version":1}') {
  const before = new Map();
  const written = [];
  try {
    storage ??= globalThis.localStorage;
    checkSchema(storage);
    const writes = [...Object.entries(entries), [LOCAL_DATA_SCHEMA_KEY, schemaRaw]];
    for (const [key] of writes) { before.set(key, storage.getItem(key)); }
    for (const [key, raw] of writes) {
      if (before.get(key) === raw) { continue; }
      if (raw === null) { storage.removeItem(key); }
      else { storage.setItem(key, raw); }
      written.push([key, raw]);
    }
  } catch (cause) {
    const error = storageError(cause);
    for (const [key, raw] of written.reverse()) {
      try {
        // Ne pas écraser une modification concurrente d'un autre onglet.
        if (storage.getItem(key) !== raw) {
          error.rollbackFailed = true;
          continue;
        }
        const previous = before.get(key);
        if (previous === null) { storage.removeItem(key); }
        else { storage.setItem(key, previous); }
      } catch {
        error.rollbackFailed = true;
      }
    }
    if (error.rollbackFailed) { error.message += ' Retour arrière incomplet : vérifiez vos données.'; }
    throw error;
  }
}

/**
 * Écrit plusieurs valeurs validées, avec retour arrière en cas d'échec.
 * @param {Record<string, unknown>} values - Clés et valeurs typées.
 * @param {Storage} [storage] - Stockage injectable.
 * @returns {void}
 */
export function writeLocalValues(values, storage) {
  if (!isObject(values)) { invalid('Table de valeurs attendue.'); }
  const entries = Object.create(null);
  for (const [key, value] of Object.entries(values)) { entries[key] = encode(key, value); }
  try {
    storage ??= globalThis.localStorage;
    checkSchema(storage);
    for (const key of Object.keys(entries)) {
      const previous = storage.getItem(key);
      if (previous !== null) { decode(key, previous); }
    }
  } catch (cause) {
    throw storageError(cause);
  }
  writeEntries(entries, storage);
}

/**
 * Écrit une valeur sans envelopper son format historique.
 * @param {string} key - Clé gérée.
 * @param {unknown} value - Valeur JSON, ou chaîne pour thème/onglet.
 * @param {Storage} [storage] - Stockage injectable.
 * @returns {void}
 */
export function writeLocalData(key, value, storage) {
  writeLocalValues({ [key]: value }, storage);
}

/**
 * Suppression explicite d'une seule clé gérée, jamais d'un stockage entier.
 * @param {string} key - Clé gérée.
 * @param {Storage} [storage] - Stockage injectable.
 * @returns {void}
 */
export function removeLocalData(key, storage) {
  if (!isManagedKey(key)) { invalid(`Clé non gérée : « ${key} ».`); }
  writeEntries({ [key]: null }, storage);
}

function collectManagedValues(storage) {
  checkSchema(storage);
  const values = Object.create(null);
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!isManagedKey(key)) { continue; }
    const raw = storage.getItem(key);
    if (raw !== null) { values[key] = { raw, value: decode(key, raw) }; }
  }
  return values;
}

/**
 * Réinitialise explicitement les données gérées après validation intégrale.
 * Conserve clés étrangères, états exclus et leurs éventuelles références récentes.
 * Supprime aussi la métadonnée du schéma connu, avec le même retour arrière.
 * Aucun événement applicatif : le navigateur émet les événements storage natifs.
 * @param {Storage} [storage] - Stockage injectable (length/key/getItem/setItem/removeItem).
 * @returns {{count: number}} Clés supprimées ou réécrites, hors métadonnée.
 * @throws {LocalDataError} Corruption, schéma futur ou échec du stockage.
 */
export function clearLocalData(storage) {
  try {
    storage ??= globalThis.localStorage;
    const values = collectManagedValues(storage);
    const entries = Object.create(null);
    for (const [key, { value }] of Object.entries(values)) {
      if (key === 'recent_games') {
        const excluded = value.filter(item => isExcludedId(item.id));
        if (excluded.length === value.length && excluded.length > 0) { continue; }
        entries[key] = excluded.length ? canonical(excluded) : null;
      } else {
        entries[key] = null;
      }
    }
    writeEntries(entries, storage, null);
    return { count: Object.keys(entries).length };
  } catch (cause) {
    throw storageError(cause);
  }
}

/**
 * Exporte une sauvegarde canonique sans métadonnées volatiles ni clés étrangères.
 * Les données corrompues empêchent l'export au lieu d'être ignorées.
 * @param {Storage} [storage] - Stockage injectable.
 * @returns {string} JSON de sauvegarde version 1.
 */
export function exportLocalData(storage) {
  try {
    storage ??= globalThis.localStorage;
    const entries = Object.create(null);
    for (const [key, { raw, value }] of Object.entries(collectManagedValues(storage))) {
      entries[key] = key === 'recent_games'
        ? canonical(value.filter(item => !isExcludedId(item.id)))
        : key === 'playlab42.theme' && value === 'system' ? null : raw;
    }
    if (!Object.hasOwn(entries, 'playlab42.theme')) { entries['playlab42.theme'] = null; }
    const json = canonical({ format: BACKUP_FORMAT, version: LOCAL_DATA_VERSION, entries });
    if (isOversized(json)) { invalid('Sauvegarde trop volumineuse (maximum 5 Mio).'); }
    return json;
  } catch (cause) {
    throw storageError(cause);
  }
}

/**
 * Prévalide et migre une sauvegarde sans toucher au stockage.
 * Version 0 connue : {format, version:0, data:{clé:valeurTypée}}.
 * @param {string} json - JSON saisi explicitement.
 * @returns {Record<string, string|null>} Entrées historiques validées.
 */
export function validateBackup(json) {
  if (typeof json !== 'string' || isOversized(json)) {
    invalid('Sauvegarde absente ou trop volumineuse (maximum 5 Mio).');
  }
  const backup = parse(json, 'sauvegarde');
  if (!isObject(backup) || backup.format !== BACKUP_FORMAT || !Number.isInteger(backup.version)
    || backup.version < 0) { invalid('Format de sauvegarde non reconnu.'); }
  if (backup.version > LOCAL_DATA_VERSION) {
    throw new LocalDataError('future-version', 'Version de sauvegarde plus récente, non prise en charge.');
  }
  const field = backup.version === 0 ? 'data' : 'entries';
  if (Object.keys(backup).length !== 3 || !isObject(backup[field])) {
    invalid('Enveloppe de sauvegarde invalide.');
  }
  const entries = Object.create(null);
  for (const [key, saved] of Object.entries(backup[field])) {
    if (!isManagedKey(key)) { invalid(`Clé non gérée dans la sauvegarde : « ${key} ».`); }
    if (saved === null && key === 'playlab42.theme') { entries[key] = null; continue; }
    const raw = backup.version === 0 ? encode(key, saved) : saved;
    if (raw === null && key === 'playlab42.theme') { entries[key] = null; continue; }
    if (typeof raw !== 'string') { invalid(`Chaîne brute attendue pour « ${key} ».`); }
    const value = decode(key, raw);
    if (key === 'recent_games' && value.some(item => isExcludedId(item.id))) {
      invalid('La sauvegarde contient un outil exclu dans les récents.');
    }
    entries[key] = key === 'playlab42.theme' && raw === 'system' ? null : raw;
  }
  return entries;
}

/**
 * Restaure uniquement les clés présentes après validation intégrale.
 * Les clés absentes et toutes les données étrangères restent inchangées.
 * @param {string} json - Sauvegarde choisie par l'utilisateur.
 * @param {Storage} [storage] - Stockage injectable.
 * @returns {{count: number}} Nombre de clés restaurées (hors métadonnée).
 * @throws {LocalDataError} Échec explicite, avec rollbackFailed si nécessaire.
 */
export function importLocalData(json, storage) {
  const entries = validateBackup(json);
  writeEntries(entries, storage);
  return { count: Object.keys(entries).length };
}
