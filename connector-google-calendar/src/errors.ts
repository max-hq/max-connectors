/**
 * Error definitions for the Google Calendar connector boundary.
 */

import { MaxError, ErrFacet, InvariantViolated } from "@max/core";

// ============================================================================
// Google Calendar Boundary
// ============================================================================

export const GoogleCalendar = MaxError.boundary("google-calendar");

// ============================================================================
// Error Definitions
// ============================================================================

/** Client accessed before start() was called - lifecycle violation. */
export const ErrNotStarted = GoogleCalendar.define("not_started", {
  facets: [InvariantViolated],
  message: () => "GoogleCalendarClient not started - call start() first",
});

/** HTTP-level error from the Google Calendar API (non-2xx response). */
export const ErrApiError = GoogleCalendar.define("api_error", {
  customProps: ErrFacet.props<{ status: number; statusText: string }>(),
  facets: [],
  message: (d) => `Google Calendar API error: ${d.status} ${d.statusText}`,
});

/** OAuth token exchange failed. */
export const ErrOAuthFailed = GoogleCalendar.define("oauth_failed", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `OAuth token exchange failed: ${d.reason}`,
});

/** Validation call failed. */
export const ErrValidationFailed = GoogleCalendar.define("validation_failed", {
  customProps: ErrFacet.props<{ status: number; statusText: string }>(),
  facets: [],
  message: (d) => `Google Calendar API returned ${d.status}: ${d.statusText}`,
});

/** Token refresh failed. */
export const ErrTokenRefreshFailed = GoogleCalendar.define("token_refresh_failed", {
  customProps: ErrFacet.props<{ reason: string }>(),
  facets: [],
  message: (d) => `Token refresh failed: ${d.reason}`,
});
