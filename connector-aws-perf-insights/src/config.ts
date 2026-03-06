/**
 * AWS Performance Insights connector config.
 *
 * Produced by onboarding - identifies the target AWS region and DB instance.
 */

export interface AWSPerfInsightsConfig {
  region: string;
  dbResourceId: string; // DbiResourceId (e.g. "db-XXXXXXXXXXXXXXXXXXXX")
}
