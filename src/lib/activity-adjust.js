/**
 * How much logged activity moves the calorie goal.
 *
 * Adaptive TDEE is learned from intake and weight trend, so it already
 * contains the user's AVERAGE daily activity. Adding a whole day's activity
 * on top of it counts that average twice. In Adaptive mode only the
 * difference from typical is applied: a harder-than-usual day raises the
 * goal, an easier one lowers it, and over time the goal averages out to the
 * learned TDEE.
 *
 * Every other case (setting off, other goal modes, Adaptive not ready, or a
 * server that sends no average) adds the full activity, as upstream does.
 *
 * @returns {{ typical: number, adjust: number }}  adjust is signed and is
 *          added to the base goal; typical is what was taken out of it.
 */
export function activityGoalAdjust({ adjustOn, effective, adaptiveReady, avgActive }) {
  if (!adjustOn) return { typical: 0, adjust: 0 };
  const eff = Math.max(0, Number(effective) || 0);
  const typical = adaptiveReady ? Math.max(0, Number(avgActive) || 0) : 0;
  return { typical, adjust: eff - typical };
}
