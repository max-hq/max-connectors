/**
 * Smoke tests for connector-aws-perf-insights.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * ID generation, and module exports.
 */

import { describe, test, expect } from "bun:test";
import {
  AWSPIMetricResult,
  AWSPITopSQL,
  AWSPITopWaitEvent,
  AWSPIAnalysisReport,
  AWSPerfInsightsRoot,
} from "../entities.js";
import { AWSPerfInsightsSchema } from "../schema.js";
import { stableId } from "../id-utils.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("AWSPerfInsightsRoot has expected collections", () => {
    expect(AWSPerfInsightsRoot.name).toBe("AWSPerfInsightsRoot");
    const fieldNames = Object.keys(AWSPerfInsightsRoot.fields);
    expect(fieldNames).toContain("region");
    expect(fieldNames).toContain("dbResourceId");
    expect(fieldNames).toContain("metrics");
    expect(fieldNames).toContain("topSQL");
    expect(fieldNames).toContain("topWaitEvents");
    expect(fieldNames).toContain("analysisReports");
  });

  test("AWSPIMetricResult has expected fields", () => {
    expect(AWSPIMetricResult.name).toBe("AWSPIMetricResult");
    const fieldNames = Object.keys(AWSPIMetricResult.fields);
    expect(fieldNames).toContain("timestamp");
    expect(fieldNames).toContain("metricName");
    expect(fieldNames).toContain("value");
  });

  test("AWSPITopSQL has expected fields", () => {
    expect(AWSPITopSQL.name).toBe("AWSPITopSQL");
    const fieldNames = Object.keys(AWSPITopSQL.fields);
    expect(fieldNames).toContain("sqlId");
    expect(fieldNames).toContain("sqlText");
    expect(fieldNames).toContain("dbLoad");
  });

  test("AWSPIAnalysisReport has expected fields", () => {
    expect(AWSPIAnalysisReport.name).toBe("AWSPIAnalysisReport");
    const fieldNames = Object.keys(AWSPIAnalysisReport.fields);
    expect(fieldNames).toContain("reportId");
    expect(fieldNames).toContain("status");
    expect(fieldNames).toContain("insightsSummary");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(AWSPerfInsightsSchema.namespace).toBe("aws-perf-insights");
  });

  test("contains all entities", () => {
    const entityNames = AWSPerfInsightsSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("AWSPIMetricResult");
    expect(entityNames).toContain("AWSPITopSQL");
    expect(entityNames).toContain("AWSPITopWaitEvent");
    expect(entityNames).toContain("AWSPIAnalysisReport");
    expect(entityNames).toContain("AWSPerfInsightsRoot");
  });

  test("root entity is AWSPerfInsightsRoot", () => {
    const rootNames = AWSPerfInsightsSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["AWSPerfInsightsRoot"]);
  });
});

// ============================================================================
// ID utilities
// ============================================================================

describe("stableId", () => {
  test("is deterministic", () => {
    const a = stableId("metric", "db.load.avg", "2024-01-01T00:00:00Z");
    const b = stableId("metric", "db.load.avg", "2024-01-01T00:00:00Z");
    expect(a).toBe(b);
  });

  test("produces different IDs for different inputs", () => {
    const a = stableId("metric", "db.load.avg");
    const b = stableId("topsql", "db.load.avg");
    expect(a).not.toBe(b);
  });
});

// ============================================================================
// Module export
// ============================================================================

describe("module", () => {
  test("default export is the ConnectorModule", async () => {
    const mod = await import("../index.js");
    expect(mod.default).toBeDefined();
    expect(mod.default.def).toBeDefined();
    expect(mod.default.def.name).toBe("aws-perf-insights");
  });
});
