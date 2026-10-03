import { test, expect, activate, expectNoOverflow } from './fixtures.js';

test('Galerie UI: formulaire reel, contenu echappe et dialogue natif au clavier', async ({ page }) => {
  await page.goto('/tools/ui-kit/index.html');
  await activate(page.locator('#primary'), 'Space');
  await expect(page.locator('#button-status')).toContainText('action principale');
  await page.locator('#card-title').fill('<b>Carte accessible</b>');
  await page.locator('#kind').selectOption({ label: 'Jeu' });
  await page.getByRole('radio', { name: 'Prête à relire' }).check();
  await activate(page.getByRole('button', { name: 'Appliquer à la carte' }));
  await expect(page.locator('#preview-name')).toHaveText('<b>Carte accessible</b>');
  await expect(page.locator('#preview-name b')).toHaveCount(0);
  await expect(page.locator('#preview-kind')).toHaveText('Jeu');
  await expect(page.locator('#preview-state')).toContainText('Prête à relire');
  await activate(page.locator('#open-dialog'));
  const dialog = page.getByRole('dialog', { name: 'Inspecter la carte' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Fermer le dialogue' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  // Le dialogue natif peut tabuler vers le chrome navigateur, pas vers la page inerte.
  await expect.poll(() => dialog.evaluate(element =>
    document.activeElement === document.body || element.contains(document.activeElement),
  )).toBe(true);
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Fermer le dialogue' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page.locator('#open-dialog')).toBeFocused();
});

test('Galerie UI mobile: themes partages, tokens effectifs et aucun debordement', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/tools/ui-kit/index.html');
  for (const theme of ['light', 'dark']) {
    await page.locator('#theme').selectOption(theme);
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await expect.poll(() => page.locator('#token-value').textContent()).toBe(
      await page.locator('html').evaluate(element =>
        getComputedStyle(element).getPropertyValue('--color-bg').trim(),
      ),
    );
    await expectNoOverflow(page);
  }
});
