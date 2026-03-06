# Datadog Incidents

Syncs incidents and their associated action items (todos) from Datadog Incident Management.

## What It Syncs

| Entity | Description |
|--------|-------------|
| Incidents | All incidents with severity, state, impact, and timeline metadata |
| Incident Todos | Action items / follow-ups attached to each incident |

## Prerequisites

- A Datadog account with Incident Management enabled
- A Datadog **API Key** and **Application Key** with read access to incidents

## Setup

1. In the Datadog console, go to **Organization Settings > API Keys** and create (or copy) an API Key.
2. Under **Organization Settings > Application Keys**, create (or copy) an Application Key.
3. During onboarding you will be prompted for:
   - **Site** — your Datadog site (default: `datadoghq.com`). Use `datadoghq.eu` for the EU region, or the appropriate site for your account.
   - **Datadog API Key**
   - **Datadog Application Key**
4. The connector validates your credentials by making a minimal incidents list request.

## Data Coverage

- **Incidents** — all incidents are synced; no date filter is applied.
- **Todos** — all todos for every incident are synced.

Each sync fetches the full set of incidents and their todos.

## Synced Fields

### Incident

| Field | Type | Description |
|-------|------|-------------|
| incidentId | string | Unique incident identifier |
| publicId | number | Human-readable incident number |
| title | string | Incident title |
| severity | string | Severity level (e.g., SEV-1, SEV-2) or `UNKNOWN` |
| state | string | Current state (e.g., active, stable, resolved) |
| customerImpacted | string | Whether customers were impacted |
| customerImpactScope | string | Description of customer impact |
| customerImpactDuration | number | Duration of customer impact (seconds) |
| created | string | When the incident was created (ISO 8601) |
| modified | string | Last modification time (ISO 8601) |
| detected | string | When the incident was detected (ISO 8601) |
| resolved | string | When the incident was resolved (ISO 8601) |
| timeToDetect | number | Time from creation to detection (seconds) |
| timeToRepair | number | Time from detection to resolution (seconds) |
| timeToResolve | number | Time from creation to resolution (seconds) |
| visibility | string | Incident visibility setting |

### Incident Todo

| Field | Type | Description |
|-------|------|-------------|
| todoId | string | Unique todo identifier |
| incidentId | string | Parent incident identifier |
| content | string | Todo description |
| completed | string | Completion status |
| dueDate | string | Due date (ISO 8601) |
| created | string | When the todo was created (ISO 8601) |
| modified | string | Last modification time (ISO 8601) |

## Limitations

- No date filtering — every sync fetches **all** incidents regardless of age.
- Todos are fetched one incident at a time (sequentially), so large incident counts increase sync time.
- The Datadog Incidents API is marked as **unstable** by Datadog and may be subject to breaking changes.
