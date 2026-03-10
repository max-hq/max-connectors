/**
 * GoogleCalendarAttendee Resolver — Autoload fallback for attendees.
 *
 * In practice, fields are populated eagerly by AttendeesLoader during
 * collection loading. This entity loader serves as an autoload fallback.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { GoogleCalendarAttendee } from "../entities.js";
import { GoogleCalendarContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const AttendeeBasicLoader = Loader.entity({
  name: "google-calendar:attendee:basic",
  context: GoogleCalendarContext,
  entity: GoogleCalendarAttendee,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GoogleCalendarAttendeeResolver = Resolver.for(GoogleCalendarAttendee, {
  event: AttendeeBasicLoader.field("event"),
  calendar: AttendeeBasicLoader.field("calendar"),
  email: AttendeeBasicLoader.field("email"),
  displayName: AttendeeBasicLoader.field("displayName"),
  responseStatus: AttendeeBasicLoader.field("responseStatus"),
  organizer: AttendeeBasicLoader.field("organizer"),
  self: AttendeeBasicLoader.field("self"),
  optional: AttendeeBasicLoader.field("optional"),
});
