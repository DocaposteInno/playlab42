import { test, expect, activate, expectNoOverflow, expectVisibleHitTarget } from './fixtures.js';

// Le rendu 3D logiciel et sa fermeture depassent parfois le budget standard.
test.setTimeout(60_000);

test('Relativity: demarrage Three reel, impulsion et moteur presse/relache/blur', async ({ page }) => {
  await page.goto('/tools/relativity-lab/index.html');
  await expect(page.locator('#canvas-container canvas')).toBeVisible();
  await expect(page.locator('#motor-forward')).toBeVisible();
  await activate(page.locator('#play-button'));
  await expect(page.locator('#play-button')).toHaveAttribute('aria-pressed', 'true');
  const mass = page.locator('#motor-mass');
  const initialMass = Number(await mass.textContent());
  await activate(page.locator('#motor-fire'));
  await expect.poll(async () => Number(await mass.textContent())).toBeLessThan(initialMass);
  await expect(page.locator('.motor-history-item').first()).toBeVisible();
  for (const [id, key] of [['motor-forward', 'Enter'], ['motor-backward', 'Space']]) {
    const motor = page.locator(`#${id}`);
    await motor.focus();
    await page.keyboard.down(key);
    await expect(motor).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.up(key);
    await expect(motor).toHaveAttribute('aria-pressed', 'false');
  }
  const motor = page.locator('#motor-forward');
  await motor.focus();
  await page.keyboard.down('Space');
  await expect(motor).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#motor-backward').focus();
  await expect(motor).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('Space');
  await motor.focus();
  await page.keyboard.down('Enter');
  await expect(motor).toHaveAttribute('aria-pressed', 'true');
  // Contrat window.blur sans dependre du gestionnaire de fenetres du runner headless.
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(motor).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.up('Enter');
});

test('Relativity mobile: controles accessibles a 320/390 et apres rotation paysage', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/tools/relativity-lab/index.html');
  await expect(page.locator('#motor-forward')).toBeVisible();
  for (const viewport of [{ width: 320, height: 740 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    await expectNoOverflow(page);
    const motor = page.locator('#motor-forward');
    // Un focus conserve au resize ne relance pas le scroll natif du navigateur.
    await page.locator('#play-button').focus();
    await motor.focus();
    await expect(motor).toBeFocused();
    await expectVisibleHitTarget(motor);
    await page.keyboard.down('Space');
    await expect(motor).toHaveAttribute('aria-pressed', 'true');
    await page.keyboard.up('Space');
    await expect(motor).toHaveAttribute('aria-pressed', 'false');
    await motor.hover();
    const controls = page.locator('.motor-thrust-controls');
    const beforePress = await controls.boundingBox();
    expect(beforePress).not.toBeNull();
    await page.mouse.down();
    await expect(motor).toHaveAttribute('aria-pressed', 'true');
    await expect.poll(() => motor.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit === element || element.contains(hit);
    })).toBe(true);
    await expect.poll(async () => {
      const held = await controls.boundingBox();
      return held ? Math.abs(held.y - beforePress.y) : Infinity;
    }, { message: 'Le statut moteur ne deplace pas la cible pendant la pression' }).toBeLessThanOrEqual(1);
    await page.mouse.up();
    await expect(motor).toHaveAttribute('aria-pressed', 'false');
  }
});
