import { test, expect, activate, expectNoOverflow } from './fixtures.js';

test('le lien des guides ouvre les parcours même avec un autre onglet sauvegardé', async ({ page }) => {
  await page.goto('/');
  await activate(page.locator('#tab-games'));
  await activate(page.getByRole('link', { name: 'Guides', exact: true }));
  await expect(page).toHaveURL(/\/docs\/site\/index\.html$/);
  await activate(page.getByRole('link', { name: 'Explorer les parcours pédagogiques', exact: true }));
  await expect(page.locator('#tab-parcours')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#panel-parcours .epic-card').first()).toBeVisible();
});

test('les guides générés forment un parcours de lecture au clavier', async ({ page }) => {
  await page.goto('/docs/site/index.html');
  await expect(page.getByRole('heading', { name: 'Les guides du laboratoire', exact: true })).toBeVisible();
  await activate(page.getByRole('link', { name: /Commencer avec le kit de contribution/ }));
  await expect(page).toHaveURL(/\/docs\/site\/guides\/contribution-kit\.html$/);
  await expect(page.locator('.guide-prose h1')).toContainText('Kit de contribution');
  await expect(page.getByRole('navigation', { name: 'Plan du guide' })).toBeVisible();
  const firstSection = page.locator('.reader-plan nav a').first();
  const anchor = await firstSection.getAttribute('href');
  await activate(firstSection);
  await expect(page).toHaveURL(url => decodeURIComponent(url.hash) === anchor);
  await expect(page.locator(anchor)).toBeInViewport();
  await activate(page.getByRole('link', { name: 'Les guides', exact: true }));
  await activate(page.getByRole('link', { name: /Tester sa contribution/ }));
  await expect(page).toHaveURL(/\/docs\/site\/TESTING_STRATEGY\.html$/);
  await expect(page.locator('.guide-prose h1')).toBeVisible();
  await activate(page.getByRole('link', { name: 'Retour au portail', exact: true }));
  await expect(page).toHaveURL(/\/index\.html$/);
});

for (const width of [320, 390, 1280]) {
  for (const theme of ['dark', 'light']) {
    test(`lecteur ${width}px · thème ${theme} : plan, code et liens locaux`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.addInitScript(savedTheme => {
        localStorage.setItem('playlab42.theme', savedTheme);
      }, theme);
      await page.goto('/docs/site/guides/create-game-client.html');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect(page.locator('.guide-prose h1')).toContainText('Client');
      await expectNoOverflow(page);
      const plan = page.locator('.reader-plan');
      await expect(plan).toHaveJSProperty('open', width >= 960);
      if (width < 960) {
        await activate(plan.locator('summary'));
        await expect(plan).toHaveJSProperty('open', true);
      }
      const section = plan.locator('nav a').first();
      await activate(section);
      await expect(page.locator(await section.getAttribute('href'))).toBeInViewport();
      const code = page.locator('pre').first();
      await expect(code).toBeVisible();
      expect(await code.evaluate(element => getComputedStyle(element).overflowX)).toBe('auto');
      await activate(page.getByRole('link', { name: 'Les guides', exact: true }));
      await expect(page.getByRole('heading', { name: 'Les guides du laboratoire', exact: true })).toBeVisible();
      await expectNoOverflow(page);
      await activate(page.getByRole('link', { name: /Lire l’architecture/ }));
      await expect(page).toHaveURL(/\/docs\/site\/guides\/architecture\.html$/);
      await expectNoOverflow(page);
    });
  }
}

test('les liens Markdown connus restent dans le lecteur', async ({ page }) => {
  await page.goto('/docs/site/guides/project-skills.html');
  await expect(page.locator('.guide-prose a.source-link').first()).toContainText('source Markdown');
  const link = page.locator('.guide-prose a[href="contribution-kit.html"]').first();
  await activate(link);
  await expect(page).toHaveURL(/\/docs\/site\/guides\/contribution-kit\.html$/);
  await expect(page.locator('.guide-prose h1')).toContainText('Kit de contribution');
  const sourceLink = page.getByRole('link', { name: 'Lire la source Markdown', exact: true });
  await expect(sourceLink).toHaveAttribute('href', '../../guides/contribution-kit.md');
});

test('les guides et leur plan restent navigables sans JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 320, height: 800 } });
  const page = await context.newPage();
  try {
    await page.goto(`${baseURL}/docs/site/index.html`);
    await activate(page.getByRole('link', { name: /Lire l’architecture/ }));
    await expect(page.locator('.guide-prose h1')).toContainText('Architecture');
    await activate(page.locator('.reader-plan summary'));
    const section = page.locator('.reader-plan nav a').first();
    await activate(section);
    await expect(page.locator(await section.getAttribute('href'))).toBeInViewport();
    await expectNoOverflow(page);
    await activate(page.getByRole('link', { name: 'Retour au portail', exact: true }));
    await expect(page).toHaveURL(/\/index\.html$/);
  } finally {
    await context.close();
  }
});
