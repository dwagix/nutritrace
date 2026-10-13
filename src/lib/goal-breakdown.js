import { activityGoalAdjust } from './activity-adjust.js';

/**
 * Explains how the Diary's calorie goal for a day was reached, so the
 * "why is my goal X today?" sheet and the numbers on screen cannot disagree.
 *
 * `base` is the goal the Diary already computed (caloriesGoal); this only
 * describes where it came from. It never recomputes it.
 *
 * basis:
 *   'fixed'     - the goal set in Goals (also the fallback below)
 *   'dynamic'   - yesterday's calories out x factor
 *   'adaptive'  - learned TDEE x factor
 * fallback (null when the chosen mode is in effect):
 *   'dynamic-no-data'      - Dynamic chosen but no calories-out value yet
 *   'adaptive-not-ready'   - Adaptive chosen but not enough data learned yet
 *
 * @returns {{ basis: string, fallback: string|null, source: number|null,
 *   factor: number, base: number, adjustOn: boolean, effective: number,
 *   typical: number, adjust: number, adjusted: number }}
 */
export function goalBreakdown({ mode, factor, base, dynamicCaloriesOut, adaptiveTdee,
                                adjustOn, effective, avgActive }) {
  let basis = 'fixed', fallback = null, source = null;
  if (mode === 'dynamic') {
    if (dynamicCaloriesOut != null) { basis = 'dynamic'; source = dynamicCaloriesOut; }
    else fallback = 'dynamic-no-data';
  } else if (mode === 'adaptive') {
    if (adaptiveTdee != null) { basis = 'adaptive'; source = adaptiveTdee; }
    else fallback = 'adaptive-not-ready';
  }
  const eff = Math.max(0, Number(effective) || 0);
  const { typical, adjust } = activityGoalAdjust({
    adjustOn: !!adjustOn, effective: eff, adaptiveReady: basis === 'adaptive', avgActive,
  });
  return {
    basis, fallback, source, factor: Number(factor) || 1, base,
    adjustOn: !!adjustOn, effective: eff, typical, adjust, adjusted: base + adjust,
  };
}
