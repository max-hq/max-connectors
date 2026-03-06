# Datadog Metrics

Syncs metric definitions from the Datadog catalog and their time-series data points for the last 30 days.

## What It Syncs

| Entity | Description |
|--------|-------------|
| Metric Definitions | Metric metadata from the Datadog catalog (name, type, tags, timestamps) |
| Metric Timeseries | Individual data points for each metric matching your configured patterns |

## Prerequisites

- A Datadog account
- A Datadog **API Key** and **Application Key** with read access to metrics

## Setup

1. In the Datadog console, go to **Organization Settings > API Keys** and create (or copy) an API Key.
2. Under **Organization Settings > Application Keys**, create (or copy) an Application Key.
3. During onboarding you will be prompted for:
   - **Site** — your Datadog site (default: `datadoghq.com`). Use `datadoghq.eu` for the EU region, or the appropriate site for your account.
   - **Metric Patterns** — comma-separated prefix patterns to control which metrics get timeseries data (default: `aws.*,system.*`). Use `*` as a suffix wildcard (e.g., `aws.ec2.*`) or specify exact metric names.
   - **Datadog API Key**
   - **Datadog Application Key**
4. The connector validates your credentials by making a minimal metric catalog request.

## Data Coverage

| Data | Window |
|------|--------|
| Metric Definitions | All metrics in the catalog (no time filter) |
| Metric Timeseries | Last 30 days |

- The **full metric catalog** is always synced regardless of the pattern filter.
- **Timeseries data** is only fetched for metrics whose names match the configured patterns.

## Synced Fields

### Metric Definition

| Field | Type | Description |
|-------|------|-------------|
| metricName | string | Metric identifier (e.g., `aws.ec2.cpuutilization`) |
| metricType | string | Type of metric (gauge, count, rate, etc.) |
| tags | string | Comma-separated list of associated tags |
| includePercentiles | string | Whether percentile aggregation is enabled |
| createdAt | string | When the metric was first seen (ISO 8601) |
| modifiedAt | string | Last modification time (ISO 8601) |

### Metric Timeseries

| Field | Type | Description |
|-------|------|-------------|
| metricName | string | Parent metric identifier |
| timestamp | string | Data point timestamp (ISO 8601) |
| value | number | Metric value at that point in time |

## Limitations

- Timeseries queries use the `avg` aggregation across all tags — no per-tag or per-host breakdown.
- Pattern matching is **prefix-only** using a trailing `*` wildcard (e.g., `aws.*`). More complex glob or regex patterns are not supported.
- The 30-day timeseries window is fixed and cannot be changed.
- Timeseries queries run sequentially (one metric at a time), so a large number of matching metrics increases sync time.
- Null data points are excluded from the synced timeseries.
