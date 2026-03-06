/**
 * Error definitions for the AWS Cost Explorer connector boundary.
 */

import { MaxError, ErrFacet, InvariantViolated } from "@max/core";

// ============================================================================
// AWS Cost Explorer Boundary
// ============================================================================

export const AWSCostExplorer = MaxError.boundary("aws-cost-explorer");

// ============================================================================
// Error Definitions
// ============================================================================

/** Client accessed before start() was called - lifecycle violation. */
export const ErrNotStarted = AWSCostExplorer.define("not_started", {
  facets: [InvariantViolated],
  message: () => "CostExplorerClient not started - call start() first",
});

/** HTTP-level error from the AWS Cost Explorer API. */
export const ErrApiError = AWSCostExplorer.define("api_error", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `AWS Cost Explorer API error: ${d.reason}`,
});

/** Validation failed during onboarding. */
export const ErrValidationFailed = AWSCostExplorer.define("validation_failed", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `AWS Cost Explorer validation failed: ${d.reason}`,
});
