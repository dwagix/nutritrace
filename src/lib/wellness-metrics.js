/**
 * src/lib/wellness-metrics.js
 *
 * Single source of truth for every wellness/body metric definition —
 * previously these lived as four separate hardcoded arrays inside
 * Wellness.svelte, with Statistics.svelte and Settings/Statistics.svelte
 * each maintaining their OWN third and fourth hand-written copies of a
 * small subset (7 of the 30+ metrics here). That meant a metric visible
 * on the Wellness page had no guarantee of ever showing up as a
 * trackable trend in Statistics, and the two Statistics-side copies
 * could themselves drift out of sync with each other.
 *
 * Import from here instead of redefining. `id` is the wire-level
 * metric_type stored in `wellness_data` (see server/routes/api/v1/
 * wellness-metrics.js and body-measurements.js) — it must match
 * exactly for a pushed value to render anywhere.
 */

export const ALL_METRICS = [
  // Activity — both Fitbit and Garmin
  { id: 'steps',            label: 'Steps',             unit: 'steps', group: 'activity', icon: 'directions_walk',       fmt: v => Math.round(v).toLocaleString(),  sources: ['fitbit','garmin'], desc: 'Total steps taken today.' },
  { id: 'distance_km',      label: 'Distance',          unit: '',      group: 'activity', icon: 'straighten',            fmt: null,                                  sources: ['fitbit','garmin'], desc: 'Total distance covered today.' },
  { id: 'floors',           label: 'Floors Climbed',    unit: 'floors',group: 'activity', icon: 'stairs',                fmt: v => Math.round(v),                   sources: ['fitbit','garmin'], desc: 'Floors climbed based on elevation gain detected by your device.' },
  { id: 'active_minutes',   label: 'Active Minutes',    unit: 'min',   group: 'activity', icon: 'timer',                 fmt: v => Math.round(v),                   sources: ['fitbit','garmin'], desc: 'Time spent at a moderate or higher activity level.' },
  { id: 'calories_out',     label: 'Calories Burned',   unit: 'kcal',  group: 'activity', icon: 'local_fire_department', fmt: v => Math.round(v).toLocaleString(),  sources: ['fitbit','garmin'], desc: 'Total calories burned including your resting metabolic rate.' },
  // Activity — Fitbit only
  { id: 'active_zone_minutes', label: 'Active Zone Min', unit: 'min',  group: 'activity', icon: 'local_fire_department', fmt: v => Math.round(v), sources: ['fitbit'], desc: 'Minutes spent in Fat Burn, Cardio, or Peak heart rate zones — counts double for Cardio and Peak.' },
  // Activity — Garmin only
  { id: 'moderate_intensity_min', label: 'Moderate Intensity', unit: 'min', group: 'activity', icon: 'directions_run', fmt: v => Math.round(v), sources: ['garmin'], desc: 'Time at moderate intensity (brisk walking, light cycling). WHO recommends 150–300 min/week.' },
  { id: 'vigorous_intensity_min', label: 'Vigorous Intensity', unit: 'min', group: 'activity', icon: 'sprint',         fmt: v => Math.round(v), sources: ['garmin'], desc: 'Time at high intensity (running, hard effort). Counts double toward weekly activity targets.' },
  // Sleep — both
  { id: 'sleep_duration_min', label: 'Sleep Duration', unit: '',     group: 'sleep', icon: 'bedtime',               fmt: null,               sources: ['fitbit','garmin'], desc: 'Total time asleep last night. Adults generally need 7–9 hours.' },
  { id: 'sleep_deep_min',     label: 'Deep Sleep',     unit: 'min',  group: 'sleep', icon: 'nights_stay',           fmt: v => Math.round(v), sources: ['fitbit','garmin'], desc: 'Deep (slow-wave) sleep — the most restorative stage. Critical for physical recovery and immune function.' },
  { id: 'sleep_light_min',    label: 'Light Sleep',    unit: 'min',  group: 'sleep', icon: 'cloud',                 fmt: v => Math.round(v), sources: ['fitbit','garmin'], desc: 'Light sleep is the transition between wakefulness and deeper stages. Makes up the majority of most sleep cycles.' },
  { id: 'sleep_rem_min',      label: 'REM Sleep',      unit: 'min',  group: 'sleep', icon: 'psychology',            fmt: v => Math.round(v), sources: ['fitbit','garmin'], desc: 'REM sleep supports memory consolidation, learning, and emotional regulation. Increases in later sleep cycles.' },
  { id: 'sleep_wake_min',     label: 'Awake',          unit: 'min',  group: 'sleep', icon: 'wb_twilight',           fmt: v => Math.round(v), sources: ['fitbit','garmin'], desc: 'Time spent awake or restless during the night. Brief awakenings are normal; frequent ones may signal poor sleep quality.' },
  // Sleep — Fitbit only
  { id: 'sleep_efficiency',   label: 'Sleep Efficiency', unit: '%',  group: 'sleep', icon: 'battery_charging_full', fmt: v => v.toFixed(0),  sources: ['fitbit'], desc: 'Percentage of time in bed actually spent asleep. Above 85% is generally considered good.' },
  // Sleep — Garmin (device-measured); Fitbit (estimated from stages + SpO2 + HRV)
  { id: 'sleep_score',        label: 'Sleep Score',    unit: '/100', group: 'sleep', icon: 'star',                  fmt: v => Math.round(v), sources: ['fitbit','garmin'], desc: 'Overall sleep quality score out of 100. Factors in duration, sleep stage balance, SpO2, and HRV.' },
  // Sleep Quality (Fitbit Public Preview Sleep Score redesign).
  { id: 'sleep_time_to_fall_asleep_min', label: 'Time to Sound Sleep', unit: 'min', group: 'sleep_quality', icon: 'snooze',           fmt: v => Math.round(v), sources: ['fitbit'], desc: 'How long it took to settle into deep sleep after first falling asleep. Lower is generally better.' },
  { id: 'sleep_sound_sleep_min',         label: 'Sound Sleep',          unit: '',    group: 'sleep_quality', icon: 'self_improvement', fmt: v => { const h = Math.floor(v / 60); const m = Math.round(v % 60); return h ? `${h}h ${m}m` : `${m}m`; }, sources: ['fitbit'], desc: 'Longest stretch of uninterrupted sleep (LIGHT, DEEP, and REM with no wake events). Approximation of Fitbit\'s Sound Sleep metric — Fitbit\'s exact algorithm is proprietary and may use motion data the API does not expose.' },
  { id: 'sleep_restlessness_min',        label: 'Restlessness',         unit: 'min', group: 'sleep_quality', icon: 'vibration',        fmt: v => Math.round(v), sources: ['fitbit'], desc: 'Brief stirring during the night — short AWAKE segments under 5 minutes. Approximation of Fitbit\'s Restlessness metric, which also incorporates motion data the API does not expose.' },
  { id: 'sleep_interruptions_min',       label: 'Interruptions',        unit: 'min', group: 'sleep_quality', icon: 'pause_circle',     fmt: v => Math.round(v), sources: ['fitbit'], desc: 'Wake events of 5 minutes or longer that you\'re likely to remember. Card shows total minutes and the count of awakenings.' },
  { id: 'sleep_full_awakenings',         label: 'Full Awakenings',      unit: '',    group: 'sleep_quality', icon: 'notifications_active', fmt: v => Math.round(v), sources: ['fitbit'], desc: 'Number of distinct wake events of 5 minutes or longer. Shown alongside Interruptions on the same card.', hideTile: true },
  // Heart — both
  { id: 'resting_hr',        label: 'Resting Heart Rate', unit: 'bpm',  group: 'heart', icon: 'favorite',       fmt: v => Math.round(v), sources: ['fitbit','garmin'], desc: 'Heart rate when fully at rest. Lower is generally better — a downward trend over time reflects improving cardiovascular fitness.' },
  // #205: Health Connect ingests a daily avg_heart_rate that had no card
  // definition upstream, so the metric silently existed without a Wellness
  // surface. Distinct from Resting Heart Rate (fully at rest) so the two
  // live side by side in the Heart group.
  //
  // hideIfEmpty: only Health Connect populates avg_heart_rate today (Fitbit
  // and Garmin cloud syncs write avg_hr per workout, not a daily aggregate).
  // Honored by the Heart tab's filter so the card only appears on days a
  // value exists, rather than as a permanent empty card for everyone else.
  { id: 'avg_heart_rate',    label: 'Average Heart Rate', unit: 'bpm',  group: 'heart', icon: 'monitor_heart',  fmt: v => Math.round(v), sources: ['fitbit','garmin'], hideIfEmpty: true, desc: 'Average heart rate across the day from your wearable. Rises with activity, stress, and elevated body temperature; useful for spotting an unusually high or low day at a glance.' },
  { id: 'spo2_avg',          label: 'SpO2',               unit: '%',    group: 'heart', icon: 'water_drop',     fmt: v => v.toFixed(1),  sources: ['fitbit','garmin'], desc: 'Blood oxygen saturation measured overnight. Healthy range is typically 95–100%. Dips below 90% may indicate sleep apnea.' },
  { id: 'respiratory_rate',  label: 'Respiratory Rate',   unit: 'brpm', group: 'heart', icon: 'air',            fmt: v => v.toFixed(1),  sources: ['fitbit','garmin'], desc: 'Average breaths per minute during sleep. Normal adult range is 12–20 breaths/min. Elevated values may signal illness or stress.' },
  { id: 'hrv_daily_rmssd',   label: 'HRV (RMSSD)',        unit: 'ms',   group: 'heart', icon: 'monitor_heart',  fmt: v => v.toFixed(1),  sources: ['fitbit','garmin'], desc: 'Heart rate variability — the variation between heartbeats. Higher values indicate better recovery and autonomic nervous system balance.' },
  // Heart — Fitbit only
  { id: 'skin_temp_variation', label: 'Skin Temp Var.', unit: '',     group: 'heart', icon: 'thermometer',    fmt: null, sources: ['fitbit'], desc: 'Nightly skin temperature variation from your personal baseline. Elevated readings can indicate illness or hormonal changes.' },
  { id: 'vo2_max',             label: 'Cardio Fitness',  unit: '',     group: 'heart', icon: 'fitness_center', fmt: v => v.toFixed(1),  sources: ['fitbit'], desc: 'Estimated VO₂ Max — the maximum oxygen your body can use during exercise. Fitbit shows this as a range (e.g. 39–43 mL/kg/min). A key indicator of long-term cardiovascular health.' },
  // Heart — Garmin only
  { id: 'max_hr',           label: 'Max Heart Rate',     unit: 'bpm',       group: 'heart', icon: 'favorite',       fmt: v => Math.round(v), sources: ['garmin'], desc: 'Highest heart rate recorded during the day. Useful for tracking workout intensity and your true max effort.' },
];

export const BODY_METRICS = [
  { id: 'weight_kg',     label: 'Weight',       unit: '', icon: 'monitor_weight',   fmt: null, desc: 'Current body weight from your scale.' },
  { id: 'body_fat_pct',  label: 'Body Fat',     unit: '%', icon: 'percent',          fmt: v => v.toFixed(1), desc: 'Percentage of total body weight that is fat tissue. Healthy ranges vary by age and sex.' },
  { id: 'muscle_mass_kg',label: 'Muscle Mass',  unit: '', icon: 'fitness_center',   fmt: null, desc: 'Total skeletal muscle mass. Higher values indicate better strength and metabolic health.' },
  { id: 'bone_mass_kg',  label: 'Bone Mass',    unit: '', icon: 'emergency',         fmt: v => v.toFixed(2), desc: 'Estimated bone mineral content. Stable values are normal; significant drops may warrant discussion with your doctor.' },
  { id: 'body_water_pct',label: 'Body Water',   unit: '', icon: 'water_drop',       fmt: null, desc: 'Total body water as a percentage of weight. Normal range is 45–65% depending on age and sex.' },
  { id: 'lean_mass_kg',            label: 'Lean Mass',            unit: '', icon: 'person',           fmt: null, desc: 'Everything except fat — includes muscle, bone, organs, and water.' },
  { id: 'fat_mass_kg',             label: 'Fat Mass',             unit: '', icon: 'scale',            fmt: null, desc: 'Total fat tissue weight. Tracking trends is more useful than individual readings.' },
  { id: 'visceral_fat',            label: 'Visceral Fat',         unit: '', icon: 'favorite_border',  fmt: v => v.toFixed(1), desc: 'Fat stored around internal organs. Higher levels are linked to increased metabolic and cardiovascular risk.' },
  { id: 'visceral_fat_index',      label: 'Visceral Fat Index',   unit: '', icon: 'favorite_border',  fmt: v => v.toFixed(1), desc: 'Indexed rating of visceral fat. Lower is better — a score under 13 is generally considered healthy.' },
  { id: 'extracellular_water_kg',  label: 'Extracellular Water',  unit: '', icon: 'water_drop',       fmt: null, desc: 'Water outside cells (blood, lymph, interstitial fluid). Elevated levels may indicate inflammation or fluid retention.' },
  { id: 'intracellular_water_kg',  label: 'Intracellular Water',  unit: '', icon: 'water_drop',       fmt: null, desc: 'Water inside cells. Reflects hydration at the cellular level — higher relative to extracellular is generally healthier.' },
];

export const BODY_SCORE_METRICS = [
  { id: 'vascular_age',       label: 'Vascular Age',     unit: 'yrs',  icon: 'cardiology',   fmt: v => Math.round(v), desc: 'Estimated age of your arteries based on pulse wave velocity. Lower than your actual age indicates healthier blood vessels.' },
  { id: 'metabolic_age',      label: 'Metabolic Age',    unit: 'yrs',  icon: 'trending_up',  fmt: v => Math.round(v), desc: 'Your body\'s metabolic efficiency compared to age norms. Lower than your actual age means your metabolism is performing well.' },
  { id: 'basal_metabolic_rate', label: 'Basal Metabolic Rate', unit: 'kcal/day', icon: 'local_fire_department', fmt: v => Math.round(v).toLocaleString(), desc: 'Calories your body burns at complete rest over 24 hours. Influenced by muscle mass, age, and body composition.' },
  { id: 'nerve_health_score', label: 'Nerve Health Score',  unit: '/100', icon: 'neurology',    fmt: v => Math.round(v), desc: 'Monthly nerve health score from your Withings scale. Calculated from daily EDA readings over the month. Above 50 = Normal, below 50 = Low. Final score confirmed at month-end.' },
  { id: 'eda_feet',           label: 'EDA (Daily)',        unit: 'µS',   icon: 'neurology',    fmt: v => v.toFixed(1), desc: 'Daily electrodermal activity reading from your Withings scale. Measures sweat gland nerve conductance in your feet. These daily readings feed into the monthly Nerve Health Score.' },
  { id: 'pulse_wave_velocity',label: 'Pulse Wave Vel.',  unit: 'm/s',  icon: 'show_chart',    fmt: v => v.toFixed(1), desc: 'Speed of blood pressure pulse along arteries. Lower values indicate more elastic, healthier blood vessels.' },
  { id: 'ecg_heart_rate',     label: 'Heart Rate',       unit: 'bpm',  icon: 'ecg_heart',     fmt: v => Math.round(v), desc: 'Heart rate measured during ECG recording on your scale. More accurate than optical wrist sensors.' },
  { id: 'ecg_afib',           label: 'AFib Detection',   unit: '',     icon: 'ecg',           fmt: v => v === 1 ? 'Detected' : 'Normal', desc: 'Atrial fibrillation screening from ECG recording. "Normal" means no irregular rhythm detected during this reading.' },
];

export const GARMIN_METRICS = [
  { id: 'body_battery_high', label: 'Body Battery (Peak)', unit: '',    icon: 'battery_full',    fmt: v => Math.round(v), desc: 'Highest Body Battery level today (0–100). Charges during rest and sleep, drains during activity and stress.' },
  { id: 'body_battery_low',  label: 'Body Battery (Low)',  unit: '',    icon: 'battery_alert',   fmt: v => Math.round(v), desc: 'Lowest Body Battery level today. If it drops below 20, your body may need rest or recovery.' },
  { id: 'stress_avg',        label: 'Avg Stress',          unit: '/100',icon: 'sentiment_stressed', fmt: v => Math.round(v), desc: 'Average stress level from Garmin (0–100). Measured via heart rate variability throughout the day. Lower is calmer.' },
];

// Statistics (both the main page and Settings → Statistics) needs a short
// `wl_<something>` key per metric to store in statsMetricOrder /
// statsHiddenMetrics. A handful of metrics predate this shared module and
// used hand-picked short names (wl_steps, wl_active, etc.) — preserved
// here so anyone's already-saved order/hidden-metric settings keep
// resolving to the same metric after this refactor. Every metric added
// since just gets `wl_<id>` directly.
export const WL_LEGACY_KEYS = {
  steps: 'wl_steps',
  active_minutes: 'wl_active',
  sleep_duration_min: 'wl_sleep',
  resting_hr: 'wl_rhr',
  hrv_daily_rmssd: 'wl_hrv',
  spo2_avg: 'wl_spo2',
  muscle_mass_kg: 'wl_muscle',
};
export function wlKey(id) { return WL_LEGACY_KEYS[id] || `wl_${id}`; }
export function wlIdFromKey(key) {
  const found = Object.entries(WL_LEGACY_KEYS).find(([, k]) => k === key);
  return found ? found[0] : key.slice(3);
}
