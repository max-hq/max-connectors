/**
 * Google Calendar entity definitions.
 *
 * Ordered leaf-first to avoid forward references in const declarations.
 */

import {
  EntityDef,
  Field,
  type ScalarField,
  type RefField,
  type CollectionField,
} from "@max/core";

// ============================================================================
// GoogleCalendar (leaf)
// ============================================================================

export interface GoogleCalendar extends EntityDef<{
  calendarId: ScalarField<"string">;
  summary: ScalarField<"string">;
  description: ScalarField<"string">;
  timeZone: ScalarField<"string">;
  accessRole: ScalarField<"string">;
  primary: ScalarField<"string">;
  backgroundColor: ScalarField<"string">;
  foregroundColor: ScalarField<"string">;
}> {}

export const GoogleCalendar: GoogleCalendar = EntityDef.create("GoogleCalendar", {
  calendarId: Field.string(),
  summary: Field.string(),
  description: Field.string(),
  timeZone: Field.string(),
  accessRole: Field.string(),
  primary: Field.string(),
  backgroundColor: Field.string(),
  foregroundColor: Field.string(),
});

// ============================================================================
// GoogleCalendarEvent (refs GoogleCalendar)
// ============================================================================

export interface GoogleCalendarEvent extends EntityDef<{
  calendar: RefField<GoogleCalendar>;
  eventId: ScalarField<"string">;
  summary: ScalarField<"string">;
  description: ScalarField<"string">;
  location: ScalarField<"string">;
  status: ScalarField<"string">;
  start: ScalarField<"string">;
  end: ScalarField<"string">;
  allDay: ScalarField<"string">;
  recurring: ScalarField<"string">;
  recurringEventId: ScalarField<"string">;
  organizer: ScalarField<"string">;
  organizerDisplayName: ScalarField<"string">;
  creator: ScalarField<"string">;
  htmlLink: ScalarField<"string">;
  hangoutLink: ScalarField<"string">;
  attendeeCount: ScalarField<"number">;
  createdAt: ScalarField<"string">;
  updatedAt: ScalarField<"string">;
}> {}

export const GoogleCalendarEvent: GoogleCalendarEvent = EntityDef.create("GoogleCalendarEvent", {
  calendar: Field.ref(GoogleCalendar),
  eventId: Field.string(),
  summary: Field.string(),
  description: Field.string(),
  location: Field.string(),
  status: Field.string(),
  start: Field.string(),
  end: Field.string(),
  allDay: Field.string(),
  recurring: Field.string(),
  recurringEventId: Field.string(),
  organizer: Field.string(),
  organizerDisplayName: Field.string(),
  creator: Field.string(),
  htmlLink: Field.string(),
  hangoutLink: Field.string(),
  attendeeCount: Field.number(),
  createdAt: Field.string(),
  updatedAt: Field.string(),
});

// ============================================================================
// GoogleCalendarAttendee (refs GoogleCalendarEvent, GoogleCalendar)
// ============================================================================

export interface GoogleCalendarAttendee extends EntityDef<{
  event: RefField<GoogleCalendarEvent>;
  calendar: RefField<GoogleCalendar>;
  email: ScalarField<"string">;
  displayName: ScalarField<"string">;
  responseStatus: ScalarField<"string">;
  organizer: ScalarField<"string">;
  self: ScalarField<"string">;
  optional: ScalarField<"string">;
}> {}

export const GoogleCalendarAttendee: GoogleCalendarAttendee = EntityDef.create("GoogleCalendarAttendee", {
  event: Field.ref(GoogleCalendarEvent),
  calendar: Field.ref(GoogleCalendar),
  email: Field.string(),
  displayName: Field.string(),
  responseStatus: Field.string(),
  organizer: Field.string(),
  self: Field.string(),
  optional: Field.string(),
});

// ============================================================================
// GoogleCalendarRoot (root singleton — all collections)
// ============================================================================

export interface GoogleCalendarRoot extends EntityDef<{
  email: ScalarField<"string">;
  calendars: CollectionField<GoogleCalendar>;
  events: CollectionField<GoogleCalendarEvent>;
  attendees: CollectionField<GoogleCalendarAttendee>;
}> {}

export const GoogleCalendarRoot: GoogleCalendarRoot = EntityDef.create("GoogleCalendarRoot", {
  email: Field.string(),
  calendars: Field.collection(GoogleCalendar),
  events: Field.collection(GoogleCalendarEvent),
  attendees: Field.collection(GoogleCalendarAttendee),
});
