/**
 * GoogleCalendarSeeder — Cold-start bootstrapper for the Google Calendar connector.
 *
 * Creates the root singleton entity and returns a plan to load
 * all collections in order: calendars → events → attendees.
 */

import { Seeder, SyncPlan, Step, EntityInput } from "@max/core";
import { GoogleCalendarRoot } from "./entities.js";
import { GoogleCalendarContext } from "./context.js";

export const GoogleCalendarSeeder = Seeder.create({
  context: GoogleCalendarContext,

  async seed(ctx, engine) {
    // Fetch calendars to find the primary calendar's email
    const calendars = await ctx.api.getAllCalendars();
    const primary = calendars.find((c) => c.primary === true);
    const email = (primary?.id as string) ?? "";

    const rootRef = GoogleCalendarRoot.ref("root");

    await engine.store(EntityInput.create(rootRef, { email }));

    return SyncPlan.create([
      Step.forRoot(rootRef).loadCollection("calendars"),
      Step.forRoot(rootRef).loadCollection("events"),
      Step.forRoot(rootRef).loadCollection("attendees"),
    ]);
  },
});
