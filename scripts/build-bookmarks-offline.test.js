import { afterEach, describe, expect, test } from '@jest/globals';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

let root;

afterEach(() => {
  if (root) {
    rmSync(root, { recursive: true, force: true });
    root = undefined;
  }
});

function build(args) {
  root = mkdtempSync(join(tmpdir(), 'bookmarks-offline-'));
  mkdirSync(join(root, 'scripts'));
  mkdirSync(join(root, 'bookmarks'));
  mkdirSync(join(root, 'data'));
  for (const filename of ['build-bookmarks.js', 'og-fetcher.js']) {
    cpSync(fileURLToPath(new URL(filename, import.meta.url)), join(root, 'scripts', filename));
  }
  cpSync(fileURLToPath(new URL('lib', import.meta.url)), join(root, 'scripts', 'lib'), { recursive: true });
  writeFileSync(join(root, 'package.json'), JSON.stringify({ type: 'module' }));
  writeFileSync(join(root, 'bookmarks', 'index.json'), JSON.stringify({
    categories: [{ id: 'demo', label: 'Demo', order: 1 }],
  }));
  writeFileSync(join(root, 'bookmarks', 'demo.json'), JSON.stringify({
    category: 'demo',
    bookmarks: [{ title: 'Documentation', url: 'https://example.invalid/docs', tags: ['demo'] }],
  }));
  const script = `
    let requests = 0;
    globalThis.fetch = () => { requests++; throw new Error('Réseau interdit dans ce scénario'); };
    process.on('exit', () => { if (requests) process.exitCode = 89; });
    process.argv.push(...${JSON.stringify(args)});
    await import('./scripts/build-bookmarks.js');
  `;
  return spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: root, encoding: 'utf8', timeout: 10000,
  });
}

describe('Catalogue bookmarks sans enrichissement réseau', () => {
  test('génère le vrai catalogue sans effectuer aucune requête', () => {
    const result = build(['--skip-og']);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    const catalogue = JSON.parse(readFileSync(join(root, 'data', 'bookmarks.json'), 'utf8'));
    expect(catalogue.categories[0].bookmarks).toEqual([expect.objectContaining({
      title: 'Documentation', url: 'https://example.invalid/docs', domain: 'example.invalid',
    })]);
    expect(catalogue.tags).toEqual([{ id: 'demo', count: 1 }]);
    expect(result.stdout).toContain('Enrichissement Open Graph ignoré');
  });

  test('conserve les tentatives Open Graph par défaut', () => {
    const result = build([]);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(89);
    expect(result.stdout).not.toContain('Enrichissement Open Graph ignoré');
  });
});
