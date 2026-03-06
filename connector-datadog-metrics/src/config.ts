/**
 * Datadog Metrics connector config.
 *
 * Produced by onboarding - identifies the target Datadog site.
 */

export interface DatadogMetricsConfig {
  site: string;
  metricPatterns: string;
}
