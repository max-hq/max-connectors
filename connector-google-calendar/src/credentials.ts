/**
 * Google Calendar credential definitions.
 *
 * Access + refresh tokens stored as plain strings.
 * Token refresh is managed manually in the calendar client.
 */

import { Credential } from "@max/connector";

export const GoogleAccessToken = Credential.string("google_access_token");
export const GoogleRefreshToken = Credential.string("google_refresh_token");
