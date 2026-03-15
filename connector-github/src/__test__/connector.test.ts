/**
 * Smoke tests for connector-github.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * and module exports.
 */

import { describe, test, expect } from "bun:test";
import {
  GitHubUser,
  GitHubIssue,
  GitHubRepository,
} from "../entities.js";
import { GitHubSchema } from "../schema.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("GitHubRepository has expected fields and collections", () => {
    expect(GitHubRepository.name).toBe("GitHubRepository");
    const fieldNames = Object.keys(GitHubRepository.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("description");
    expect(fieldNames).toContain("url");
    expect(fieldNames).toContain("issues");
    expect(fieldNames).toContain("issueAuthors");
  });

  test("GitHubIssue has expected fields", () => {
    expect(GitHubIssue.name).toBe("GitHubIssue");
    const fieldNames = Object.keys(GitHubIssue.fields);
    expect(fieldNames).toContain("number");
    expect(fieldNames).toContain("title");
    expect(fieldNames).toContain("body");
    expect(fieldNames).toContain("state");
    expect(fieldNames).toContain("labels");
    expect(fieldNames).toContain("author");
  });

  test("GitHubUser has expected fields", () => {
    expect(GitHubUser.name).toBe("GitHubUser");
    const fieldNames = Object.keys(GitHubUser.fields);
    expect(fieldNames).toContain("login");
    expect(fieldNames).toContain("avatarUrl");
    expect(fieldNames).toContain("url");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(GitHubSchema.namespace).toBe("github");
  });

  test("contains all entities", () => {
    const entityNames = GitHubSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("GitHubRepository");
    expect(entityNames).toContain("GitHubIssue");
    expect(entityNames).toContain("GitHubUser");
  });

  test("root entity is GitHubRepository", () => {
    const rootNames = GitHubSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["GitHubRepository"]);
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
    expect(mod.default.def.name).toBe("github");
  });
});
