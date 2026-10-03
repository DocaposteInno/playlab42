import { test, expect, activate } from './fixtures.js';

/**
 * Observe aussi les fontes et extensions : aucune fixture ne doit cacher un CDN.
 * @param {import('@playwright/test').Page} page - Page réelle
 * @param {string} baseURL - Origine du serveur statique
 * @returns {{external: string[], missing: string[], paths: Set<string>}} Requêtes observées
 */
function observeRequests(page, baseURL) {
  const origin = new URL(baseURL).origin;
  const external = [];
  const missing = [];
  const paths = new Set();
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) && url.origin !== origin) {
      external.push(url.href);
    }
  });
  page.on('response', (response) => {
    const url = new URL(response.url());
    if (url.origin === origin) {
      paths.add(url.pathname);
      if (response.status() >= 400) {
        missing.push(`${response.status()} ${url.pathname}`);
      }
    }
  });
  return { external, missing, paths };
}

test('Tone 15 réel : geste utilisateur, relâchement rapide, presets et état du métronome', async ({ page, baseURL }) => {
  const requests = observeRequests(page, baseURL);
  await page.goto('/games/diese-et-mat/index.html');
  await activate(page.locator('#btn-piano'));
  const note = page.locator('.piano-key[data-note="C4"]');
  await activate(note);
  await expect(note).toHaveAttribute('aria-pressed', 'false');
  await expect.poll(() => page.evaluate(async () => {
    const Tone = await import('tone');
    return Tone.getContext().state;
  })).toBe('running');
  await expect(page.locator('#piano-note-display')).not.toContainText('Audio indisponible');

  const audio = await page.evaluate(async () => {
    const { SynthManager } = await import('./src/audio/SynthManager.js');
    const manager = new SynthManager();
    try {
      const pending = manager.noteOn('C4');
      manager.noteOff('C4');
      await pending;
      const activeAfterRelease = [...manager.activeNotes];
      const presets = Object.keys(manager.getPresets());
      for (const preset of presets) {
        manager.setPreset(preset);
        await manager.playNote('C4', 0.02);
        manager.audioEngine.stopAll();
      }
      return { version: manager.audioEngine.Tone.version, activeAfterRelease, presets };
    } finally {
      manager.dispose();
    }
  });
  expect(audio.version).toBe('15.1.22');
  expect(audio.activeAfterRelease).toEqual([]);
  expect(audio.presets).toHaveLength(15);

  await activate(page.locator('#piano-close'));
  await activate(page.locator('#btn-metronome'));
  const play = page.locator('#metronome-play');
  await activate(play);
  await expect(play).toHaveAttribute('aria-pressed', 'true');
  await expect(play).toContainText('Arrêter');
  await activate(page.locator('#metronome-close'));
  await expect(play).toHaveAttribute('aria-pressed', 'false');
  expect(requests.external).toEqual([]);
  expect(requests.missing).toEqual([]);
  expect([...requests.paths]).toContain('/assets/vendor/tone/tone.js');
});

test('VexFlow 5 réel : fontes embarquées, notes, accords et mesures SVG', async ({ page, baseURL }) => {
  const requests = observeRequests(page, baseURL);
  await page.goto('/games/diese-et-mat/index.html');
  const result = await page.evaluate(async () => {
    const { ScoreRenderer } = await import('./src/renderer/ScoreRenderer.js');
    const { Pitch } = await import('./src/core/Pitch.js');
    const container = document.createElement('div');
    document.body.append(container);
    const renderer = new ScoreRenderer(container);
    try {
      await renderer.init();
      const drawn = [];
      renderer.renderNote(Pitch.fromString('C#4'));
      drawn.push(container.querySelectorAll('svg text').length);
      renderer.renderChord(['C4', 'E4', 'G4'].map((note) => Pitch.fromString(note)));
      drawn.push(container.querySelectorAll('svg text').length);
      renderer.renderMeasure(['C4', 'D4', 'E4', 'F4'].map((note) => ({
        pitch: Pitch.fromString(note), duration: 'q',
      })));
      drawn.push(container.querySelectorAll('svg text').length);
      return {
        version: renderer.VF.VexFlow.BUILD.VERSION,
        drawn,
        fonts: ['Bravura', 'Academico'].map((font) => document.fonts.check(`16px ${font}`)),
      };
    } finally {
      renderer.dispose();
      container.remove();
    }
  });
  expect(result.version).toBe('5.0.0');
  expect(result.drawn.every((count) => count > 0)).toBe(true);
  expect(result.fonts).toEqual([true, true]);
  expect(requests.external).toEqual([]);
  expect(requests.missing).toEqual([]);
  expect([...requests.paths]).toContain('/assets/vendor/vexflow/vexflow.js');
});

test('MathJax 4 réel : toutes les slides migrées, extensions et fontes dynamiques locales', async ({ page, baseURL }) => {
  test.setTimeout(90_000);
  const requests = observeRequests(page, baseURL);
  const epics = {
    'algorithm-complexity': [
      '02-prerequis-maths', '03-big-o-notation', '04-algorithmes-tri',
      '05-algorithmes-recherche', '06-structures-index', '07-algorithmes-graphes',
      '08-programmation-dynamique', '09-paradigmes-algorithmiques',
      '10-notions-avancees', '11-conclusion',
    ],
    'deep-learning-intro': [
      '03-neurone', '04-reseaux', '05-forward-propagation',
      '06-loss-functions', '07-backpropagation', '08-entrainement',
    ],
  };
  for (const [epic, slides] of Object.entries(epics)) {
    for (const slide of slides) {
      await page.goto(`/parcours/epics/${epic}/slides/${slide}/index.html`);
      await page.waitForFunction(() => window.MathJax?.startup?.document);
      await page.evaluate(() => window.MathJax.startup.promise);
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => window.MathJax.version)).toBe('4.1.3');
      // Entraînement conserve son intégration, mais ne contient pas de formule.
      if (slide !== '08-entrainement') {
        expect(await page.locator('mjx-container[jax="CHTML"]').count()).toBeGreaterThan(0);
      }
    }
  }
  const rendered = await page.evaluate(async () => {
    const formula = await window.MathJax.tex2chtmlPromise(
      '\\require{cancel}\\cancel{x}+\\mathfrak{Z}+\\unicode{x1D538}',
    );
    document.body.append(formula);
    await document.fonts.ready;
    return formula.querySelector('mjx-math') !== null;
  });
  expect(rendered).toBe(true);
  expect([...requests.paths]).toContain('/assets/vendor/mathjax/input/tex/extensions/cancel.js');
  expect([...requests.paths]).toContain('/assets/vendor/mathjax/input/tex/extensions/unicode.js');
  expect([...requests.paths].some((path) => path.includes('/mathjax-newcm-font/chtml/dynamic/'))).toBe(true);
  expect([...requests.paths].some((path) => path.includes('/mathjax-newcm-font/chtml/woff2/'))).toBe(true);
  expect(requests.external).toEqual([]);
  expect(requests.missing).toEqual([]);
});
