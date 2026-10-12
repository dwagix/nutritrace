/**
 * Persistent collapse state for meal cards in the Diary. Modelled on
 * LiftTrace's cardCollapse.js (same author): per-viewer, kept in
 * localStorage, keyed by date then meal slot index so a collapsed Breakfast
 * stays collapsed when you navigate away and back. Dates beyond the newest
 * 30 are pruned.
 *
 * Three states, as in LiftTrace. The Diary treats anything but 'expanded'
 * as collapsed (fork default: meals start collapsed):
 *   undefined   - never interacted with (Diary shows it collapsed)
 *   'collapsed' - user explicitly collapsed it
 *   'expanded'  - user explicitly opened it; items + add-row visible
 */
const KEY = 'nt:meal-collapsed';
const MAX_DATES = 30;

function _read() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }
  catch { return {}; }
}

function _write(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)); } catch { /* private mode / quota */ }
}

/** { [mealIdx]: 'collapsed' | 'expanded' } for one date. */
export function getDayCollapse(date) {
  if (!date) return {};
  return { ..._read()[date] };
}

/** Persist an explicit state for one meal slot on one date. */
export function setMealCollapsed(date, mealIdx, collapsed) {
  if (!date || mealIdx == null) return;
  const map = _read();
  map[date] = { ...map[date], [mealIdx]: collapsed ? 'collapsed' : 'expanded' };
  const dates = Object.keys(map).sort();
  for (const d of dates.slice(0, Math.max(0, dates.length - MAX_DATES))) delete map[d];
  _write(map);
}
