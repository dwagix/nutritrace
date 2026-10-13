import { test } from 'node:test';
import assert from 'node:assert/strict';
import { goalBreakdown } from '../src/lib/goal-breakdown.js';

const common = { factor: 1, adjustOn: true, avgActive: 400, dynamicCaloriesOut: null, adaptiveTdee: null };

test('fixed mode: base is the set goal, full activity added', () => {
  const b = goalBreakdown({ ...common, mode: 'fixed', base: 2000, effective: 300 });
  assert.equal(b.basis, 'fixed');
  assert.equal(b.fallback, null);
  assert.equal(b.typical, 0);
  assert.equal(b.adjusted, 2300);
});

test('adaptive ready: only the difference from typical is applied', () => {
  const b = goalBreakdown({ ...common, mode: 'adaptive', base: 2400, adaptiveTdee: 2400, effective: 150 });
  assert.equal(b.basis, 'adaptive');
  assert.equal(b.typical, 400);
  assert.equal(b.adjust, -250);
  assert.equal(b.adjusted, 2150);
});

test('adaptive not ready: falls back to fixed and says so, full activity added', () => {
  const b = goalBreakdown({ ...common, mode: 'adaptive', base: 2000, effective: 300 });
  assert.equal(b.basis, 'fixed');
  assert.equal(b.fallback, 'adaptive-not-ready');
  assert.equal(b.typical, 0);
  assert.equal(b.adjusted, 2300);
});

test('dynamic with no data falls back; with data uses it', () => {
  assert.equal(goalBreakdown({ ...common, mode: 'dynamic', base: 2000, effective: 0 }).fallback, 'dynamic-no-data');
  const b = goalBreakdown({ ...common, mode: 'dynamic', base: 2100, dynamicCaloriesOut: 2800, factor: 0.75, effective: 0 });
  assert.equal(b.basis, 'dynamic');
  assert.equal(b.source, 2800);
  assert.equal(b.factor, 0.75);
});

test('adjust setting off: goal equals base', () => {
  const b = goalBreakdown({ ...common, mode: 'adaptive', base: 2400, adaptiveTdee: 2400, adjustOn: false, effective: 900 });
  assert.equal(b.adjust, 0);
  assert.equal(b.adjusted, 2400);
});
