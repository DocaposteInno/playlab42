/**
 * Contrat de contraste WCAG AA des tokens communs (texte de taille normale).
 */
import { readFileSync } from 'node:fs';
import { describe, it, expect } from '@jest/globals';

const css = readFileSync(new URL('./theme.css', import.meta.url), 'utf8');
const blocks = [...css.matchAll(/(?:^|\n)\s*(?::root|\[data-theme="light"\]|:root:not\(\[data-theme\]\))\s*\{([^}]+)\}/g)];

function luminance(hex) {
  const channels = hex.slice(1).match(/.{2}/g).map(channel => {
    const value = parseInt(channel, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels.reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
}

function contrast(a, b) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe('Contrastes des thèmes', () => {
  it('couvre le sombre, le clair explicite et le clair système', () => {
    expect(blocks).toHaveLength(3);
  });

  for (const [index, block] of blocks.entries()) {
    const tokens = Object.fromEntries([...block[1].matchAll(/(--color-[\w-]+):\s*(#[\da-f]{6})\s*;/gi)].map(match => [match[1], match[2]]));
    it(`garde les textes secondaires lisibles sur toutes les surfaces du thème ${index + 1}`, () => {
      for (const background of ['--color-bg', '--color-bg-secondary', '--color-bg-card', '--color-bg-hover']) {
        expect(contrast(tokens['--color-text-muted'], tokens[background])).toBeGreaterThanOrEqual(4.5);
      }
    });
    it(`garde l’accent et son texte inverse lisibles dans le thème ${index + 1}`, () => {
      expect(contrast(tokens['--color-accent'], tokens['--color-bg-card'])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(tokens['--color-text-inverse'], tokens['--color-accent'])).toBeGreaterThanOrEqual(4.5);
    });
  }
});
