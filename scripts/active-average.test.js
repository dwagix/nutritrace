import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { averageActiveByPolicy } from '../server/lib/active-average.js';

const dates = ['d1', 'd2', 'd3', 'd4'];

test('no dates -> null', () => {
  assert.equal(averageActiveByPolicy(new Map(), new Map(), []), null);
});

test('unlogged days count as zero (average over the whole window)', () => {
  const r = averageActiveByPolicy(new Map([['d1', 400]]), new Map(), dates);
  assert.deepEqual(r, { wearable_wins: 100, manual_wins: 100, additive: 100 });
});

test('policies match effectiveActiveCalories per day', () => {
  const manual = new Map([['d1', 300], ['d2', 200]]);
  const wearable = new Map([['d1', 500], ['d3', 100]]);
  // d1: both; d2: manual only; d3: wearable only; d4: none
  const r = averageActiveByPolicy(manual, wearable, dates);
  assert.equal(r.wearable_wins, Math.round((500 + 200 + 100 + 0) / 4));
  assert.equal(r.manual_wins,   Math.round((300 + 200 + 100 + 0) / 4));
  assert.equal(r.additive,      Math.round((800 + 200 + 100 + 0) / 4));
});

test('server and client copies are identical', () => {
  const a = readFileSync(new URL('../server/lib/active-average.js', import.meta.url), 'utf8');
  const b = readFileSync(new URL('../src/lib/active-average.js', import.meta.url), 'utf8');
  assert.equal(a, b);
});
