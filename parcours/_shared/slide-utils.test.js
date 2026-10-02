/** @jest-environment jsdom */
import { describe, test, expect, beforeEach } from '@jest/globals';
import { prepareSlideTables } from './slide-utils.js';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

describe('Tableaux accessibles des slides', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  test('préserve le tableau et son contenu dans une région défilable au clavier', () => {
    document.body.innerHTML = '<main><table id="mesures"><caption>Mesures de complexité</caption><tbody><tr><td>O(n)</td></tr></tbody></table></main>';
    const table = document.querySelector('table');
    prepareSlideTables();
    const region = table.parentElement;
    expect(region.classList.contains('slide-table-scroll')).toBe(true);
    expect(region.getAttribute('tabindex')).toBe('0');
    expect(region.getAttribute('role')).toBe('region');
    expect(region.getAttribute('aria-label')).toBe('Mesures de complexité');
    expect(document.querySelector('#mesures')).toBe(table);
    expect(table.textContent).toContain('O(n)');
  });

  test('réutilise le conteneur de mise en page et reste idempotent', () => {
    document.body.innerHTML = '<div id="cadre" class="overflow-hidden rounded-lg"><table><tbody><tr><td>A</td></tr></tbody></table></div>';
    prepareSlideTables();
    prepareSlideTables();
    expect(document.querySelector('table').parentElement.id).toBe('cadre');
    expect(document.querySelectorAll('.slide-table-scroll')).toHaveLength(1);
    expect(document.querySelector('#cadre').getAttribute('aria-label')).toBe('Tableau défilable horizontalement');
  });

  test('ne modifie pas les pages sans tableau', () => {
    document.body.innerHTML = '<main><button>Expérimenter</button></main>';
    const content = document.body.innerHTML;
    prepareSlideTables();
    expect(document.body.innerHTML).toBe(content);
  });
});

describe('Slides autonomes sans compilation CSS à distance', () => {
  test.each(['algorithm-complexity', 'deep-learning-intro'])('%s charge la mise en page locale pour toutes ses slides', (epic) => {
    const epicPath = fileURLToPath(new URL(`../epics/${epic}/`, import.meta.url));
    const stylesheet = `${epic === 'algorithm-complexity' ? epic : 'deep-learning'}.css`;
    const sharedCss = readFileSync(join(epicPath, '_shared', stylesheet), 'utf8');
    expect(sharedCss).toContain('@import url("../../../_shared/slide-layout.css")');
    for (const slide of readdirSync(join(epicPath, 'slides'))) {
      const html = readFileSync(join(epicPath, 'slides', slide, 'index.html'), 'utf8');
      expect(html).not.toMatch(/cdn\.tailwindcss\.com|tailwind\.config/);
      expect(html).toContain(`../../_shared/${stylesheet}`);
    }
  });
});

describe('Commandes des démonstrations pédagogiques', () => {
  test.each([
    '03-neurone',
    '04-reseaux',
    '06-loss-functions',
    '07-backpropagation',
    '12-laboratoire',
  ])('%s donne un nom aux champs et aux diagrammes', (slide) => {
    const html = readFileSync(new URL(`../epics/deep-learning-intro/slides/${slide}/index.html`, import.meta.url), 'utf8');
    const page = new DOMParser().parseFromString(html, 'text/html');
    page.querySelectorAll('input, select').forEach((control) => {
      const label = page.querySelector(`label[for="${control.id}"]`) || control.closest('label');
      expect(Boolean(control.getAttribute('aria-label') || label?.textContent.trim())).toBe(true);
    });
    page.querySelectorAll('canvas').forEach((canvas) => {
      expect(canvas.getAttribute('role')).toBe('img');
      expect(canvas.getAttribute('aria-label')).toBeTruthy();
    });
  });

  test('les interrupteurs du laboratoire sont des boutons natifs avec un état explicite', () => {
    const html = readFileSync(new URL('../epics/deep-learning-intro/slides/12-laboratoire/index.html', import.meta.url), 'utf8');
    const page = new DOMParser().parseFromString(html, 'text/html');
    for (const id of ['render-toggle', 'autostop-toggle']) {
      const toggle = page.getElementById(id);
      expect(toggle.tagName).toBe('BUTTON');
      expect(toggle.getAttribute('role')).toBe('switch');
      expect(toggle.getAttribute('aria-checked')).toBe(toggle.dataset.active);
      expect(toggle.getAttribute('aria-label')).toBeTruthy();
    }
  });
});
