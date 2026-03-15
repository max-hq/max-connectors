/**
 * Smoke tests for connector-google-workspace.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * and module exports.
 */

import { describe, test, expect } from "bun:test";
import {
  OrgUnit,
  User,
  GroupMember,
  Group,
  Directory,
} from "../entities.js";
import { GoogleWorkspaceSchema } from "../schema.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("Directory has expected collections", () => {
    expect(Directory.name).toBe("Directory");
    const fieldNames = Object.keys(Directory.fields);
    expect(fieldNames).toContain("domain");
    expect(fieldNames).toContain("customerId");
    expect(fieldNames).toContain("users");
    expect(fieldNames).toContain("groups");
    expect(fieldNames).toContain("orgUnits");
  });

  test("User has expected fields", () => {
    expect(User.name).toBe("User");
    const fieldNames = Object.keys(User.fields);
    expect(fieldNames).toContain("email");
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("isAdmin");
    expect(fieldNames).toContain("suspended");
    expect(fieldNames).toContain("orgUnitPath");
  });

  test("Group has members collection", () => {
    expect(Group.name).toBe("Group");
    const fieldNames = Object.keys(Group.fields);
    expect(fieldNames).toContain("email");
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("directMembersCount");
    expect(fieldNames).toContain("members");
  });

  test("GroupMember has expected fields", () => {
    expect(GroupMember.name).toBe("GroupMember");
    const fieldNames = Object.keys(GroupMember.fields);
    expect(fieldNames).toContain("email");
    expect(fieldNames).toContain("role");
    expect(fieldNames).toContain("type");
    expect(fieldNames).toContain("status");
  });

  test("OrgUnit has expected fields", () => {
    expect(OrgUnit.name).toBe("OrgUnit");
    const fieldNames = Object.keys(OrgUnit.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("orgUnitPath");
    expect(fieldNames).toContain("parentOrgUnitPath");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(GoogleWorkspaceSchema.namespace).toBe("google-workspace");
  });

  test("contains all entities", () => {
    const entityNames = GoogleWorkspaceSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("Directory");
    expect(entityNames).toContain("User");
    expect(entityNames).toContain("Group");
    expect(entityNames).toContain("GroupMember");
    expect(entityNames).toContain("OrgUnit");
  });

  test("root entity is Directory", () => {
    const rootNames = GoogleWorkspaceSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["Directory"]);
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
    expect(mod.default.def.name).toBe("google-workspace");
  });
});
