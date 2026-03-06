/**
 * CostExplorerClient — Wraps @aws-sdk/client-cost-explorer plus complementary
 * AWS SDK clients (Budgets, Cost Optimization Hub, Organizations).
 *
 * Lifecycle: start() resolves credentials and creates all SDK clients.
 */

import {
  CostExplorerClient as AWSCEClient,
  GetCostAndUsageCommand,
  GetCostForecastCommand,
  GetAnomaliesCommand,
  GetRightsizingRecommendationCommand,
  GetReservationUtilizationCommand,
  GetSavingsPlansUtilizationCommand,
  GetReservationCoverageCommand,
  GetSavingsPlansCoverageCommand,
  type GetCostAndUsageCommandOutput,
  type GetCostForecastCommandOutput,
  type GetAnomaliesCommandOutput,
  type GetRightsizingRecommendationCommandOutput,
  type GetReservationUtilizationCommandOutput,
  type GetSavingsPlansUtilizationCommandOutput,
  type GetReservationCoverageCommandOutput,
  type GetSavingsPlansCoverageCommandOutput,
  type Granularity,
  type Metric,
} from "@aws-sdk/client-cost-explorer";
import {
  BudgetsClient,
  DescribeBudgetsCommand,
  type DescribeBudgetsCommandOutput,
} from "@aws-sdk/client-budgets";
import {
  CostOptimizationHubClient,
  ListRecommendationsCommand,
  type ListRecommendationsCommandOutput,
} from "@aws-sdk/client-cost-optimization-hub";
import {
  OrganizationsClient,
  ListAccountsCommand,
  type ListAccountsCommandOutput,
} from "@aws-sdk/client-organizations";
import type { CredentialHandle } from "@max/connector";
import { ErrNotStarted, ErrApiError } from "./errors.js";

/** Extract a useful message from AWS SDK errors (which carry name/Code/$metadata). */
function describeError(err: unknown): string {
  if (err instanceof Error) {
    const name = (err as any).name ?? "";
    const code = (err as any).Code ?? (err as any).$metadata?.httpStatusCode ?? "";
    const parts = [name, code, err.message].filter(Boolean);
    return parts.join(" — ");
  }
  return String(err);
}

// ============================================================================
// Types
// ============================================================================

export interface TimePeriod {
  Start: string; // YYYY-MM-DD
  End: string;   // YYYY-MM-DD
}

export interface CostAndUsageResult {
  resultsByTime: GetCostAndUsageCommandOutput["ResultsByTime"];
  nextPageToken: string | undefined;
}

export interface CostForecastResult {
  forecastResultsByTime: GetCostForecastCommandOutput["ForecastResultsByTime"];
  total: GetCostForecastCommandOutput["Total"];
}

export interface AnomaliesResult {
  anomalies: GetAnomaliesCommandOutput["Anomalies"];
  nextPageToken: string | undefined;
}

export interface RightsizingResult {
  recommendations: GetRightsizingRecommendationCommandOutput["RightsizingRecommendations"];
  nextPageToken: string | undefined;
}

export interface ReservationUtilizationResult {
  utilizationsByTime: GetReservationUtilizationCommandOutput["UtilizationsByTime"];
  nextPageToken: string | undefined;
}

export interface SavingsPlansUtilizationResult {
  utilizationsByTime: GetSavingsPlansUtilizationCommandOutput["SavingsPlansUtilizationsByTime"];
}

export interface ReservationCoverageResult {
  coveragesByTime: GetReservationCoverageCommandOutput["CoveragesByTime"];
  nextPageToken: string | undefined;
}

export interface SavingsPlansCoverageResult {
  coveragesByTime: GetSavingsPlansCoverageCommandOutput["SavingsPlansCoverages"];
  nextToken: string | undefined;
}

export interface BudgetsResult {
  budgets: DescribeBudgetsCommandOutput["Budgets"];
  nextToken: string | undefined;
}

export interface OptimizationRecsResult {
  items: ListRecommendationsCommandOutput["items"];
  nextToken: string | undefined;
}

export interface AccountsResult {
  accounts: ListAccountsCommandOutput["Accounts"];
  nextToken: string | undefined;
}

// ============================================================================
// Date helpers
// ============================================================================

/** Returns { Start, End } spanning the last 12 months. */
export function getMonthlyRange(): TimePeriod {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), 1);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 12);
  return {
    Start: formatDate(start),
    End: formatDate(end),
  };
}

/** Returns { Start, End } spanning the last 30 days. */
export function getDailyRange(): TimePeriod {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    Start: formatDate(start),
    End: formatDate(end),
  };
}

/** Returns { Start, End } for 12 months into the future (for forecasts). */
export function getForecastRange(): TimePeriod {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const end = new Date(start);
  end.setMonth(end.getMonth() + 12);
  return {
    Start: formatDate(start),
    End: formatDate(end),
  };
}

/** Returns { Start, End } spanning the last 90 days (for anomalies). */
export function getAnomalyRange(): { StartDate: string; EndDate: string } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(end);
  start.setDate(start.getDate() - 90);
  return {
    StartDate: formatDate(start),
    EndDate: formatDate(end),
  };
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ============================================================================
// Cost Explorer Client
// ============================================================================

const METRICS = ["BlendedCost", "UnblendedCost", "AmortizedCost", "UsageQuantity"];

export class CostExplorerClient {
  private ceClient: AWSCEClient | null = null;
  private budgetsClient: BudgetsClient | null = null;
  private cohClient: CostOptimizationHubClient | null = null;
  private orgsClient: OrganizationsClient | null = null;
  private _accountId: string | null = null;

  constructor(
    private readonly accessKeyIdHandle: CredentialHandle<string>,
    private readonly secretAccessKeyHandle: CredentialHandle<string>,
    readonly region: string,
  ) {}

  get accountId(): string {
    return this._accountId ?? "";
  }

  async start(): Promise<void> {
    const accessKeyId = await this.accessKeyIdHandle.get();
    const secretAccessKey = await this.secretAccessKeyHandle.get();
    const credentials = { accessKeyId, secretAccessKey };

    this.ceClient = new AWSCEClient({ region: this.region, credentials });
    this.budgetsClient = new BudgetsClient({ region: this.region, credentials });
    this.cohClient = new CostOptimizationHubClient({ region: "us-east-1", credentials });
    this.orgsClient = new OrganizationsClient({ region: "us-east-1", credentials });

    // Resolve the caller's account ID for the Budgets API.
    // Use a cheap 1-day GetCostAndUsage grouped by LINKED_ACCOUNT to extract it.
    try {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(start.getDate() - 1);
      const output = await this.ceClient.send(
        new GetCostAndUsageCommand({
          TimePeriod: { Start: formatDate(start), End: formatDate(end) },
          Granularity: "DAILY",
          Metrics: ["BlendedCost"],
          GroupBy: [{ Type: "DIMENSION", Key: "LINKED_ACCOUNT" }],
        }),
      );
      const firstKey = output.ResultsByTime?.[0]?.Groups?.[0]?.Keys?.[0];
      this._accountId = firstKey ?? "";
    } catch {
      // If account ID resolution fails, budgets loader will handle gracefully
    }
  }

  private get sdk(): AWSCEClient {
    if (!this.ceClient) throw ErrNotStarted.create({});
    return this.ceClient;
  }

  private get budgetsSdk(): BudgetsClient {
    if (!this.budgetsClient) throw ErrNotStarted.create({});
    return this.budgetsClient;
  }

  private get cohSdk(): CostOptimizationHubClient {
    if (!this.cohClient) throw ErrNotStarted.create({});
    return this.cohClient;
  }

  private get orgsSdk(): OrganizationsClient {
    if (!this.orgsClient) throw ErrNotStarted.create({});
    return this.orgsClient;
  }

  // --------------------------------------------------------------------------
  // GetCostAndUsage (grouped by SERVICE — existing)
  // --------------------------------------------------------------------------

  async getCostAndUsage(
    timePeriod: TimePeriod,
    granularity: Granularity,
    nextPageToken?: string,
  ): Promise<CostAndUsageResult> {
    try {
      const output = await this.sdk.send(
        new GetCostAndUsageCommand({
          TimePeriod: timePeriod,
          Granularity: granularity,
          Metrics: METRICS,
          GroupBy: [{ Type: "DIMENSION", Key: "SERVICE" }],
          NextPageToken: nextPageToken,
        }),
      );
      return {
        resultsByTime: output.ResultsByTime,
        nextPageToken: output.NextPageToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetCostAndUsage (grouped by arbitrary dimension)
  // --------------------------------------------------------------------------

  async getCostAndUsageByDimension(
    timePeriod: TimePeriod,
    granularity: Granularity,
    dimensionKey: string,
    nextPageToken?: string,
  ): Promise<CostAndUsageResult> {
    try {
      const output = await this.sdk.send(
        new GetCostAndUsageCommand({
          TimePeriod: timePeriod,
          Granularity: granularity,
          Metrics: METRICS,
          GroupBy: [{ Type: "DIMENSION", Key: dimensionKey }],
          NextPageToken: nextPageToken,
        }),
      );
      return {
        resultsByTime: output.ResultsByTime,
        nextPageToken: output.NextPageToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetCostForecast
  // --------------------------------------------------------------------------

  async getCostForecast(
    metric: Metric,
    granularity: Granularity,
  ): Promise<CostForecastResult> {
    try {
      const range = getForecastRange();
      const output = await this.sdk.send(
        new GetCostForecastCommand({
          TimePeriod: range,
          Metric: metric,
          Granularity: granularity,
        }),
      );
      return {
        forecastResultsByTime: output.ForecastResultsByTime,
        total: output.Total,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetAnomalies
  // --------------------------------------------------------------------------

  async getAnomalies(nextPageToken?: string): Promise<AnomaliesResult> {
    try {
      const dateInterval = getAnomalyRange();
      const output = await this.sdk.send(
        new GetAnomaliesCommand({
          DateInterval: dateInterval,
          NextPageToken: nextPageToken,
        }),
      );
      return {
        anomalies: output.Anomalies,
        nextPageToken: output.NextPageToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetRightsizingRecommendation
  // --------------------------------------------------------------------------

  async getRightsizingRecommendations(
    nextPageToken?: string,
  ): Promise<RightsizingResult> {
    try {
      const output = await this.sdk.send(
        new GetRightsizingRecommendationCommand({
          Service: "AmazonEC2",
          NextPageToken: nextPageToken,
        }),
      );
      return {
        recommendations: output.RightsizingRecommendations,
        nextPageToken: output.NextPageToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetReservationUtilization
  // --------------------------------------------------------------------------

  async getReservationUtilization(
    timePeriod: TimePeriod,
    granularity: Granularity,
    nextPageToken?: string,
  ): Promise<ReservationUtilizationResult> {
    try {
      const output = await this.sdk.send(
        new GetReservationUtilizationCommand({
          TimePeriod: timePeriod,
          Granularity: granularity,
          NextPageToken: nextPageToken,
        }),
      );
      return {
        utilizationsByTime: output.UtilizationsByTime,
        nextPageToken: output.NextPageToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetSavingsPlansUtilization (no pagination)
  // --------------------------------------------------------------------------

  async getSavingsPlansUtilization(
    timePeriod: TimePeriod,
    granularity: Granularity,
  ): Promise<SavingsPlansUtilizationResult> {
    try {
      const output = await this.sdk.send(
        new GetSavingsPlansUtilizationCommand({
          TimePeriod: timePeriod,
          Granularity: granularity,
        }),
      );
      return {
        utilizationsByTime: output.SavingsPlansUtilizationsByTime,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetReservationCoverage
  // --------------------------------------------------------------------------

  async getReservationCoverage(
    timePeriod: TimePeriod,
    granularity: Granularity,
    nextPageToken?: string,
  ): Promise<ReservationCoverageResult> {
    try {
      const output = await this.sdk.send(
        new GetReservationCoverageCommand({
          TimePeriod: timePeriod,
          Granularity: granularity,
          NextPageToken: nextPageToken,
        }),
      );
      return {
        coveragesByTime: output.CoveragesByTime,
        nextPageToken: output.NextPageToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // GetSavingsPlansCoverage (uses NextToken, not NextPageToken)
  // --------------------------------------------------------------------------

  async getSavingsPlansCoverage(
    timePeriod: TimePeriod,
    granularity: Granularity,
    nextToken?: string,
  ): Promise<SavingsPlansCoverageResult> {
    try {
      const output = await this.sdk.send(
        new GetSavingsPlansCoverageCommand({
          TimePeriod: timePeriod,
          Granularity: granularity,
          NextToken: nextToken,
        }),
      );
      return {
        coveragesByTime: output.SavingsPlansCoverages,
        nextToken: output.NextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // DescribeBudgets (Budgets API)
  // --------------------------------------------------------------------------

  async getBudgets(accountId: string, nextToken?: string): Promise<BudgetsResult> {
    try {
      const output = await this.budgetsSdk.send(
        new DescribeBudgetsCommand({
          AccountId: accountId,
          NextToken: nextToken,
        }),
      );
      return {
        budgets: output.Budgets,
        nextToken: output.NextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // ListRecommendations (Cost Optimization Hub)
  // --------------------------------------------------------------------------

  async getOptimizationRecs(nextToken?: string): Promise<OptimizationRecsResult> {
    try {
      const output = await this.cohSdk.send(
        new ListRecommendationsCommand({
          nextToken,
        }),
      );
      return {
        items: output.items,
        nextToken: output.nextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // ListAccounts (Organizations)
  // --------------------------------------------------------------------------

  async getAccounts(nextToken?: string): Promise<AccountsResult> {
    try {
      const output = await this.orgsSdk.send(
        new ListAccountsCommand({
          NextToken: nextToken,
        }),
      );
      return {
        accounts: output.Accounts,
        nextToken: output.NextToken,
      };
    } catch (err) {
      throw ErrApiError.create({
        reason: describeError(err),
      });
    }
  }

  // --------------------------------------------------------------------------
  // Health check
  // --------------------------------------------------------------------------

  async health(): Promise<{ ok: boolean; error?: string }> {
    try {
      const now = new Date();
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = new Date(end);
      start.setDate(start.getDate() - 1);

      await this.sdk.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: formatDate(start),
            End: formatDate(end),
          },
          Granularity: "DAILY",
          Metrics: ["BlendedCost"],
        }),
      );
      return { ok: true };
    } catch (err) {
      return { ok: false, error: describeError(err) };
    }
  }
}
