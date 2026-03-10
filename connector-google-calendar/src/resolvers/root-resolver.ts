/**
 * GoogleCalendarRoot Resolver — Loads root metadata and all collections.
 *
 * Multi-page pagination: each loader invocation processes one calendar (or one
 * batch for attendees) and returns hasMore=true with a cursor so the framework
 * spawns continuation tasks. This keeps the daemon connection alive.
 *
 * Time window: 6 months back + 6 months forward from now.
 * Sync order: calendars → events → attendees.
 */

import { Resolver, EntityInput, Loader, Page } from "@max/core";
import {
  GoogleCalendarRoot,
  GoogleCalendar,
  GoogleCalendarEvent,
  GoogleCalendarAttendee,
} from "../entities.js";
import { GoogleCalendarContext } from "../context.js";
import { stableId } from "../id-utils.js";
import type { CollectedAttendee } from "../calendar-client.js";

// ============================================================================
// Helpers
// ============================================================================

function sixMonthsAgo(): string {
  const d = new Date();
  d.setMonth(d.getMonth() - 6);
  return d.toISOString();
}

function sixMonthsFromNow(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 6);
  return d.toISOString();
}

// ============================================================================
// Root basic loader (entity — autoload fallback for scalar fields)
// ============================================================================

export const RootBasicLoader = Loader.entity({
  name: "google-calendar:root:basic",
  context: GoogleCalendarContext,
  entity: GoogleCalendarRoot,
  strategy: "autoload",

  async load(ref, ctx) {
    const calendars = await ctx.api.getAllCalendars();
    const primary = calendars.find((c) => c.primary === true);
    const email = (primary?.id as string) ?? "";

    return EntityInput.create(ref, { email });
  },
});

// ============================================================================
// Calendars collection loader (single page — typically <50 calendars)
// ============================================================================

export const CalendarsLoader = Loader.collection({
  name: "google-calendar:root:calendars",
  context: GoogleCalendarContext,
  entity: GoogleCalendarRoot,
  target: GoogleCalendar,

  async load(_ref, _page, ctx) {
    try {
      const calendars = await ctx.api.getAllCalendars();

      const items = calendars.map((cal) => {
        const calendarId = (cal.id as string) ?? "";
        const id = stableId("calendar", calendarId);

        return EntityInput.create(GoogleCalendar.ref(id), {
          calendarId,
          summary: (cal.summary as string) ?? "",
          description: (cal.description as string) ?? "",
          timeZone: (cal.timeZone as string) ?? "",
          accessRole: (cal.accessRole as string) ?? "",
          primary: String(cal.primary ?? false),
          backgroundColor: (cal.backgroundColor as string) ?? "",
          foregroundColor: (cal.foregroundColor as string) ?? "",
        });
      });

      return Page.from(items, false, undefined);
    } catch {
      return Page.from([], false, undefined);
    }
  },
});

// ============================================================================
// Events collection loader (one calendar per page)
// ============================================================================

export const EventsLoader = Loader.collection({
  name: "google-calendar:root:events",
  context: GoogleCalendarContext,
  entity: GoogleCalendarRoot,
  target: GoogleCalendarEvent,

  async load(_ref, page, ctx) {
    const calendars = await ctx.api.getAllCalendars();
    const idx = page.cursor ? parseInt(page.cursor) : 0;
    if (idx >= calendars.length) return Page.from([], false, undefined);

    const cal = calendars[idx];
    const calendarId = (cal.id as string) ?? "";
    const calRef = GoogleCalendar.ref(stableId("calendar", calendarId));
    const timeMin = sixMonthsAgo();
    const timeMax = sixMonthsFromNow();
    const items: EntityInput<typeof GoogleCalendarEvent>[] = [];

    try {
      const events = await ctx.api.getAllEventsForCalendar(calendarId, timeMin, timeMax);

      for (const event of events) {
        const eventId = (event.id as string) ?? "";
        const id = stableId("event", calendarId, eventId);

        // Extract start/end — can be dateTime or date (all-day events)
        const startObj = event.start as { dateTime?: string; date?: string } | undefined;
        const endObj = event.end as { dateTime?: string; date?: string } | undefined;
        const startVal = startObj?.dateTime ?? startObj?.date ?? "";
        const endVal = endObj?.dateTime ?? endObj?.date ?? "";
        const allDay = startObj?.date ? "true" : "false";

        const organizerObj = event.organizer as { email?: string; displayName?: string } | undefined;
        const creatorObj = event.creator as { email?: string } | undefined;

        const attendees = event.attendees as Array<{
          email?: string;
          displayName?: string;
          responseStatus?: string;
          organizer?: boolean;
          self?: boolean;
          optional?: boolean;
        }> | undefined;

        // Collect attendees into accumulator
        if (attendees && attendees.length > 0) {
          const collected: CollectedAttendee[] = attendees.map((a) => ({
            calendarId,
            eventId,
            email: a.email ?? "",
            displayName: a.displayName ?? "",
            responseStatus: a.responseStatus ?? "",
            organizer: a.organizer ?? false,
            self: a.self ?? false,
            optional: a.optional ?? false,
          }));
          ctx.api.collectAttendees(collected);
        }

        items.push(
          EntityInput.create(GoogleCalendarEvent.ref(id), {
            calendar: calRef,
            eventId,
            summary: (event.summary as string) ?? "",
            description: (event.description as string) ?? "",
            location: (event.location as string) ?? "",
            status: (event.status as string) ?? "",
            start: startVal,
            end: endVal,
            allDay,
            recurring: event.recurringEventId ? "true" : "false",
            recurringEventId: (event.recurringEventId as string) ?? "",
            organizer: organizerObj?.email ?? "",
            organizerDisplayName: organizerObj?.displayName ?? "",
            creator: creatorObj?.email ?? "",
            htmlLink: (event.htmlLink as string) ?? "",
            hangoutLink: (event.hangoutLink as string) ?? "",
            attendeeCount: attendees?.length ?? 0,
            createdAt: (event.created as string) ?? "",
            updatedAt: (event.updated as string) ?? "",
          }),
        );
      }
    } catch {
      // skip calendar on error
    }

    const hasMore = idx + 1 < calendars.length;
    return Page.from(items, hasMore, hasMore ? String(idx + 1) : undefined);
  },
});

// ============================================================================
// Attendees collection loader (reads from accumulator in batches of 500)
// ============================================================================

const ATTENDEES_BATCH_SIZE = 500;

export const AttendeesLoader = Loader.collection({
  name: "google-calendar:root:attendees",
  context: GoogleCalendarContext,
  entity: GoogleCalendarRoot,
  target: GoogleCalendarAttendee,

  async load(_ref, page, ctx) {
    const allAttendees = ctx.api.getCollectedAttendees();
    const offset = page.cursor ? parseInt(page.cursor) : 0;
    if (offset >= allAttendees.length) return Page.from([], false, undefined);

    const batch = allAttendees.slice(offset, offset + ATTENDEES_BATCH_SIZE);
    const items = batch.map((a) => {
      const id = stableId("attendee", a.calendarId, a.eventId, a.email);
      const calRef = GoogleCalendar.ref(stableId("calendar", a.calendarId));
      const eventRef = GoogleCalendarEvent.ref(stableId("event", a.calendarId, a.eventId));

      return EntityInput.create(GoogleCalendarAttendee.ref(id), {
        event: eventRef,
        calendar: calRef,
        email: a.email,
        displayName: a.displayName,
        responseStatus: a.responseStatus,
        organizer: String(a.organizer),
        self: String(a.self),
        optional: String(a.optional),
      });
    });

    const nextOffset = offset + ATTENDEES_BATCH_SIZE;
    const hasMore = nextOffset < allAttendees.length;
    return Page.from(items, hasMore, hasMore ? String(nextOffset) : undefined);
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const GoogleCalendarRootResolver = Resolver.for(GoogleCalendarRoot, {
  email: RootBasicLoader.field("email"),
  calendars: CalendarsLoader.field(),
  events: EventsLoader.field(),
  attendees: AttendeesLoader.field(),
});
