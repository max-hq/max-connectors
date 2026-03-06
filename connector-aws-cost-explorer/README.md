# AWS Cost Explorer

Syncs AWS cost data, forecasts, anomalies, and optimization recommendations into a unified view of your cloud spend.

## What It Syncs

| Entity | Description |
|--------|-------------|
| Cost Records | Monthly (12 months) and daily (30 days) cost data grouped by service |
| Service Summaries | Aggregated cost totals per AWS service over 12 months |
| Cost by Dimension | Cost data sliced by account, region, instance type, usage type, and purchase type |
| Cost Forecasts | Predicted spend for the next 12 months (blended, unblended, and amortized) |
| Cost Anomalies | Detected cost spikes with root cause analysis |
| Rightsizing Recommendations | EC2 instance right-sizing suggestions with estimated savings |
| Optimization Recommendations | Unified recommendations from AWS Cost Optimization Hub |
| Reserved Instance Utilization | RI efficiency metrics (purchased vs. used hours) |
| Reserved Instance Coverage | Percentage of usage covered by Reserved Instances |
| Savings Plan Utilization | Savings Plan commitment vs. actual usage |
| Savings Plan Coverage | Percentage of spend covered by Savings Plans |
| Budgets | Budget definitions with actual and forecasted spend |
| Accounts | AWS Organization account metadata |

## Prerequisites

- An AWS account with Cost Explorer enabled
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
        "ce:GetCostAndUsage",
        "ce:GetCostForecast",
        "ce:GetRightsizingRecommendation",
        "ce:GetAnomalies",
        "ce:GetReservationUtilization",
        "ce:GetReservationCoverage",
        "ce:GetSavingsPlansUtilization",
        "ce:GetSavingsPlansCoverage",
        "budgets:ViewBudget",
        "cost-optimization-hub:ListRecommendations",
        "cost-optimization-hub:GetRecommendation",
        "organizations:ListAccounts"
      ],
      "Resource": "*"
    }
  ]
}
```

## Setup

1. Create (or choose) an IAM user with the permissions above.
2. Generate an Access Key ID and Secret Access Key for that user.
3. During onboarding you will be prompted for:
   - **Region** — the AWS region to query (default: `us-east-1`).
   - **AWS Access Key ID**
   - **AWS Secret Access Key**
4. The connector validates your credentials by making a small Cost Explorer API call. If it fails, check that the IAM policy is attached and Cost Explorer is enabled.

## Data Coverage

| Data | Window | Granularity |
|------|--------|-------------|
| Cost Records (monthly) | Last 12 months | Monthly |
| Cost Records (daily) | Last 30 days | Daily |
| Cost by Dimension | Last 12 months (monthly) + last 30 days (daily) | Monthly / Daily |
| Service Summaries | Last 12 months | Monthly (aggregated) |
| Forecasts | Next 12 months | Monthly |
| Anomalies | Last 90 days | Per-anomaly |
| RI / Savings Plan Utilization & Coverage | Last 12 months | Monthly |
| Rightsizing Recommendations | Current | N/A |
| Optimization Recommendations | Current | N/A |
| Budgets | Current | Per-budget time unit |
| Accounts | Current | N/A |

## Synced Fields

### Cost Record

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Start of the billing period (ISO 8601) |
| periodEnd | string | End of the billing period (ISO 8601) |
| granularity | string | `MONTHLY` or `DAILY` |
| service | string | AWS service name |
| blendedCost | number | Blended cost amount |
| unblendedCost | number | Unblended cost amount |
| amortizedCost | number | Amortized cost amount |
| usageQuantity | number | Usage quantity |
| currency | string | Currency code (e.g., USD) |

### Service Summary

| Field | Type | Description |
|-------|------|-------------|
| service | string | AWS service name |
| totalBlendedCost | number | Total blended cost over the period |
| totalUnblendedCost | number | Total unblended cost over the period |
| totalUsageQuantity | number | Total usage quantity |
| currency | string | Currency code |

### Cost by Dimension

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Start of the billing period |
| periodEnd | string | End of the billing period |
| granularity | string | `MONTHLY` or `DAILY` |
| dimension | string | Dimension name (e.g., LINKED_ACCOUNT, REGION) |
| dimensionValue | string | Value within that dimension |
| blendedCost | number | Blended cost amount |
| unblendedCost | number | Unblended cost amount |
| amortizedCost | number | Amortized cost amount |
| usageQuantity | number | Usage quantity |
| currency | string | Currency code |

### Cost Forecast

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Forecast period start |
| periodEnd | string | Forecast period end |
| granularity | string | Always `MONTHLY` |
| metric | string | Cost metric (BLENDED_COST, UNBLENDED_COST, or AMORTIZED_COST) |
| meanValue | number | Predicted cost |
| lowerBound | number | Lower confidence bound |
| upperBound | number | Upper confidence bound |
| currency | string | Currency code |

### Cost Anomaly

| Field | Type | Description |
|-------|------|-------------|
| anomalyId | string | Unique anomaly identifier |
| startDate | string | Anomaly start date |
| endDate | string | Anomaly end date |
| dimensionValue | string | Affected dimension |
| currentScore | number | Current anomaly score |
| maxScore | number | Maximum anomaly score |
| totalActualSpend | number | Actual spend during the anomaly |
| totalExpectedSpend | number | Expected spend |
| totalImpact | number | Dollar impact |
| totalImpactPercentage | number | Percentage impact |
| rootCauseService | string | Service causing the anomaly |
| rootCauseRegion | string | Region of the root cause |
| rootCauseAccount | string | Account of the root cause |
| feedback | string | User feedback on the anomaly |
| monitorArn | string | ARN of the anomaly monitor |

### Rightsizing Recommendation

| Field | Type | Description |
|-------|------|-------------|
| accountId | string | AWS account ID |
| rightsizingType | string | Recommendation type |
| instanceId | string | EC2 instance ID |
| instanceName | string | Instance name tag |
| instanceType | string | Current instance type |
| region | string | AWS region |
| platform | string | Operating system |
| currentMonthlyCost | number | Current monthly cost |
| estimatedMonthlySavings | number | Estimated monthly savings |
| targetInstanceType | string | Recommended instance type |
| targetMonthlyCost | number | Projected monthly cost after change |
| findingReasonCodes | string | Reason codes for the recommendation |
| currency | string | Currency code |

### Optimization Recommendation

| Field | Type | Description |
|-------|------|-------------|
| recommendationId | string | Unique recommendation ID |
| accountId | string | AWS account ID |
| region | string | AWS region |
| resourceId | string | Resource identifier |
| resourceType | string | Type of resource |
| actionType | string | Recommended action |
| source | string | Recommendation source |
| currentMonthlyCost | number | Current monthly cost |
| estimatedMonthlyCost | number | Estimated cost after optimization |
| estimatedMonthlySavings | number | Estimated monthly savings |
| estimatedSavingsPercentage | number | Savings as a percentage |
| currency | string | Currency code |

### Reserved Instance Utilization

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Period start |
| periodEnd | string | Period end |
| granularity | string | Always `MONTHLY` |
| utilizationPercentage | number | Percentage of RI hours used |
| purchasedHours | number | Total purchased RI hours |
| totalActualHours | number | Actual hours used |
| unusedHours | number | Unused RI hours |
| onDemandCostOfRIHoursUsed | number | On-demand equivalent cost |
| netRISavings | number | Net savings from RIs |
| totalPotentialRISavings | number | Total potential savings |
| totalAmortizedFee | number | Total amortized fee |
| riCostForUnusedHours | number | Cost of unused RI hours |
| realizedSavings | number | Realized savings |
| unrealizedSavings | number | Unrealized savings |

### Savings Plan Utilization

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Period start |
| periodEnd | string | Period end |
| granularity | string | Always `MONTHLY` |
| totalCommitment | number | Total committed amount |
| usedCommitment | number | Amount used |
| unusedCommitment | number | Amount unused |
| utilizationPercentage | number | Utilization as a percentage |
| netSavings | number | Net savings |
| onDemandCostEquivalent | number | On-demand equivalent cost |
| totalAmortizedCommitment | number | Total amortized commitment |

### Reserved Instance Coverage

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Period start |
| periodEnd | string | Period end |
| granularity | string | Always `MONTHLY` |
| coverageHoursPercentage | number | Percentage of hours covered by RIs |
| onDemandHours | number | Hours running on-demand |
| reservedHours | number | Hours covered by RIs |
| totalRunningHours | number | Total running hours |
| onDemandCost | number | On-demand cost for uncovered hours |

### Savings Plan Coverage

| Field | Type | Description |
|-------|------|-------------|
| periodStart | string | Period start |
| periodEnd | string | Period end |
| granularity | string | Always `MONTHLY` |
| spendCoveredBySavingsPlans | number | Spend covered by Savings Plans |
| onDemandCost | number | On-demand spend |
| totalCost | number | Total cost |
| coveragePercentage | number | Coverage as a percentage |

### Budget

| Field | Type | Description |
|-------|------|-------------|
| budgetName | string | Budget name |
| budgetType | string | Budget type |
| budgetLimit | number | Budget limit amount |
| actualSpend | number | Actual spend to date |
| forecastedSpend | number | Forecasted spend |
| timeUnit | string | Budget time unit |
| periodStart | string | Budget period start |
| periodEnd | string | Budget period end |
| currency | string | Currency code |

### Account

| Field | Type | Description |
|-------|------|-------------|
| accountId | string | AWS account ID |
| accountName | string | Account display name |
| email | string | Account email address |
| status | string | Account status |
| joinedDate | string | Date the account joined the organization |

## Limitations

- Cost history is limited to 12 months (monthly) and 30 days (daily) — older data is not available.
- Forecasts are monthly only; daily forecasts are not supported.
- Rightsizing recommendations cover EC2 instances only (no RDS, Lambda, etc.).
- Cost Optimization Hub always queries `us-east-1` regardless of the configured region (it is an AWS global service).
- Organizations API always queries `us-east-1` (also a global service).
- Budgets are scoped to the caller's account — cross-account budgets require org-level access.
- Anomaly detection covers the last 90 days only.
- No retry or rate-limit handling beyond AWS SDK defaults.
