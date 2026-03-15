/**
 * Smoke tests for connector-claude-code-conversations.
 *
 * Validates structural integrity: entity definitions, schema shape,
 * ID helpers, and module exports.
 */

import { describe, test, expect } from "bun:test";
import { Root, Project, Session, Message } from "../entities.js";
import { ConversationsSchema } from "../schema.js";
import { sessionId, messageId, parseSessionId, parseMessageId } from "../claude-client.js";

// ============================================================================
// Entity definitions
// ============================================================================

describe("entities", () => {
  test("Root has projects collection", () => {
    expect(Root.name).toBe("Root");
    const fieldNames = Object.keys(Root.fields);
    expect(fieldNames).toContain("projects");
  });

  test("Project has expected fields and sessions collection", () => {
    expect(Project.name).toBe("Project");
    const fieldNames = Object.keys(Project.fields);
    expect(fieldNames).toContain("name");
    expect(fieldNames).toContain("path");
    expect(fieldNames).toContain("sessions");
  });

  test("Session has expected fields and messages collection", () => {
    expect(Session.name).toBe("Session");
    const fieldNames = Object.keys(Session.fields);
    expect(fieldNames).toContain("title");
    expect(fieldNames).toContain("summary");
    expect(fieldNames).toContain("model");
    expect(fieldNames).toContain("messageCount");
    expect(fieldNames).toContain("project");
    expect(fieldNames).toContain("messages");
  });

  test("Message has expected fields", () => {
    expect(Message.name).toBe("Message");
    const fieldNames = Object.keys(Message.fields);
    expect(fieldNames).toContain("type");
    expect(fieldNames).toContain("content");
    expect(fieldNames).toContain("timestamp");
    expect(fieldNames).toContain("model");
    expect(fieldNames).toContain("session");
  });
});

// ============================================================================
// Schema
// ============================================================================

describe("schema", () => {
  test("has correct namespace", () => {
    expect(ConversationsSchema.namespace).toBe("conversations");
  });

  test("contains all entities", () => {
    const entityNames = ConversationsSchema.entities.map((e) => e.name);
    expect(entityNames).toContain("Root");
    expect(entityNames).toContain("Project");
    expect(entityNames).toContain("Session");
    expect(entityNames).toContain("Message");
  });

  test("root entity is Root", () => {
    const rootNames = ConversationsSchema.roots.map((e) => e.name);
    expect(rootNames).toEqual(["Root"]);
  });
});

// ============================================================================
// Composite ID helpers
// ============================================================================

describe("composite IDs", () => {
  test("sessionId round-trips through parseSessionId", () => {
    const id = sessionId("my-project", "abc-123");
    const parsed = parseSessionId(id);
    expect(parsed.projectDir).toBe("my-project");
    expect(parsed.sessionUuid).toBe("abc-123");
  });

  test("messageId round-trips through parseMessageId", () => {
    const id = messageId("my-project", "sess-1", "msg-2");
    const parsed = parseMessageId(id);
    expect(parsed.projectDir).toBe("my-project");
    expect(parsed.sessionUuid).toBe("sess-1");
    expect(parsed.messageUuid).toBe("msg-2");
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
    expect(mod.default.def.name).toBe("claude-code-conversations");
  });
});
