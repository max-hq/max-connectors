/**
 * Error definitions for the GitHub connector boundary.
 */

import { MaxError, ErrFacet, InvariantViolated, BadInput } from "@max/core";

// ============================================================================
// GitHub Boundary
// ============================================================================

export const GitHub = MaxError.boundary("github");

// ============================================================================
// Error Definitions
// ============================================================================

/** Client accessed before start() was called - lifecycle violation. */
export const ErrGitHubNotStarted = GitHub.define("not_started", {
  facets: [InvariantViolated],
  message: () => "GitHubClient not started - call start() first",
});

/** HTTP-level error from the GitHub API (non-2xx response). */
export const ErrGitHubApiError = GitHub.define("api_error", {
  customProps: ErrFacet.props<{ status: number; statusText: string }>(),
  facets: [],
  message: (d) => `GitHub API error: ${d.status} ${d.statusText}`,
});

/** gh CLI is not installed or not authenticated. */
export const ErrGhCliNotAvailable = GitHub.define("gh_cli_not_available", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `GitHub CLI (gh) not available: ${d.reason}`,
});

/** Unexpected HTTP status from GitHub API during validation. */
export const ErrGitHubValidationFailed = GitHub.define("validation_failed", {
  customProps: ErrFacet.props<{ status: number; statusText: string }>(),
  facets: [],
  message: (d) => `GitHub API returned ${d.status}: ${d.statusText}`,
});

/** GraphQL-level error from the GitHub v4 API. */
export const ErrGitHubGraphqlError = GitHub.define("graphql_error", {
  customProps: ErrFacet.props<{ graphqlMessage: string }>(),
  facets: [],
  message: (d) => `GitHub GraphQL error: ${d.graphqlMessage}`,
});
