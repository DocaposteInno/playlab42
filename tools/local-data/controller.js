/**
 * Contrôles natifs de sauvegarde ; les fichiers sont lus uniquement sur demande.
 * @module tools/local-data/controller
 */
import { exportLocalData, importLocalData, MAX_BACKUP_LENGTH } from '../../lib/local-data.js';

/**
 * Branche l'outil avec des adaptateurs injectables pour les tests.
 * @param {Document} root - Document contenant les contrôles.
 * @param {Object} options - Adaptateurs de stockage, téléchargement et rafraîchissement.
 * @param {Storage} [options.storage] - Stockage local.
 * @param {Function} options.download - Reçoit le texte JSON à télécharger.
 * @param {Function} options.refresh - Recharge préférences et thème après écriture.
 * @returns {Function} Désabonnement des contrôles.
 */
export function setupLocalDataTool(root, { storage, download, refresh }) {
  const exportButton = root.getElementById('export');
  const importButton = root.getElementById('import');
  const input = root.getElementById('backup-file');
  const status = root.getElementById('status');
  let busy = false;
  const report = (message) => { status.textContent = message; };
  const setBusy = (value) => {
    busy = value;
    exportButton.disabled = value;
    importButton.disabled = value;
    input.disabled = value;
  };
  const onExport = () => {
    if (busy) { return; }
    try {
      download(exportLocalData(storage));
      report('Sauvegarde préparée ; téléchargement demandé au navigateur.');
    } catch (error) {
      report(`Échec de l'export : ${error.message}`);
    }
  };
  const onImport = async () => {
    if (busy) { return; }
    const file = input.files?.[0];
    if (!file) { report('Choisissez un fichier de sauvegarde avant de l’importer.'); return; }
    if (file.size > MAX_BACKUP_LENGTH) {
      report('Échec de l’import : fichier trop volumineux (maximum 5 Mio).');
      return;
    }
    setBusy(true);
    report('Lecture et validation du fichier…');
    let restored = false;
    try {
      const json = await file.text();
      const result = importLocalData(json, storage);
      restored = true;
      await refresh();
      report(`Import réussi : ${result.count} clé(s) restaurée(s). Rechargez les autres pages ouvertes.`);
    } catch (error) {
      report(restored
        ? `Données restaurées, mais affichage non actualisé : ${error.message}. Rechargez la page.`
        : `Échec de l’import : ${error.message}`);
    } finally {
      setBusy(false);
    }
  };
  exportButton.addEventListener('click', onExport);
  importButton.addEventListener('click', onImport);
  return () => {
    exportButton.removeEventListener('click', onExport);
    importButton.removeEventListener('click', onImport);
  };
}
