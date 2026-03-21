/**
 * GoogleCalendarEvent Resolver — Autoload fallback for events.
 *
 * In practice, fields are populated eagerly by EventsLoader during
 * collection loading. This entity loader serves as an autoload fallback.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { GoogleCalendarEvent } from "../entities.js";
import { GoogleCalendarContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const EventBasicLoader = Loader.entity({
  name: "google-calendar:event:basic",
  context: GoogleCalendarContext,
  entity: GoogleCalendarEvent,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GoogleCalendarEventResolver = Resolver.for(GoogleCalendarEvent, {
  calendar: EventBasicLoader.field("calendar"),
  eventId: EventBasicLoader.field("eventId"),
  summary: EventBasicLoader.field("summary"),
  description: EventBasicLoader.field("description"),
  location: EventBasicLoader.field("location"),
  status: EventBasicLoader.field("status"),
  start: EventBasicLoader.field("start"),
  end: EventBasicLoader.field("end"),
  allDay: EventBasicLoader.field("allDay"),
  recurring: EventBasicLoader.field("recurring"),
  recurringEventId: EventBasicLoader.field("recurringEventId"),
  organizer: EventBasicLoader.field("organizer"),
  organizerDisplayName: EventBasicLoader.field("organizerDisplayName"),
  creator: EventBasicLoader.field("creator"),
  htmlLink: EventBasicLoader.field("htmlLink"),
  hangoutLink: EventBasicLoader.field("hangoutLink"),
  attendeeCount: EventBasicLoader.field("attendeeCount"),
  createdAt: EventBasicLoader.field("createdAt"),
  updatedAt: EventBasicLoader.field("updatedAt"),
});
