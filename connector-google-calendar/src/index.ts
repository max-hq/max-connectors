/**
 * @max/connector-google-calendar — Google Calendar connector.
 *
 * Syncs calendars, events, and attendees from all calendars accessible
 * to the authenticated Google account. Uses OAuth 2.0 for auth and
 * the Calendar REST API v3 for data.
 */

import { Context } from "@max/core";
import { ConnectorDef, ConnectorModule, Installation } from "@max/connector";
import { GoogleCalendarSchema } from "./schema.js";
import { GoogleCalendarSeeder } from "./seeder.js";
import { GoogleCalendarRootResolver } from "./resolvers/root-resolver.js";
import { GoogleCalendarResolver } from "./resolvers/calendar-resolver.js";
import { GoogleCalendarEventResolver } from "./resolvers/event-resolver.js";
import { GoogleCalendarAttendeeResolver } from "./resolvers/attendee-resolver.js";
import { GoogleCalendarOnboarding } from "./onboarding.js";
import { GoogleCalendarContext } from "./context.js";
import { GoogleCalendarClient } from "./calendar-client.js";
import { GoogleAccessToken, GoogleRefreshToken } from "./credentials.js";
import type { GoogleCalendarConfig } from "./config.js";

// ============================================================================
// ConnectorDef
// ============================================================================

const GoogleCalendarDef = ConnectorDef.create<GoogleCalendarConfig>({
  name: "google-calendar",
  displayName: "Google Calendar",
  description: "Google Calendar connector — syncs calendars, events, and attendees",
  icon: "",
  version: "0.1.0",
  scopes: [],
  schema: GoogleCalendarSchema,
  onboarding: GoogleCalendarOnboarding,
  seeder: GoogleCalendarSeeder,
  resolvers: [
    GoogleCalendarRootResolver,
    GoogleCalendarResolver,
    GoogleCalendarEventResolver,
    GoogleCalendarAttendeeResolver,
  ],
});

// ============================================================================
// ConnectorModule (default export)
// ============================================================================

const GoogleCalendarConnector = ConnectorModule.create<GoogleCalendarConfig>({
  def: GoogleCalendarDef,
  initialise(config, credentials) {
    const accessTokenHandle = credentials.get(GoogleAccessToken);
    const refreshTokenHandle = credentials.get(GoogleRefreshToken);
    const api = new GoogleCalendarClient(
      accessTokenHandle,
      refreshTokenHandle,
      config.clientId,
      config.clientSecret,
    );

    const ctx = Context.build(GoogleCalendarContext, { api });

    return Installation.create({
      context: ctx,
      async start() {
        await api.start();
        credentials.startRefreshSchedulers();
      },
      async stop() {
        credentials.stopRefreshSchedulers();
      },
      async health() {
        const result = await api.health();
        return result.ok
          ? { status: "healthy" }
          : { status: "unhealthy", reason: result.error ?? "Unknown error" };
      },
    });
  },
});

export default GoogleCalendarConnector;
