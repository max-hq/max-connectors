/**
 * Smoke tests for connector-linear.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * and module exports.
 */

import { describe, test, expect } from "bun:test";
import {
  LinearUser,
  LinearIssue,
  LinearProject,
  LinearTeam,
  LinearOrganization,
} from "../entities.js";
import { LinearSchema } from "../schema.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("LinearOrganization has expected collections", () => {
    expect(LinearOrganization.name).toBe("LinearOrganization");
    const fieldNames = Object.keys(LinearOrganization.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("urlKey");
    expect(fieldNames).toContain("teams");
    expect(fieldNames).toContain("users");
    expect(fieldNames).toContain("projects");
  });

  test("LinearTeam has issues and members collections", () => {
    expect(LinearTeam.name).toBe("LinearTeam");
    const fieldNames = Object.keys(LinearTeam.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("key");
    expect(fieldNames).toContain("issues");
    expect(fieldNames).toContain("members");
  });

  test("LinearIssue has expected fields and refs", () => {
    expect(LinearIssue.name).toBe("LinearIssue");
    const fieldNames = Object.keys(LinearIssue.fields);
    expect(fieldNames).toContain("identifier");
    expect(fieldNames).toContain("title");
    expect(fieldNames).toContain("priority");
    expect(fieldNames).toContain("state");
    expect(fieldNames).toContain("assignee");
    expect(fieldNames).toContain("project");
  });

  test("LinearUser has expected fields", () => {
    expect(LinearUser.name).toBe("LinearUser");
    const fieldNames = Object.keys(LinearUser.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("email");
    expect(fieldNames).toContain("active");
  });

  test("LinearProject has issues collection", () => {
    expect(LinearProject.name).toBe("LinearProject");
    const fieldNames = Object.keys(LinearProject.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("state");
    expect(fieldNames).toContain("progress");
    expect(fieldNames).toContain("issues");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(LinearSchema.namespace).toBe("linear");
  });

  test("contains all entities", () => {
    const entityNames = LinearSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("LinearOrganization");
    expect(entityNames).toContain("LinearTeam");
    expect(entityNames).toContain("LinearUser");
    expect(entityNames).toContain("LinearProject");
    expect(entityNames).toContain("LinearIssue");
  });

  test("root entity is LinearOrganization", () => {
    const rootNames = LinearSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["LinearOrganization"]);
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
    expect(mod.default.def.name).toBe("linear");
  });
});
