/**
 * Claude Code Conversations operations — typed API call tokens.
 *
 * Each operation wraps a single filesystem read, giving the framework
 * visibility into every request (counting, rate limiting, replay, mocking).
 */

import { Operation } from "@max/core";
import { CCConversationsContext } from "./context.js";
import type { ProjectInfo, SessionMetadata, MessageData } from "./claude-client.js";

// ============================================================================
// Operations
// ============================================================================

export const ListProjects = Operation.define({
  name: "conversations:project:list",
  context: CCConversationsContext,
  async handle(_input: {}, env): Promise<string[]> {
    return env.ctx.client.listProjects();
  },
});

export const GetProjectInfo = Operation.define({
  name: "conversations:project:get",
  context: CCConversationsContext,
  async handle(input: { projectDir: string }, env): Promise<ProjectInfo> {
    return env.ctx.client.getProjectInfo(input.projectDir);
  },
});

export const ListSessions = Operation.define({
  name: "conversations:session:list",
  context: CCConversationsContext,
  async handle(input: { projectDir: string }, env): Promise<string[]> {
    return env.ctx.client.listSessions(input.projectDir);
  },
});

export const GetSessionMetadata = Operation.define({
  name: "conversations:session:get",
  context: CCConversationsContext,
  async handle(
    input: { projectDir: string; sessionUuid: string },
    env,
  ): Promise<SessionMetadata> {
    return env.ctx.client.getSessionMetadata(input.projectDir, input.sessionUuid);
  },
});

export const ListSessionMessages = Operation.define({
  name: "conversations:message:list",
  context: CCConversationsContext,
  async handle(
    input: { projectDir: string; sessionUuid: string },
    env,
  ): Promise<MessageData[]> {
    return env.ctx.client.getSessionMessages(input.projectDir, input.sessionUuid);
  },
});

export const GetMessage = Operation.define({
  name: "conversations:message:get",
  context: CCConversationsContext,
  async handle(
    input: { projectDir: string; sessionUuid: string; messageUuid: string },
    env,
  ): Promise<MessageData | null> {
    return env.ctx.client.getMessage(input.projectDir, input.sessionUuid, input.messageUuid);
  },
});

// ============================================================================
// All operations (for ConnectorDef registration)
// ============================================================================

export const ConversationsOperations = [
  ListProjects,
  GetProjectInfo,
  ListSessions,
  GetSessionMetadata,
  ListSessionMessages,
  GetMessage,
] as const;
