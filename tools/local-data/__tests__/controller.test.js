/** @jest-environment jsdom */
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { setupLocalDataTool } from '../controller.js';
import { BACKUP_FORMAT, LOCAL_DATA_SCHEMA_KEY } from '../../../lib/local-data.js';

describe('Outil de sauvegarde accessible', () => {
  let data;
  let storage;
  let download;
  let refresh;
  let status;

  beforeEach(() => {
    document.body.innerHTML = `
      <button id="export" type="button">Exporter</button>
      <label for="backup-file">Sauvegarde JSON</label><input id="backup-file" type="file">
      <button id="import" type="button">Importer</button>
      <p id="status" role="status" aria-live="polite" aria-atomic="true"></p>`;
    data = new Map([['player', '{"name":"Ada"}'], ['foreign', 'private']]);
    storage = {
      get length() { return data.size; },
      key: index => [...data.keys()][index] ?? null,
      getItem: jest.fn(key => data.get(key) ?? null),
      setItem: jest.fn((key, value) => data.set(key, value)),
      removeItem: jest.fn(key => data.delete(key)),
    };
    download = jest.fn();
    refresh = jest.fn();
    status = document.getElementById('status');
    setupLocalDataTool(document, { storage, download, refresh });
  });

  function select(json, size = json.length) {
    Object.defineProperty(document.getElementById('backup-file'), 'files', {
      configurable: true, value: [{ size, text: jest.fn().mockResolvedValue(json) }],
    });
  }

  async function clickImport() {
    document.getElementById('import').click();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  }

  const valid = () => JSON.stringify({
    format: BACKUP_FORMAT, version: 1,
    entries: { player: '{"name":"Grace"}', 'playlab42.theme': 'light' },
  });

  it('exporte seulement après un clic explicite et annonce le téléchargement', () => {
    expect(download).not.toHaveBeenCalled();
    document.getElementById('export').click();
    expect(download).toHaveBeenCalledTimes(1);
    expect(download.mock.calls[0][0]).not.toContain('private');
    expect(status.textContent).toMatch(/téléchargement demandé/);
    expect(status.getAttribute('role')).toBe('status');
  });

  it('annonce l’absence de fichier et ne touche pas au stockage', async () => {
    await clickImport();
    expect(status.textContent).toMatch(/Choisissez/);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('importe et actualise préférences/thème uniquement après le clic', async () => {
    select(valid());
    expect(data.get('player')).toBe('{"name":"Ada"}');
    await clickImport();
    expect(data.get('player')).toBe('{"name":"Grace"}');
    expect(data.get('playlab42.theme')).toBe('light');
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(status.textContent).toMatch(/Import réussi : 2/);
    expect(document.getElementById('import').disabled).toBe(false);
  });

  it.each(['{bad', '[]', JSON.stringify({ format: BACKUP_FORMAT, version: 2, entries: {} })])(
    'annonce l’erreur pour %s et préserve les données', async json => {
      select(json);
      await clickImport();
      expect(status.textContent).toMatch(/Échec de l’import/);
      expect(data.get('player')).toBe('{"name":"Ada"}');
      expect(storage.setItem).not.toHaveBeenCalled();
      expect(refresh).not.toHaveBeenCalled();
    },
  );

  it('annonce le quota après rollback sans message de succès', async () => {
    select(valid());
    const original = storage.setItem.getMockImplementation();
    storage.setItem.mockImplementation((key, raw) => {
      if (key === 'playlab42.theme') { throw new Error('quota'); }
      original(key, raw);
    });
    await clickImport();
    expect(status.textContent).toMatch(/Échec.*quota/);
    expect(status.textContent).not.toContain('réussi');
    expect(data.get('player')).toBe('{"name":"Ada"}');
    expect(data.has(LOCAL_DATA_SCHEMA_KEY)).toBe(false);
  });

  it('annonce le stockage désactivé à l’export', () => {
    storage.getItem.mockImplementation(() => { throw new Error('SecurityError'); });
    document.getElementById('export').click();
    expect(download).not.toHaveBeenCalled();
    expect(status.textContent).toMatch(/Échec de l'export.*Stockage inaccessible/);
  });

  it('annonce aussi un échec de déclenchement du téléchargement', () => {
    download.mockImplementation(() => { throw new Error('téléchargement indisponible'); });
    document.getElementById('export').click();
    expect(status.textContent).toMatch(/Échec de l'export.*téléchargement indisponible/);
  });

  it('refuse les fichiers trop gros avant de les lire', async () => {
    select(valid(), 5 * 1024 * 1024 + 1);
    await clickImport();
    expect(status.textContent).toMatch(/trop volumineux/);
    expect(document.getElementById('backup-file').files[0].text).not.toHaveBeenCalled();
  });

  it('annonce une erreur de lecture du fichier', async () => {
    select(valid());
    document.getElementById('backup-file').files[0].text.mockRejectedValue(new Error('lecture impossible'));
    await clickImport();
    expect(status.textContent).toMatch(/Échec.*lecture impossible/);
    expect(storage.setItem).not.toHaveBeenCalled();
  });

  it('ne prétend pas annuler des données restaurées si l’actualisation échoue', async () => {
    select(valid());
    refresh.mockImplementation(() => { throw new Error('thème indisponible'); });
    await clickImport();
    expect(status.textContent).toMatch(/Données restaurées, mais affichage non actualisé/);
    expect(data.get('player')).toBe('{"name":"Grace"}');
  });

  it('rend les erreurs comme texte, jamais comme HTML', async () => {
    select(JSON.stringify({ format: BACKUP_FORMAT, version: 1, entries: { '<img src=x>': 'bad' } }));
    await clickImport();
    expect(status.textContent).toContain('<img src=x>');
    expect(status.querySelector('img')).toBeNull();
  });

  it('évite deux imports simultanés pendant la lecture', async () => {
    select(valid());
    let release;
    document.getElementById('backup-file').files[0].text.mockImplementation(
      () => new Promise(resolve => { release = resolve; }),
    );
    document.getElementById('import').click();
    expect(document.getElementById('import').disabled).toBe(true);
    expect(document.getElementById('export').disabled).toBe(true);
    document.getElementById('import').click();
    expect(storage.setItem).not.toHaveBeenCalled();
    release(valid());
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
