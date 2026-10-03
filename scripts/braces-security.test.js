import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const braces = require('braces');
const fork = require('../vendor/braces');
const micromatch = require('micromatch');
const glob = require('fast-glob');
const { MAX_DEPTH } = require('../vendor/braces/lib/depth');

const deepAst = (depth) => {
  let node = { type: 'text', value: 'a' };
  for (let i = 0; i < depth; i++) {
    node = { type: 'root', nodes: [node] };
  }
  return node;
};

const expectDepthError = (action) => {
  expect(action).toThrow(expect.objectContaining({
    name: 'RangeError',
    code: 'ERR_BRACES_DEPTH',
  }));
};

describe('bounded braces dependency', () => {
  it('installs the real patched fork for micromatch, not an unchanged alias', () => {
    expect(braces).toBe(fork);
    const consumerRequire = createRequire(require.resolve('micromatch'));
    expect(consumerRequire('braces')).toBe(fork);
  });

  it.each([
    ['braces', '{'.repeat(20000) + 'a' + '}'.repeat(20000)],
    ['parentheses', '('.repeat(20000) + 'a' + ')'.repeat(20000)],
    ['mixed delimiters', '{('.repeat(10000) + 'a' + ')}'.repeat(10000)],
    ['unclosed braces', '{'.repeat(20000) + 'a'],
    ['unclosed parentheses', '('.repeat(20000) + 'a'],
  ])('rejects deeply nested %s before any recursive traversal', (_label, pattern) => {
    for (const method of ['parse', 'stringify', 'compile', 'expand']) {
      expectDepthError(() => braces[method](pattern, {
        maxLength: Infinity,
        maxDepth: Infinity,
      }));
    }
    expectDepthError(() => braces(pattern));
    expectDepthError(() => braces(pattern, { expand: true }));
  });

  it.each(['stringify', 'compile', 'expand'])('bounds caller-supplied ASTs in %s', (method) => {
    expectDepthError(() => braces[method](deepAst(20000)));
    const cycle = { type: 'root', nodes: [] };
    cycle.nodes.push(cycle);
    expectDepthError(() => braces[method](cycle));
  });

  it('bounds a cyclic parent chain during expansion', () => {
    const node = { type: 'paren', nodes: [{ type: 'text', value: 'a' }] };
    node.parent = node;
    expectDepthError(() => braces.expand({ type: 'root', nodes: [node] }));
  });

  it('bounds repeated shared subtrees without exponentially traversing them', () => {
    let node = { type: 'text', value: 'a' };
    for (let i = 0; i < 20; i++) {
      node = { type: 'root', nodes: [node, node] };
    }
    expect(() => braces.stringify(node)).toThrow(expect.objectContaining({
      code: 'ERR_BRACES_NODES',
    }));
  });

  it('accepts the depth boundary and rejects the next level', () => {
    const pattern = '{'.repeat(MAX_DEPTH - 1) + 'a' + '}'.repeat(MAX_DEPTH - 1);
    expect(braces.stringify(pattern)).toBe(pattern);
    expect(braces.expand(pattern)).toEqual([pattern]);
    expectDepthError(() => braces.parse('{' + pattern + '}'));
    expect(braces.stringify(deepAst(MAX_DEPTH))).toBe('a');
    expectDepthError(() => braces.stringify(deepAst(MAX_DEPTH + 1)));
  });

  it('preserves escaping, quotes and character classes without false depth errors', () => {
    const literal = '{'.repeat(200);
    expect(braces.stringify('"' + literal + '"')).toBe(literal);
    expect(braces.stringify('[' + literal + ']')).toBe('[' + literal + ']');
    expect(braces.stringify('\\{'.repeat(200))).toBe(literal);
  });

  it('preserves normal expansion, ranges, compilation and malformed literals', () => {
    expect(braces.expand('x/{a,{b,c}}/{01..03}')).toEqual([
      'x/a/01', 'x/a/02', 'x/a/03',
      'x/b/01', 'x/b/02', 'x/b/03',
      'x/c/01', 'x/c/02', 'x/c/03',
    ]);
    expect(braces.compile('a/{b,c}/d')).toBe('a/(b|c)/d');
    expect(braces.expand('a/{b,c}/d', { nodupes: true })).toEqual(['a/b/d', 'a/c/d']);
    expect(braces.expand('{1..10001}')).toThrow(/range limit/);
    expect(braces.stringify('a/{b,c')).toBe('a/{b,c');
    expect(braces(['{a,b}', '{b,c}'], { expand: true, nodupes: true })).toEqual(['a', 'b', 'c']);
  });

  it('preserves micromatch and fast-glob brace patterns', () => {
    expect(micromatch(['a.js', 'b.ts', 'c.css'], '*.{js,ts}')).toEqual(['a.js', 'b.ts']);
    expect(glob.sync('vendor/braces/{index,lib/parse}.js').sort()).toEqual([
      'vendor/braces/index.js',
      'vendor/braces/lib/parse.js',
    ]);
    expectDepthError(() => micromatch.braces('{'.repeat(20000) + 'a' + '}'.repeat(20000)));
  });

  it('keeps the actual OpenSpec CLI functional', () => {
    const result = execFileSync(process.execPath, [
      'node_modules/@fission-ai/openspec/bin/openspec.js', 'list',
    ], {
      encoding: 'utf8',
      env: { ...process.env, OPENSPEC_TELEMETRY: '0', NO_COLOR: '1' },
      timeout: 20000,
    });
    expect(typeof result).toBe('string');
  });
});
