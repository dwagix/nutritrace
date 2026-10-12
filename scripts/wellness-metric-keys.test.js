/**
 * The write:wellness-metrics whitelist (server) and the metric
 * definitions the UI renders (src/lib/wellness-metrics.js) are two lists
 * that must stay identical. A key missing from the server list is silently
 * ignored on push (the avg_heart_rate bug, 7144d3e); a key missing from the
 * shared module is stored but never shown.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { METRIC_KEYS } from '../server/lib/wellness-metric-keys.js';
import { ALL_METRICS, GARMIN_METRICS } from '../src/lib/wellness-metrics.js';

const uiIds = new Set([...ALL_METRICS, ...GARMIN_METRICS].map(m => m.id));

test('every UI metric id is accepted by POST /api/v1/wellness-metrics', () => {
  const missing = [...uiIds].filter(id => !METRIC_KEYS.has(id));
  assert.deepEqual(missing, [], `add to server/lib/wellness-metric-keys.js: ${missing.join(', ')}`);
});

test('every server whitelist key has a UI metric definition', () => {
  const orphaned = [...METRIC_KEYS].filter(id => !uiIds.has(id));
  assert.deepEqual(orphaned, [], `add to src/lib/wellness-metrics.js: ${orphaned.join(', ')}`);
});
