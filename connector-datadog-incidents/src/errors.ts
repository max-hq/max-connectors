/**
 * Error definitions for the Datadog Incidents connector boundary.
 */

import { MaxError, ErrFacet, InvariantViolated } from "@max/core";

// ============================================================================
// Datadog Incidents Boundary
// ============================================================================

export const DatadogIncidents = MaxError.boundary("datadog-incidents");

// ============================================================================
// Error Definitions
// ============================================================================

/** Client accessed before start() was called - lifecycle violation. */
export const ErrNotStarted = DatadogIncidents.define("not_started", {
  facets: [InvariantViolated],
  message: () => "DatadogClient not started - call start() first",
});

/** HTTP-level error from the Datadog API. */
export const ErrApiError = DatadogIncidents.define("api_error", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `Datadog API error: ${d.reason}`,
});

/** Validation failed during onboarding. */
export const ErrValidationFailed = DatadogIncidents.define("validation_failed", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `Datadog validation failed: ${d.reason}`,
});
