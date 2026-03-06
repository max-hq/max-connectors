/**
 * DatadogClient — Wraps @datadog/datadog-api-client v2 IncidentsApi.
 *
 * Lifecycle: start() resolves credentials and creates the API client.
 */

import { client, v2 } from "@datadog/datadog-api-client";
import type { CredentialHandle } from "@max/connector";
import { ErrNotStarted, ErrApiError } from "./errors.js";

// ============================================================================
// Types
// ============================================================================

export interface IncidentData {
  id: string;
  attributes: {
    publicId?: number;
    title?: string;
    severity?: string;
    state?: string;
    customerImpacted?: boolean;
    customerImpactScope?: string;
    customerImpactDuration?: number;
    created?: Date;
    modified?: Date;
    detected?: Date;
    resolved?: Date;
    timeToDetect?: number;
    timeToRepair?: number;
    timeToResolve?: number;
    visibility?: string;
  };
}

export interface TodoData {
  id: string;
  attributes: {
    incidentId?: string;
    content?: string;
    completed?: string;
    dueDate?: string;
    created?: Date;
    modified?: Date;
  };
}

export interface ListIncidentsResult {
  data: IncidentData[];
  hasMore: boolean;
}

export interface ListTodosResult {
  data: TodoData[];
}

// ============================================================================
// Error helper
// ============================================================================

function describeError(err: unknown): string {
  if (err instanceof Error) {
    const name = (err as any).name ?? "";
    const code = (err as any).code ?? (err as any).httpStatusCode ?? "";
    const parts = [name, code, err.message].filter(Boolean);
    return parts.join(" — ");
  }
  return String(err);
}

// ============================================================================
// Datadog Client
// ============================================================================

export class DatadogClient {
  private incidentsApi: v2.IncidentsApi | null = null;

  constructor(
    private readonly apiKeyHandle: CredentialHandle<string>,
    private readonly appKeyHandle: CredentialHandle<string>,
    readonly site: string,
  ) {}

  async start(): Promise<void> {
    const apiKey = await this.apiKeyHandle.get();
    const appKey = await this.appKeyHandle.get();

    const configuration = client.createConfiguration({
      authMethods: {
        apiKeyAuth: apiKey,
        appKeyAuth: appKey,
      },
    });
    configuration.setServerVariables({ site: this.site });
    configuration.unstableOperations["v2.listIncidents"] = true;
    configuration.unstableOperations["v2.searchIncidents"] = true;

    this.incidentsApi = new v2.IncidentsApi(configuration);
  }

  private get api(): v2.IncidentsApi {
    if (!this.incidentsApi) throw ErrNotStarted.create({});
    return this.incidentsApi;
  }

  // --------------------------------------------------------------------------
  // List Incidents (paginated)
  // --------------------------------------------------------------------------

  async listIncidents(pageSize: number, pageOffset: number): Promise<ListIncidentsResult> {
    try {
      const response = await this.api.listIncidents({
        pageSize,
        pageOffset,
      });

      const rawData = (response.data ?? []) as any[];
      const data: IncidentData[] = rawData.map((item) => ({
        id: item.id ?? "",
        attributes: {
          publicId: item.attributes?.publicId,
          title: item.attributes?.title ?? "",
          severity: item.attributes?.severity ?? "UNKNOWN",
          state: item.attributes?.state ?? "",
          customerImpacted: item.attributes?.customerImpacted,
          customerImpactScope: item.attributes?.customerImpactScope ?? "",
          customerImpactDuration: item.attributes?.customerImpactDuration,
          created: item.attributes?.created,
          modified: item.attributes?.modified,
          detected: item.attributes?.detected,
          resolved: item.attributes?.resolved,
          timeToDetect: item.attributes?.timeToDetect,
          timeToRepair: item.attributes?.timeToRepair,
          timeToResolve: item.attributes?.timeToResolve,
          visibility: item.attributes?.visibility ?? "",
        },
      }));

      const hasMore = data.length >= pageSize;
      return { data, hasMore };
    } catch (err) {
      throw ErrApiError.create({ reason: describeError(err) });
    }
  }

  // --------------------------------------------------------------------------
  // List Incident Todos
  // --------------------------------------------------------------------------

  async listIncidentTodos(incidentId: string): Promise<ListTodosResult> {
    try {
      const response = await this.api.listIncidentTodos({ incidentId });

      const rawData = (response.data ?? []) as any[];
      const data: TodoData[] = rawData.map((item) => ({
        id: item.id ?? "",
        attributes: {
          incidentId: incidentId,
          content: item.attributes?.content ?? "",
          completed: item.attributes?.completed ?? "",
          dueDate: item.attributes?.dueDate ?? "",
          created: item.attributes?.created,
          modified: item.attributes?.modified,
        },
      }));

      return { data };
    } catch (err) {
      throw ErrApiError.create({ reason: describeError(err) });
    }
  }

  // --------------------------------------------------------------------------
  // Health check
  // --------------------------------------------------------------------------

  async health(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.listIncidents(1, 0);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: describeError(err) };
    }
  }
}
