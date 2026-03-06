# AWS Performance Insights

Syncs Amazon RDS Performance Insights data — time-series metrics, top SQL queries, top wait events, and analysis reports — for a single database instance.

## What It Syncs

| Entity | Description |
|--------|-------------|
| Metric Results | Time-series performance metrics at hourly (7-day) and fine-grained 5-minute (24-hour) intervals |
| Top SQL | Top 25 SQL queries ranked by database load over the last 24 hours |
| Top Wait Events | Top 25 wait events ranked by database load over the last 24 hours |
| Analysis Reports | Performance analysis reports with insights and recommendations |

## Prerequisites

- An Amazon RDS database instance with Performance Insights enabled
- The database's **DbiResourceId** (e.g., `db-XXXXXXXXXXXXXXXXXXXX`)
- An IAM user or role with the permissions listed below
- AWS Access Key ID and Secret Access Key for that user/role

### Required IAM Permissions

Attach a policy with these actions (all read-only):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "pi:GetResourceMetrics",
        "pi:DescribeDimensionKeys",
        "pi:GetDimensionKeyDetails",
        "pi:ListPerformanceAnalysisReports",
        "pi:GetPerformanceAnalysisReport",
        "pi:GetResourceMetadata"
      ],
      "Resource": "*"
    }
  ]
}
```

## Setup

1. Enable Performance Insights on the target RDS instance if it is not already enabled.
2. Locate the instance's **DbiResourceId** in the RDS console (it starts with `db-`).
3. Create (or choose) an IAM user with the permissions above.
4. Generate an Access Key ID and Secret Access Key for that user.
5. During onboarding you will be prompted for:
   - **Region** — the AWS region where your RDS instance lives (default: `us-east-1`).
   - **Database Resource ID** — the DbiResourceId from step 2.
   - **AWS Access Key ID**
   - **AWS Secret Access Key**
6. The connector validates your credentials by calling `GetResourceMetadata` to confirm Performance Insights is accessible for the specified database.

## Data Coverage

| Data | Window | Granularity |
|------|--------|-------------|
| Hourly metrics | Last 7 days | 1 hour (3 600 s) |
| Fine-grained metrics | Last 24 hours | 5 minutes (300 s) |
| Top SQL | Last 24 hours | Aggregated (top 25) |
| Top Wait Events | Last 24 hours | Aggregated (top 25) |
| Analysis Reports | All available | Per-report |

### Metrics collected

| Metric | Hourly (7 d) | Fine-grained (24 h) |
|--------|:---:|:---:|
| `db.load.avg` | Yes | Yes |
| `db.sampledload.avg` | Yes | — |
| `os.cpuUtilization.total.avg` | Yes | — |

## Synced Fields

### Metric Result

| Field | Type | Description |
|-------|------|-------------|
| timestamp | string | Data point timestamp (ISO 8601) |
| metricName | string | Metric identifier (e.g., `db.load.avg`) |
| periodSeconds | number | Aggregation period (300 or 3600) |
| value | number | Metric value |
| statisticType | string | Always `Average` |

### Top SQL

| Field | Type | Description |
|-------|------|-------------|
| sqlId | string | SQL statement digest identifier |
| sqlText | string | Full SQL query text |
| dbLoad | number | Database load caused by this query |
| dbLoadCpu | number | CPU component of load |
| dbLoadIo | number | I/O component of load |
| dbLoadWait | number | Wait component of load |
| periodStart | string | Analysis period start (ISO 8601) |
| periodEnd | string | Analysis period end (ISO 8601) |

### Top Wait Event

| Field | Type | Description |
|-------|------|-------------|
| waitEventName | string | Name of the wait event |
| waitEventType | string | Category of the wait event |
| dbLoad | number | Database load from this event |
| periodStart | string | Analysis period start (ISO 8601) |
| periodEnd | string | Analysis period end (ISO 8601) |

### Analysis Report

| Field | Type | Description |
|-------|------|-------------|
| reportId | string | Unique report identifier |
| status | string | Report status (e.g., `SUCCEEDED`, `IN_PROGRESS`) |
| startTime | string | Analysis period start (ISO 8601) |
| endTime | string | Analysis period end (ISO 8601) |
| createTime | string | When the report was created (ISO 8601) |
| insightsSummary | string | JSON array of performance insights |
| recommendationsSummary | string | JSON array of recommendations |

## Limitations

- Only Amazon RDS instances are supported (ServiceType is hardcoded to `RDS`).
- Each connector instance monitors a **single database** — add a separate connector for each database you want to track.
- Top SQL and Top Wait Events are limited to the **top 25** entries.
- Fine-grained (5-minute) metrics are only available for the last 24 hours; hourly metrics go back 7 days.
- Only `Average` statistics are collected — Min, Max, and other aggregations are not synced.
- Insights and recommendations are only available for analysis reports with status `SUCCEEDED`.
- The CPU, I/O, and wait load breakdown fields on Top SQL are not currently populated.
