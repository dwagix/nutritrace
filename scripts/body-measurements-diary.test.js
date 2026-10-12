/**
 * Fork: POST /api/v1/body-measurements must put weight / body_fat where the
 * Diary reads them (body_stats.weight, body_stats.body_fat, weight_unit
 * tag), not only under weight_kg / body_fat_pct.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import os from 'node:os';
import path from 'node:path';

process.env.DB_PATH = path.join(os.tmpdir(), `body-measurements-diary-${process.pid}-${Date.now()}.db`);
process.env.NODE_ENV = 'test';

let db, express, router;
try {
  ({ default: db } = await import('../server/db.js'));
  ({ default: express } = await import('express'));
  ({ default: router } = await import('../server/routes/api/v1/body-measurements.js'));
} catch (error) {
  test('behavior suite skipped when server dependencies are unavailable', { skip: true }, () => {});
  console.warn(`[body-measurements-diary] skipped: ${(error?.message || error).split('\n')[0]}`);
}

if (db) {
  let userId, httpServer, base;

  const post = body => fetch(`${base}/`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const bodyStats = date => JSON.parse(
    db.prepare('SELECT body_stats FROM diary WHERE user_id = ? AND date = ?').get(userId, date).body_stats
  );

  test('setup', async () => {
    userId = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, 'x', 'admin')")
      .run(`bm-diary-${process.pid}`).lastInsertRowid;
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      req.apiUser = { id: Number(userId) };
      req.apiToken = { scopes: ['write:body-measurements'] };
      next();
    });
    app.use('/', router);
    await new Promise(r => { httpServer = app.listen(0, r); });
    base = `http://127.0.0.1:${httpServer.address().port}`;
  });

  test('weight and body_fat land under the keys the Diary reads', async () => {
    const res = await post({ measured_at: '2026-10-10T18:00:00', weight: 76.9, body_fat: 21.2 });
    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.diary.ok, true);
    const bs = bodyStats('2026-10-10');
    assert.equal(bs.weight, 76.9);
    assert.equal(bs.weight_unit, 'kg');
    assert.equal(bs.body_fat, 21.2);
    assert.equal(bs.weight_kg, 76.9);          // original key still written
  });

  test('a later reading the same day overwrites', async () => {
    await post({ measured_at: '2026-10-10T19:00:00', weight: 77.4 });
    assert.equal(bodyStats('2026-10-10').weight, 77.4);
    assert.equal(bodyStats('2026-10-10').body_fat, 21.2);   // untouched
  });

  test('a day tagged lb gets a converted value', async () => {
    db.prepare("INSERT INTO diary (user_id, date, items, body_stats, water) VALUES (?, '2026-10-11', '[]', ?, '[]')")
      .run(userId, JSON.stringify({ weight: 170, weight_unit: 'lb' }));
    await post({ measured_at: '2026-10-11T08:00:00', weight: 80 });
    assert.equal(bodyStats('2026-10-11').weight, 176.4);
  });

  test('muscle_mass alone does not touch diary weight', async () => {
    const res = await post({ measured_at: '2026-10-12T08:00:00', muscle_mass: 56.1 });
    assert.equal(res.status, 201);
    assert.equal((await res.json()).diary, undefined);
    assert.equal(bodyStats('2026-10-12').weight, undefined);
  });

  test('teardown', () => { httpServer?.close(); });
}
