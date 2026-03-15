/**
 * Smoke tests for connector-datadog-incidents.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * ID generation, and module exports.
 */

import { describe, test, expect } from "bun:test";
import {
  DatadogIncident,
  DatadogIncidentTodo,
  DatadogIncidentsRoot,
} from "../entities.js";
import { DatadogIncidentsSchema } from "../schema.js";
import { stableId } from "../id-utils.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("DatadogIncident has expected fields and todos collection", () => {
    expect(DatadogIncident.name).toBe("DatadogIncident");
    const fieldNames = Object.keys(DatadogIncident.fields);
    expect(fieldNames).toContain("incidentId");
    expect(fieldNames).toContain("title");
    expect(fieldNames).toContain("severity");
    expect(fieldNames).toContain("state");
    expect(fieldNames).toContain("timeToDetect");
    expect(fieldNames).toContain("timeToRepair");
    expect(fieldNames).toContain("timeToResolve");
    expect(fieldNames).toContain("todos");
  });

  test("DatadogIncidentTodo has expected fields", () => {
    expect(DatadogIncidentTodo.name).toBe("DatadogIncidentTodo");
    const fieldNames = Object.keys(DatadogIncidentTodo.fields);
    expect(fieldNames).toContain("todoId");
    expect(fieldNames).toContain("incident");
    expect(fieldNames).toContain("content");
    expect(fieldNames).toContain("completed");
    expect(fieldNames).toContain("dueDate");
  });

  test("DatadogIncidentsRoot has incidents collection", () => {
    expect(DatadogIncidentsRoot.name).toBe("DatadogIncidentsRoot");
    const fieldNames = Object.keys(DatadogIncidentsRoot.fields);
    expect(fieldNames).toContain("site");
    expect(fieldNames).toContain("incidents");
    expect(fieldNames).not.toContain("todos");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(DatadogIncidentsSchema.namespace).toBe("datadog-incidents");
  });

  test("contains all entities", () => {
    const entityNames = DatadogIncidentsSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("DatadogIncident");
    expect(entityNames).toContain("DatadogIncidentTodo");
    expect(entityNames).toContain("DatadogIncidentsRoot");
  });

  test("root entity is DatadogIncidentsRoot", () => {
    const rootNames = DatadogIncidentsSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["DatadogIncidentsRoot"]);
  });
});

// ============================================================================
// ID utilities
// ============================================================================

describe("stableId", () => {
  test("is deterministic", () => {
    const a = stableId("incident", "abc-123");
    const b = stableId("incident", "abc-123");
    expect(a).toBe(b);
  });

  test("produces different IDs for different inputs", () => {
    const a = stableId("incident", "abc-123");
    const b = stableId("todo", "abc-123");
    expect(a).not.toBe(b);
  });

  test("returns a 16-char hex string", () => {
    const id = stableId("test", "value");
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
    expect(mod.default.def.name).toBe("datadog-incidents");
  });
});
