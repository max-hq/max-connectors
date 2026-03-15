/**
 * Smoke tests for connector-datadog-metrics.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * ID generation, and module exports.
 */

import { describe, test, expect } from "bun:test";
import {
  DatadogMetric,
  DatadogMetricTimeseries,
  DatadogMetricsRoot,
} from "../entities.js";
import { DatadogMetricsSchema } from "../schema.js";
import { stableId } from "../id-utils.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("DatadogMetric has expected fields and timeseries collection", () => {
    expect(DatadogMetric.name).toBe("DatadogMetric");
    const fieldNames = Object.keys(DatadogMetric.fields);
    expect(fieldNames).toContain("metricName");
    expect(fieldNames).toContain("metricType");
    expect(fieldNames).toContain("tags");
    expect(fieldNames).toContain("includePercentiles");
    expect(fieldNames).toContain("timeseries");
  });

  test("DatadogMetricTimeseries has expected fields", () => {
    expect(DatadogMetricTimeseries.name).toBe("DatadogMetricTimeseries");
    const fieldNames = Object.keys(DatadogMetricTimeseries.fields);
    expect(fieldNames).toContain("metricName");
    expect(fieldNames).toContain("timestamp");
    expect(fieldNames).toContain("value");
  });

  test("DatadogMetricsRoot has metrics collection only", () => {
    expect(DatadogMetricsRoot.name).toBe("DatadogMetricsRoot");
    const fieldNames = Object.keys(DatadogMetricsRoot.fields);
    expect(fieldNames).toContain("site");
    expect(fieldNames).toContain("metrics");
    expect(fieldNames).not.toContain("timeseries");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(DatadogMetricsSchema.namespace).toBe("datadog-metrics");
  });

  test("contains all entities", () => {
    const entityNames = DatadogMetricsSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("DatadogMetric");
    expect(entityNames).toContain("DatadogMetricTimeseries");
    expect(entityNames).toContain("DatadogMetricsRoot");
  });

  test("root entity is DatadogMetricsRoot", () => {
    const rootNames = DatadogMetricsSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["DatadogMetricsRoot"]);
  });
});

// ============================================================================
// ID utilities
// ============================================================================

describe("stableId", () => {
  test("is deterministic", () => {
    const a = stableId("ts", "cpu.user", "2024-01-01T00:00:00Z");
    const b = stableId("ts", "cpu.user", "2024-01-01T00:00:00Z");
    expect(a).toBe(b);
  });

  test("produces different IDs for different inputs", () => {
    const a = stableId("ts", "cpu.user", "2024-01-01T00:00:00Z");
    const b = stableId("ts", "cpu.system", "2024-01-01T00:00:00Z");
    expect(a).not.toBe(b);
  });

  test("returns a 16-char hex string", () => {
    const id = stableId("ts", "test", "value");
    expect(id).toMatch(/^[0-9a-f]{16}$/);
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
    expect(mod.default.def.name).toBe("datadog-metrics");
  });
});
