import { test } from 'node:test';
import assert from 'node:assert/strict';
import { activityGoalAdjust } from '../src/lib/activity-adjust.js';

const adaptive = { adjustOn: true, adaptiveReady: true, avgActive: 400 };

test('setting off -> no adjustment, whatever the mode', () => {
  assert.deepEqual(activityGoalAdjust({ ...adaptive, adjustOn: false, effective: 900 }), { typical: 0, adjust: 0 });
});

test('adaptive: harder-than-usual day raises the goal by the difference only', () => {
  assert.deepEqual(activityGoalAdjust({ ...adaptive, effective: 700 }), { typical: 400, adjust: 300 });
});

test('adaptive: typical day changes nothing', () => {
  assert.equal(activityGoalAdjust({ ...adaptive, effective: 400 }).adjust, 0);
});

test('adaptive: easier-than-usual (or rest) day lowers the goal', () => {
  assert.equal(activityGoalAdjust({ ...adaptive, effective: 150 }).adjust, -250);
  assert.equal(activityGoalAdjust({ ...adaptive, effective: 0 }).adjust, -400);
});

test('not adaptive, or adaptive not ready: full activity added as before', () => {
  assert.deepEqual(activityGoalAdjust({ adjustOn: true, adaptiveReady: false, avgActive: 400, effective: 700 }), { typical: 0, adjust: 700 });
});

test('server without avgActiveKcal falls back to adding nothing extra to subtract', () => {
  assert.deepEqual(activityGoalAdjust({ adjustOn: true, adaptiveReady: true, avgActive: null, effective: 700 }), { typical: 0, adjust: 700 });
});

test('averaged over days the goal equals the learned TDEE', () => {
  const days = [0, 600, 400, 200, 400];            // mean 320... use avg of the list
  const avg = days.reduce((a, b) => a + b) / days.length;
  const sum = days.reduce((s, d) => s + activityGoalAdjust({ ...adaptive, avgActive: avg, effective: d }).adjust, 0);
  assert.ok(Math.abs(sum) < 1e-9);
});
