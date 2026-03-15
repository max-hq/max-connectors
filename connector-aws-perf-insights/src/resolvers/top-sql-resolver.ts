/**
 * AWSPITopSQL Resolver — Autoload fallback for top SQL queries.
 *
 * In practice, fields are populated eagerly by TopSQLLoader during
 * collection loading. This entity loader serves as an autoload fallback
 * that returns an empty EntityInput since the data is already present.
 */

import { Loader, Resolver, EntityInput } from "@max/core";
import { AWSPITopSQL } from "../entities.js";
import { AWSPerfInsightsContext } from "../context.js";

// ============================================================================
// Loader
// ============================================================================

export const TopSQLBasicLoader = Loader.entity({
  name: "aws-perf-insights:top-sql:basic",
  context: AWSPerfInsightsContext,
  entity: AWSPITopSQL,
  strategy: "autoload",

  async load(ref, _env) {
    return EntityInput.create(ref, {});
  },
});

// ============================================================================
// Resolver
// ============================================================================

export const AWSPITopSQLResolver = Resolver.for(AWSPITopSQL, {
  sqlId: TopSQLBasicLoader.field("sqlId"),
  sqlText: TopSQLBasicLoader.field("sqlText"),
  dbLoad: TopSQLBasicLoader.field("dbLoad"),
  dbLoadCpu: TopSQLBasicLoader.field("dbLoadCpu"),
  dbLoadIo: TopSQLBasicLoader.field("dbLoadIo"),
  dbLoadWait: TopSQLBasicLoader.field("dbLoadWait"),
  periodStart: TopSQLBasicLoader.field("periodStart"),
  periodEnd: TopSQLBasicLoader.field("periodEnd"),
});
