/**
 * Whitelist of metric_type ids accepted by POST /api/v1/wellness-metrics.
 *
 * Must match the metric ids in src/lib/wellness-metrics.js (ALL_METRICS
 * plus GARMIN_METRICS; the body groups go through body-measurements.js).
 * The server image does not ship src/, so it cannot import that module;
 * scripts/wellness-metric-keys.test.js fails if the two drift apart.
 * Anything else in a payload is ignored rather than erroring, so one
 * unrecognized key doesn't fail the whole batch.
 */
export const METRIC_KEYS = new Set([
  // activity
  'steps',
  'distance_km',
  'floors',
  'active_minutes',
  'calories_out',
  'active_zone_minutes',
  'moderate_intensity_min',
  'vigorous_intensity_min',
  // sleep
  'sleep_duration_min',
  'sleep_deep_min',
  'sleep_light_min',
  'sleep_rem_min',
  'sleep_wake_min',
  'sleep_efficiency',
  'sleep_score',
  // sleep_quality
  'sleep_time_to_fall_asleep_min',
  'sleep_sound_sleep_min',
  'sleep_restlessness_min',
  'sleep_interruptions_min',
  'sleep_full_awakenings',
  // heart
  'resting_hr',
  'avg_heart_rate',
  'spo2_avg',
  'respiratory_rate',
  'hrv_daily_rmssd',
  'skin_temp_variation',
  'vo2_max',
  'max_hr',
  // Garmin daily-summary extras
  'body_battery_high',
  'body_battery_low',
  'stress_avg',
]);
