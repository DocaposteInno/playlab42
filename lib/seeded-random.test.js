/**
 * Tests unitaires pour SeededRandom
 * @see openspec/specs/seeded-random/spec.md
 */

import { SeededRandom } from './seeded-random.js';

describe('SeededRandom', () => {
  describe('Déterminisme', () => {
    it('produit la même séquence avec la même seed', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(12345);

      const seq1 = [rng1.random(), rng1.random(), rng1.random()];
      const seq2 = [rng2.random(), rng2.random(), rng2.random()];

      expect(seq1).toEqual(seq2);
    });

    it('produit des séquences différentes avec des seeds différentes', () => {
      const rng1 = new SeededRandom(12345);
      const rng2 = new SeededRandom(54321);

      const seq1 = [rng1.random(), rng1.random(), rng1.random()];
      const seq2 = [rng2.random(), rng2.random(), rng2.random()];

      expect(seq1).not.toEqual(seq2);
    });
  });

  describe('random()', () => {
    it('retourne des valeurs dans [0, 1[', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 1000; i++) {
        const value = rng.random();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('produit une distribution uniforme', () => {
      const rng = new SeededRandom(42);
      const buckets = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        const bucket = Math.floor(rng.random() * 10);
        buckets[bucket]++;
      }

      // Chaque bucket devrait avoir environ 10% des valeurs
      const expected = iterations / 10;
      const tolerance = expected * 0.1; // 10% de tolérance

      for (const count of buckets) {
        expect(count).toBeGreaterThan(expected - tolerance);
        expect(count).toBeLessThan(expected + tolerance);
      }
    });
  });

  describe('int()', () => {
    it('retourne des entiers dans la plage spécifiée', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 1000; i++) {
        const value = rng.int(5, 10);
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(5);
        expect(value).toBeLessThanOrEqual(10);
      }
    });

    it('inclut les bornes min et max', () => {
      const rng = new SeededRandom(42);
      const values = new Set();

      // Avec suffisamment d'itérations, on devrait avoir toutes les valeurs
      for (let i = 0; i < 1000; i++) {
        values.add(rng.int(1, 3));
      }

      expect(values.has(1)).toBe(true);
      expect(values.has(2)).toBe(true);
      expect(values.has(3)).toBe(true);
    });

    it('fonctionne avec min == max', () => {
      const rng = new SeededRandom(42);
      expect(rng.int(5, 5)).toBe(5);
    });
  });

  describe('pick()', () => {
    it('retourne un élément du tableau', () => {
      const rng = new SeededRandom(42);
      const array = ['a', 'b', 'c', 'd'];

      for (let i = 0; i < 100; i++) {
        const value = rng.pick(array);
        expect(array).toContain(value);
      }
    });

    it('lève une erreur sur un tableau vide', () => {
      const rng = new SeededRandom(42);
      expect(() => rng.pick([])).toThrow('Cannot pick from empty array');
    });

    it('retourne le seul élément si tableau de taille 1', () => {
      const rng = new SeededRandom(42);
      expect(rng.pick(['seul'])).toBe('seul');
    });
  });

  describe('shuffle()', () => {
    it('retourne le même tableau (mutation in-place)', () => {
      const rng = new SeededRandom(42);
      const array = [1, 2, 3, 4, 5];
      const result = rng.shuffle(array);

      expect(result).toBe(array);
    });

    it('préserve tous les éléments', () => {
      const rng = new SeededRandom(42);
      const array = [1, 2, 3, 4, 5];
      const original = [...array];

      rng.shuffle(array);

      expect(array.sort()).toEqual(original.sort());
    });

    it('est déterministe avec la même seed', () => {
      const array1 = [1, 2, 3, 4, 5];
      const array2 = [1, 2, 3, 4, 5];

      new SeededRandom(42).shuffle(array1);
      new SeededRandom(42).shuffle(array2);

      expect(array1).toEqual(array2);
    });

    it('produit des ordres différents avec des seeds différentes', () => {
      const array1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const array2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      new SeededRandom(42).shuffle(array1);
      new SeededRandom(99).shuffle(array2);

      expect(array1).not.toEqual(array2);
    });
  });

  describe('chance()', () => {
    it('retourne toujours false avec probabilité 0', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        expect(rng.chance(0)).toBe(false);
      }
    });

    it('retourne toujours true avec probabilité 1', () => {
      const rng = new SeededRandom(42);

      for (let i = 0; i < 100; i++) {
        expect(rng.chance(1)).toBe(true);
      }
    });

    it('respecte approximativement la probabilité donnée', () => {
      const rng = new SeededRandom(42);
      let trueCount = 0;
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        if (rng.chance(0.3)) {
          trueCount++;
        }
      }

      const ratio = trueCount / iterations;
      // Devrait être proche de 0.3 (tolérance de 5%)
      expect(ratio).toBeGreaterThan(0.25);
      expect(ratio).toBeLessThan(0.35);
    });
  });

  describe('Sérialisation et clonage', () => {
    it('getState() retourne un entier', () => {
      const rng = new SeededRandom(42);
      rng.random(); // Avancer l'état

      const state = rng.getState();
      expect(Number.isInteger(state)).toBe(true);
    });

    it('clone() crée un générateur indépendant avec le même état', () => {
      const rng = new SeededRandom(42);
      rng.random();
      rng.random();

      const clone = rng.clone();

      // Les deux doivent produire la même séquence
      expect(rng.random()).toEqual(clone.random());
      expect(rng.random()).toEqual(clone.random());
    });

    it('fromState() restaure exactement l\'état', () => {
      const rng1 = new SeededRandom(42);
      rng1.random();
      rng1.random();

      const state = rng1.getState();
      const rng2 = SeededRandom.fromState(state);

      // Les deux doivent produire la même séquence
      expect(rng1.random()).toEqual(rng2.random());
      expect(rng1.random()).toEqual(rng2.random());
    });

    it('la sérialisation JSON est possible', () => {
      const rng = new SeededRandom(42);
      rng.random();

      const state = rng.getState();
      const json = JSON.stringify({ seed: state });
      const parsed = JSON.parse(json);

      const restored = SeededRandom.fromState(parsed.seed);
      expect(rng.random()).toEqual(restored.random());
    });
  });
});
