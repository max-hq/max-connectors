/**
 * GoogleCalendarContext - Context definition for Google Calendar connector.
 */

import { Context } from "@max/core";
import type { GoogleCalendarClient } from "./calendar-client.js";

export class GoogleCalendarContext extends Context {
  api = Context.instance<GoogleCalendarClient>();
}
