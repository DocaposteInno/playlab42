import { test, expect, activate, expectNoOverflow } from './fixtures.js';

async function selectBackup(page, name, json) {
  const chooserPromise = page.waitForEvent('filechooser');
  await activate(page.locator('#backup-file'));
  await (await chooserPromise).setFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(json),
  });
}

test('donnees locales: export natif puis restauration au clavier sans toucher aux outils exclus', async ({ page }) => {
  await page.goto('/tools/local-data/index.html');
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({ name: 'Ada' }));
    localStorage.setItem('preferences', JSON.stringify({ sound: false }));
    localStorage.setItem('playlab42.theme', 'light');
    localStorage.setItem('scores_tictactoe', JSON.stringify([{ score: 100, date: 1, player: 'Ada' }]));
    localStorage.setItem('progress_tictactoe', JSON.stringify({ level: 2 }));
    localStorage.setItem('recent_games', JSON.stringify([
      { id: 'neural-style', type: 'tool', timestamp: 2 },
      { id: 'tictactoe', type: 'game', timestamp: 1 },
    ]));
    localStorage.setItem('progress_neural-style', 'protected-neural');
    localStorage.setItem('relativity-settings', 'protected-relativity');
    localStorage.setItem('foreign-app', 'protected-foreign');
    // Observer le Blob reel sans remplacer la creation d'URL ni le telechargement.
    const createObjectURL = URL.createObjectURL;
    URL.createObjectURL = function(blob) {
      window.exportedBackup = blob.text();
      return createObjectURL.call(this, blob);
    };
  });
  const downloadPromise = page.waitForEvent('download');
  await activate(page.locator('#export'));
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  expect(await download.failure()).toBeNull();
  const json = await page.evaluate(() => window.exportedBackup);
  const backup = JSON.parse(json);
  expect(backup.format).toBe('playlab42-local-data');
  expect(backup.version).toBe(1);
  expect(JSON.parse(backup.entries.player)).toEqual({ name: 'Ada' });
  expect(JSON.parse(backup.entries.recent_games)).toEqual([
    { id: 'tictactoe', type: 'game', timestamp: 1 },
  ]);
  for (const key of ['progress_neural-style', 'relativity-settings', 'foreign-app']) {
    expect(backup.entries).not.toHaveProperty(key);
  }
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({ name: 'Changed' }));
    localStorage.setItem('scores_tictactoe', 'corrupt-score');
    localStorage.setItem('progress_tictactoe', JSON.stringify({ level: 99 }));
    localStorage.setItem('playlab42.theme', 'dark');
  });
  await selectBackup(page, 'roundtrip.json', json);
  await activate(page.locator('#import'));
  await expect(page.locator('#status')).toContainText(/restaur|import/i);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  const restored = await page.evaluate(() => ({ ...localStorage }));
  expect(JSON.parse(restored.player)).toEqual({ name: 'Ada' });
  expect(JSON.parse(restored.scores_tictactoe)).toEqual([{ score: 100, date: 1, player: 'Ada' }]);
  expect(JSON.parse(restored.progress_tictactoe)).toEqual({ level: 2 });
  expect(JSON.parse(restored['playlab42.local-data.schema'])).toEqual({ version: 1 });
  expect(restored['progress_neural-style']).toBe('protected-neural');
  expect(restored['relativity-settings']).toBe('protected-relativity');
  expect(restored['foreign-app']).toBe('protected-foreign');
});

test('donnees locales mobile: fichiers futurs et cles etrangeres refuses sans aucune mutation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/tools/local-data/index.html');
  await page.evaluate(() => {
    localStorage.setItem('player', JSON.stringify({ name: 'Original' }));
    localStorage.setItem('playlab42.theme', 'dark');
  });
  const before = await page.evaluate(() => ({ ...localStorage }));
  for (const [name, backup] of [
    ['future.json', { format: 'playlab42-local-data', version: 2, entries: { player: '{"name":"Changed"}' } }],
    ['foreign.json', { format: 'playlab42-local-data', version: 1, entries: { player: '{"name":"Changed"}', 'foreign-app': 'bad' } }],
  ]) {
    await selectBackup(page, name, JSON.stringify(backup));
    await activate(page.locator('#import'));
    await expect(page.locator('#status')).toContainText(/chec de l.import/i);
    expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(before);
    await expectNoOverflow(page);
  }
});

test('reglages: reset confirme, outils exclus conserves et controles actualises sans reecriture', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('player', '{"name":"Ada"}');
    localStorage.setItem('preferences', '{"sound":false}');
    localStorage.setItem('playlab42.theme', 'dark');
    localStorage.setItem('playlab42.activeTab', 'games');
    localStorage.setItem('scores_tictactoe', '[{"score":100,"date":1,"player":"Ada"}]');
    localStorage.setItem('parcours-progress', '{"algorithm-complexity":{"visited":["02-prerequis-maths"],"current":"02-prerequis-maths"}}');
    localStorage.setItem('recent_games', '[{"id":"tictactoe","type":"game","timestamp":2},{"id":"neural-style","type":"tool","timestamp":1}]');
    localStorage.setItem('progress_neural-style', 'protected-neural');
    localStorage.setItem('relativity-settings', 'protected-relativity');
    localStorage.setItem('foreign-app', 'protected-foreign');
  });
  await page.goto('/');
  await activate(page.locator('#btn-settings'));
  const dialogs = [];
  page.on('dialog', async dialog => {
    dialogs.push({ type: dialog.type(), message: dialog.message() });
    await dialog.accept();
  });
  await activate(page.locator('#btn-clear-data'));
  await expect.poll(() => dialogs.length).toBe(2);
  expect(dialogs[0].type).toBe('confirm');
  expect(dialogs[1].message).toContain('compatibles effac');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual({
    recent_games: '[{"id":"neural-style","timestamp":1,"type":"tool"}]',
    'progress_neural-style': 'protected-neural',
    'relativity-settings': 'protected-relativity',
    'foreign-app': 'protected-foreign',
  });
  await expect(page.locator('#input-pseudo')).toHaveValue('Anonyme');
  await expect(page.locator('#sound-on')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#theme-system')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('html')).not.toHaveAttribute('data-theme', /.+/);
});

test('reglages: un schema futur bloque le reset et annonce le refus sans mutation', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('player', '{"name":"Original"}');
    localStorage.setItem('playlab42.local-data.schema', '{"version":999}');
  });
  const before = await page.evaluate(() => ({ ...localStorage }));
  await activate(page.locator('#btn-settings'));
  const dialogs = [];
  page.on('dialog', async dialog => {
    dialogs.push(dialog.message());
    await dialog.accept();
  });
  await activate(page.locator('#btn-clear-data'));
  await expect.poll(() => dialogs.length).toBe(2);
  expect(dialogs[1]).toContain('impossible');
  expect(await page.evaluate(() => ({ ...localStorage }))).toEqual(before);
});
