/**
 * Error definitions for the AWS Performance Insights connector boundary.
 */

import { MaxError, ErrFacet, InvariantViolated } from "@max/core";

// ============================================================================
// AWS Performance Insights Boundary
// ============================================================================

export const AWSPerfInsights = MaxError.boundary("aws-perf-insights");

// ============================================================================
// Error Definitions
// ============================================================================

/** Client accessed before start() was called - lifecycle violation. */
export const ErrNotStarted = AWSPerfInsights.define("not_started", {
  facets: [InvariantViolated],
  message: () => "PIClient not started - call start() first",
});

/** HTTP-level error from the AWS Performance Insights API. */
export const ErrApiError = AWSPerfInsights.define("api_error", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `AWS Performance Insights API error: ${d.reason}`,
});

/** Validation failed during onboarding. */
export const ErrValidationFailed = AWSPerfInsights.define("validation_failed", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `AWS Performance Insights validation failed: ${d.reason}`,
});
