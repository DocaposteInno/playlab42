/** @jest-environment jsdom */
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

describe('Configuration MathJax locale', () => {
  test('préserver les délimiteurs du parcours et résoudre tous les assets sous le préfixe du site', () => {
    const script = document.createElement('script');
    script.src = 'https://example.test/playlab42/parcours/_shared/mathjax-config.js';
    Object.defineProperty(document, 'currentScript', { configurable: true, value: script });
    window.MathJax = { tex: { inlineMath: [['$', '$']] } };
    const source = readFileSync(new URL('./mathjax-config.js', import.meta.url), 'utf8');
    runInNewContext(source, { window, document, URL });
    expect(window.MathJax.tex.inlineMath).toEqual([['$', '$']]);
    expect(window.MathJax.loader.paths.mathjax).toBe('https://example.test/playlab42/assets/vendor/mathjax');
    expect(window.MathJax.loader.paths.mathmaps).toBe('https://example.test/playlab42/assets/vendor/mathjax/sre/mathmaps');
    expect(window.MathJax.output.fontPath).toBe('[fonts]/%%FONT%%-font');
    expect(window.MathJax.chtml.fontURL).toBe('https://example.test/playlab42/assets/vendor/mathjax-newcm-font/chtml/woff2');
    expect(window.MathJax.chtml.dynamicPrefix).toBe('https://example.test/playlab42/assets/vendor/mathjax-newcm-font/chtml/dynamic');
    delete window.MathJax;
    delete document.currentScript;
  });
});
