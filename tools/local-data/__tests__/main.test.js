/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { jest, it, expect } from '@jest/globals';
import { state } from '../../../app/state.js';
import { initTheme } from '../../../lib/theme.js';
import { BACKUP_FORMAT } from '../../../lib/local-data.js';

it('branche le vrai HTML et restaure préférences et thème sans deuxième écriture', async () => {
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = jest.fn(() => ({
    matches: false, addEventListener: jest.fn(), removeEventListener: jest.fn(),
  }));
  document.body.innerHTML = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  localStorage.setItem('playlab42.theme', 'dark');
  const setItem = jest.spyOn(Storage.prototype, 'setItem');
  const removeItem = jest.spyOn(Storage.prototype, 'removeItem');
  const changes = jest.fn();
  window.addEventListener('themechange', changes);
  try {
    await import('../main.js');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.querySelector('label[for="backup-file"]')).not.toBeNull();
    expect(document.getElementById('backup-file').type).toBe('file');
    expect(document.getElementById('status').getAttribute('role')).toBe('status');

    const input = document.getElementById('backup-file');
    const select = theme => {
      const json = JSON.stringify({
        format: BACKUP_FORMAT, version: 1,
        entries: {
          player: '{"name":"Grace"}', preferences: '{"sound":false}',
          'playlab42.theme': theme,
        },
      });
      Object.defineProperty(input, 'files', {
        configurable: true, value: [{ size: json.length, text: () => Promise.resolve(json) }],
      });
    };
    const importSelected = async () => {
      document.getElementById('import').click();
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    };

    select('light');
    await importSelected();
    expect(state.preferences).toEqual({ pseudo: 'Grace', sound: false });
    expect(localStorage.getItem('playlab42.theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(changes.mock.calls.at(-1)[0].detail.theme).toBe('light');
    expect(setItem.mock.calls.filter(([key]) => key === 'playlab42.theme')).toHaveLength(1);
    expect(document.getElementById('status').textContent).toContain('Import réussi');

    select(null);
    await importSelected();
    expect(localStorage.getItem('playlab42.theme')).toBeNull();
    expect(document.documentElement.hasAttribute('data-theme')).toBe(false);
    expect(changes.mock.calls.at(-1)[0].detail.theme).toBe('dark');
    expect(removeItem.mock.calls.filter(([key]) => key === 'playlab42.theme')).toHaveLength(1);
    expect(document.getElementById('status').textContent).toContain('Import réussi');
  } finally {
    initTheme()();
    window.removeEventListener('themechange', changes);
    window.matchMedia = originalMatchMedia;
    jest.restoreAllMocks();
  }
});
