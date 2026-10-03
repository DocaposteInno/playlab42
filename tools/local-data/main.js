/**
 * Initialisation de l'outil autonome, sans réseau ni import automatique.
 */
import { initTheme, syncTheme } from '../../lib/theme.js';
import { loadPreferences } from '../../app/storage.js';
import { setupLocalDataTool } from './controller.js';

initTheme();

setupLocalDataTool(document, {
  download(json) {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'playlab42-local-data.json';
    document.body.append(link);
    try {
      link.click();
    } finally {
      link.remove();
      // Laisser au navigateur le temps de démarrer le téléchargement.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  },
  refresh() {
    syncTheme();
    if (!loadPreferences()) { throw new Error('Préférences locales invalides ou inaccessibles'); }
  },
});
