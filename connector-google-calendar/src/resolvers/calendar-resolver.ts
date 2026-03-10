/**
 * GoogleCalendar Resolver — Autoload fallback for calendars.
 *
 * In practice, fields are populated eagerly by CalendarsLoader during
 * collection loading. This entity loader serves as an autoload fallback.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { GoogleCalendar } from "../entities.js";
import { GoogleCalendarContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const CalendarBasicLoader = Loader.entity({
  name: "google-calendar:calendar:basic",
  context: GoogleCalendarContext,
  entity: GoogleCalendar,
  strategy: "autoload",

  async load(ref, _ctx) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GoogleCalendarResolver = Resolver.for(GoogleCalendar, {
  calendarId: CalendarBasicLoader.field("calendarId"),
  summary: CalendarBasicLoader.field("summary"),
  description: CalendarBasicLoader.field("description"),
  timeZone: CalendarBasicLoader.field("timeZone"),
  accessRole: CalendarBasicLoader.field("accessRole"),
  primary: CalendarBasicLoader.field("primary"),
  backgroundColor: CalendarBasicLoader.field("backgroundColor"),
  foregroundColor: CalendarBasicLoader.field("foregroundColor"),
});
