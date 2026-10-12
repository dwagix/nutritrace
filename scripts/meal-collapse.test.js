import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

let store;
beforeEach(() => {
  store = new Map();
  globalThis.localStorage = {
    getItem: k => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => { store.set(k, String(v)); },
  };
});

const { getDayCollapse, setMealCollapsed } = await import('../src/lib/mealCollapse.js');

test('defaults to empty (all meals open)', () => {
  assert.deepEqual(getDayCollapse('2026-10-12'), {});
});

test('persists collapsed and expanded per date and meal slot', () => {
  setMealCollapsed('2026-10-12', 0, true);
  setMealCollapsed('2026-10-12', 2, true);
  setMealCollapsed('2026-10-12', 2, false);
  assert.deepEqual(getDayCollapse('2026-10-12'), { 0: 'collapsed', 2: 'expanded' });
  assert.deepEqual(getDayCollapse('2026-10-13'), {});
});

test('prunes to the newest 30 dates', () => {
  for (let d = 1; d <= 35; d++) setMealCollapsed(`2026-09-${String(d).padStart(2, '0')}`, 0, true);
  assert.deepEqual(getDayCollapse('2026-09-01'), {});
  assert.deepEqual(getDayCollapse('2026-09-35'), { 0: 'collapsed' });
});

test('corrupt storage and a throwing localStorage degrade to empty', () => {
  store.set('nt:meal-collapsed', '{not json');
  assert.deepEqual(getDayCollapse('2026-10-12'), {});
  globalThis.localStorage = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(getDayCollapse('2026-10-12'), {});
  assert.doesNotThrow(() => setMealCollapsed('2026-10-12', 0, true));
});
