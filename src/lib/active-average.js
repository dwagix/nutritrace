/**
 * active-average.js — "typical daily activity" for Adaptive TDEE mode.
 *
 * Adaptive TDEE is learned from intake and weight trend, so it already
 * contains the user's AVERAGE daily activity. Adding a whole day's logged
 * activity on top of it counts that average twice. The Diary therefore adds
 * only (today's activity − typical activity), which this module supplies.
 *
 * Pure (no db import) so it is unit-testable; the db reads live in
 * adaptive-tdee.js. A byte-identical copy sits in src/lib/active-average.js
 * for the Android/standalone mirror (the server image does not ship src/);
 * scripts/active-average.test.js fails if the two diverge.
 *
 * The three policies mirror effectiveActiveCalories() in active-calories.js
 * and are all returned, so the client picks the user's manualActivityPolicy
 * without the request needing a parameter.
 *
 * @param {Map<string, number>} manualByDate    manual activity kcal per date
 * @param {Map<string, number>} wearableByDate  wearable active kcal per date
 * @param {string[]} dates                      every date in the averaging window
 * @returns {{wearable_wins:number, manual_wins:number, additive:number}|null}
 */
export function averageActiveByPolicy(manualByDate, wearableByDate, dates) {
  if (!dates || dates.length === 0) return null;
  const sums = { wearable_wins: 0, manual_wins: 0, additive: 0 };
  for (const d of dates) {
    const manual = Math.max(0, Number(manualByDate.get(d)) || 0);
    const wearable = Math.max(0, Number(wearableByDate.get(d)) || 0);
    sums.wearable_wins += wearable || manual;
    sums.manual_wins   += (wearable && manual) ? manual : (wearable || manual);
    sums.additive      += wearable + manual;
  }
  const out = {};
  for (const k of Object.keys(sums)) out[k] = Math.round(sums[k] / dates.length);
  return out;
}
