/**
 * POST /api/v1/wellness-metrics — record daily activity/wellness metrics
 * from an external integration (Home Assistant pulling Apple Health via
 * the iOS companion app, Node-RED, Gadgetbridge-on-server, etc.) into
 * the same table the Wellness → Activity/Sleep/Heart tabs read from.
 *
 * Fills the same "headless server" gap as body-measurements.js, but for
 * the metric_types the Wellness page's Activity/Sleep/Heart tabs expect
 * — there was previously no federation path for these; only Fitbit/
 * Garmin OAuth sync or Health Connect (Android-only) ever wrote them.
 *
 * Storage: writes directly to `wellness_data` with source='federation',
 * matching the pattern body-measurements.js already uses for weight —
 * GET /api/wellness/fitbit/data reads `source IN ('fitbit',
 * 'health_connect', 'federation')`, so rows written here render on the
 * Wellness page the same way an OAuth sync would.
 *
 * Wire contract:
 *   {
 *     date:    "YYYY-MM-DD",   // required
 *     source:  "home-assistant", // optional, free text, stored in metadata
 *     metrics: {                 // at least one numeric key required
 *       steps:                5908,
 *       distance_km:          3.72,
 *       floors:               8,
 *       active_minutes:       42,
 *       calories_out:         1957,
 *       sleep_duration_min:   484,
 *       sleep_score:          82
 *       // ...any other key in METRIC_KEYS below
 *     }
 *   }
 *
 * Only known metric_types are accepted (see lib/wellness-metric-keys.js) — this
 * isn't a generic passthrough like body-measurements' "store whatever's
 * sent" behavior, since wellness_data rows here are keyed only by
 * metric_type with no per-vendor-extras JSON blob to catch unknowns
 * safely.
 */
import { Router } from 'express';
import db from '../../../db.js';
import { wrap } from '../../../logger.js';
import { requireScope } from '../../../middleware/bearer-auth.js';
import { METRIC_KEYS } from '../../../lib/wellness-metric-keys.js';

const router = Router();

router.post('/', requireScope('write:wellness-metrics'), wrap((req, res) => {
  const { date, source, metrics } = req.body || {};

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
    return res.status(400).json({ error: 'date must be YYYY-MM-DD', code: 'bad_date' });
  }
  if (!metrics || typeof metrics !== 'object' || Array.isArray(metrics)) {
    return res.status(400).json({ error: 'metrics object required', code: 'bad_metrics' });
  }

  const userId = req.apiUser.id;
  const u = (userId === 0 || userId == null) ? null : userId;
  const wellnessUid = u == null ? 0 : u;
  const metadata = source ? JSON.stringify({ source: String(source).slice(0, 64) }) : '{}';

  const insert = db.prepare(`
    INSERT INTO wellness_data (user_id, date, source, metric_type, value, metadata, synced_at)
    VALUES (?, ?, 'federation', ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id, date, source, metric_type)
    DO UPDATE SET value = excluded.value, metadata = excluded.metadata, synced_at = excluded.synced_at
  `);

  let written = 0, skipped = [];
  db.transaction(() => {
    for (const [key, value] of Object.entries(metrics)) {
      if (!METRIC_KEYS.has(key)) { skipped.push(key); continue; }
      const num = Number(value);
      if (!Number.isFinite(num)) { skipped.push(key); continue; }
      insert.run(wellnessUid, date, key, num, metadata);
      written++;
    }
  })();

  if (written === 0) {
    return res.status(400).json({ error: 'no recognized numeric metrics in payload', code: 'no_valid_metrics', skipped });
  }

  res.json({ ok: true, date, written, skipped });
}));

export default router;
