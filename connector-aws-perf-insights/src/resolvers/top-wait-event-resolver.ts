/**
 * AWSPITopWaitEvent Resolver — Autoload fallback for top wait events.
 *
 * In practice, fields are populated eagerly by TopWaitEventsLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSPITopWaitEvent } from "../entities.js";
import { AWSPerfInsightsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const TopWaitEventBasicLoader = Loader.entity({
  name: "aws-perf-insights:top-wait-event:basic",
  context: AWSPerfInsightsContext,
  entity: AWSPITopWaitEvent,
  strategy: "autoload",

  async load(ref, _env) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSPITopWaitEventResolver = Resolver.for(AWSPITopWaitEvent, {
  waitEventName: TopWaitEventBasicLoader.field("waitEventName"),
  waitEventType: TopWaitEventBasicLoader.field("waitEventType"),
  dbLoad: TopWaitEventBasicLoader.field("dbLoad"),
  periodStart: TopWaitEventBasicLoader.field("periodStart"),
  periodEnd: TopWaitEventBasicLoader.field("periodEnd"),
});
