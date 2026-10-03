import { test, expect, activate, expectNoOverflow } from './fixtures.js';

test('Tetris: clavier, reserve, chute et pause sans rattrapage du temps', async ({ page }) => {
  await page.goto('/games/tetris/index.html');
  await activate(page.locator('#start'));
  await expect(page.locator('#board')).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('KeyC');
  await expect(page.locator('#hold')).not.toHaveAttribute('aria-label', 'Réserve vide');
  await page.keyboard.press('Space');
  await expect.poll(async () => Number(await page.locator('#score').textContent())).toBeGreaterThan(0);
  await page.keyboard.press('KeyP');
  await expect(page.locator('#resume')).toBeFocused();
  const paused = await page.locator('#time').textContent();
  await page.waitForTimeout(150);
  await expect(page.locator('#time')).toHaveText(paused);
  await page.keyboard.press('KeyP');
  await expect(page.locator('#overlay')).toBeHidden();
  await expect(page.locator('#board')).toBeFocused();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('#overlay')).toBeVisible();
  await page.evaluate(() => window.onGameResume());
  await expect(page.locator('#overlay')).toBeVisible();
});

test('Tetris: trois modes et commandes natives sur un petit ecran', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/games/tetris/index.html');
  await expectNoOverflow(page);
  await page.locator('[value="sprint"]').check();
  await activate(page.locator('#start'));
  await expect(page.locator('#mode-label')).toHaveText('SPRINT');
  await expect(page.locator('#progress')).toHaveAttribute('aria-valuemax', '40');
  await activate(page.locator('[data-action="hardDrop"]'), 'Space');
  await expect.poll(async () => Number(await page.locator('#score').textContent())).toBeGreaterThan(0);
  await activate(page.locator('#menu'));
  await page.locator('[value="ultra"]').check();
  await activate(page.locator('#start'));
  await expect(page.locator('#mode-label')).toHaveText('ULTRA');
  await expect(page.locator('#progress')).toHaveAttribute('aria-valuemax', '120000');
  await expect(page.locator('#clear-effect')).toHaveCSS('animation-name', 'none');
  await expectNoOverflow(page);
});

test('Tetris: stockage refuse et bilan sans casser le jeu', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Refus simulé', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Refus simulé', 'SecurityError'); };
  });
  await page.goto('/games/tetris/index.html');
  await activate(page.locator('#start'));
  for (let i = 0; i < 100 && !(await page.locator('#overlay').isVisible()); i++) {
    await page.keyboard.press('Space');
  }
  await expect(page.locator('#overlay')).toBeVisible();
  await expect(page.locator('#start')).toHaveText('Rejouer');
  await expect(page.locator('#storage-notice')).toBeVisible();
  await expect(page.locator('#storage-notice')).toContainText('stockage est indisponible');
});

test('Tetris: portail, action reelle, unload et retour au catalogue', async ({ page }) => {
  await page.goto('/index.html#/games/tetris');
  const frame = page.frameLocator('#game-iframe');
  await activate(frame.locator('#start'));
  await frame.locator('#board').press('Space');
  await expect.poll(async () => Number(await frame.locator('#score').textContent())).toBeGreaterThan(0);
  await activate(frame.locator('#pause'));
  const paused = await frame.locator('#time').textContent();
  await frame.locator('#board').evaluate(() => window.postMessage({ type: 'unload' }, '*'));
  await page.waitForTimeout(150);
  await expect(frame.locator('#time')).toHaveText(paused);
  // Recharger une session pour vérifier également la demande quit du SDK.
  await page.reload();
  await activate(frame.locator('#quit'));
  await expect(page.locator('#game-iframe')).not.toHaveAttribute('src', /tetris/);
});
