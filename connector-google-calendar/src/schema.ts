/**
 * Google Calendar connector schema.
 */

import { Schema } from "@max/core";
import {
  GoogleCalendar,
  GoogleCalendarEvent,
  GoogleCalendarAttendee,
  GoogleCalendarRoot,
} from "./entities.js";

export {
  GoogleCalendar,
  GoogleCalendarEvent,
  GoogleCalendarAttendee,
  GoogleCalendarRoot,
};

export const GoogleCalendarSchema = Schema.create({
  namespace: "google-calendar",
  entities: [
    GoogleCalendar,
    GoogleCalendarEvent,
    GoogleCalendarAttendee,
    GoogleCalendarRoot,
  ],
  roots: [GoogleCalendarRoot],
});
