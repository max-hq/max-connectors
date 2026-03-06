/**
 * Error definitions for the Datadog Metrics connector boundary.
 */

import { MaxError, ErrFacet, InvariantViolated } from "@max/core";

// ============================================================================
// Datadog Metrics Boundary
// ============================================================================

export const DatadogMetrics = MaxError.boundary("datadog-metrics");

// ============================================================================
// Error Definitions
// ============================================================================

/** Client accessed before start() was called - lifecycle violation. */
export const ErrNotStarted = DatadogMetrics.define("not_started", {
  facets: [InvariantViolated],
  message: () => "DatadogClient not started - call start() first",
});

/** HTTP-level error from the Datadog API. */
export const ErrApiError = DatadogMetrics.define("api_error", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `Datadog API error: ${d.reason}`,
});

/** Validation failed during onboarding. */
export const ErrValidationFailed = DatadogMetrics.define("validation_failed", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `Datadog validation failed: ${d.reason}`,
});
