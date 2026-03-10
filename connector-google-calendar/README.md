# Google Calendar Connector

Syncs calendars, events, and attendees from your Google Calendar for analytics features like Calendar Wrapped.

## Prerequisites

- A Google Cloud Platform account
- A GCP project with the Google Calendar API enabled

## Setup

### 1. Create a GCP project

Go to [console.cloud.google.com/projectcreate](https://console.cloud.google.com/projectcreate) and create a new project (or select an existing one).

### 2. Enable the Google Calendar API

Visit [console.cloud.google.com/apis/library/calendar-json.googleapis.com](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com) and click **Enable**.

### 3. Configure the OAuth consent screen

Go to [console.cloud.google.com/apis/credentials/consent](https://console.cloud.google.com/apis/credentials/consent):

- Select **External** user type (or **Internal** for Google Workspace)
- Fill in app name and your email
- Add your email as a test user (required while app is in "Testing" status)

### 4. Create OAuth credentials

Go to [console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials):

- Click **Create Credentials** > **OAuth client ID**
- Application type: **Desktop app**
- Copy the **Client ID** and **Client Secret** — you'll need them in the next step

## Connect

```bash
max connect google-calendar
```

The onboarding flow will:

1. Ask for your Client ID and Client Secret
2. Open your browser to sign in with Google and grant calendar read access
3. Validate the connection

## Sync

```bash
max sync google-calendar
```

Syncs all data: calendars, events (6 months back + 6 months forward), and attendees.

Typical sync for a personal account (~10 calendars, ~3000 events) takes under a minute and uses ~30-40 API requests.

## Query examples

### List calendars

```bash
max search google-calendar GoogleCalendar
```

```bash
max search google-calendar GoogleCalendar --fields=summary,timeZone,accessRole,primary
```

### Search events

```bash
max search google-calendar GoogleCalendarEvent --limit=10
```

```bash
max search google-calendar GoogleCalendarEvent --fields=summary,start,end,location,status
```

### Search attendees

```bash
max search google-calendar GoogleCalendarAttendee --limit=20
```

```bash
max search google-calendar GoogleCalendarAttendee --fields=email,displayName,responseStatus
```

### All fields

```bash
max search google-calendar GoogleCalendarEvent --fields=.all
```

## Entities

| Entity | Description |
|--------|-------------|
| `GoogleCalendar` | Calendar metadata (name, timezone, access role, colors) |
| `GoogleCalendarEvent` | Events with time, location, organizer, recurrence info |
| `GoogleCalendarAttendee` | Per-event attendees with response status |
| `GoogleCalendarRoot` | Root singleton linking all collections |

## Data window

- **Past:** 6 months
- **Future:** 6 months
- Recurring events are expanded into individual instances (`singleEvents=true`)

## Rate limiting

The connector throttles at 5 requests/second (Google's limit is 500 req/100s per user). On 429 or 403 rate limit responses it backs off automatically.
