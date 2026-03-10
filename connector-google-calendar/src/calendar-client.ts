/**
 * GoogleCalendarClient — REST wrapper for the Google Calendar API v3.
 *
 * Includes throttle-based rate limiting (5 req/s default, adaptive on 429/403),
 * in-memory token refresh, calendar cache, and attendee accumulator.
 *
 * Lifecycle: start() resolves tokens from credential handles before any API calls.
 */

import type { CredentialHandle } from "@max/connector";
import { ErrNotStarted, ErrApiError, ErrTokenRefreshFailed } from "./errors.js";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

// ============================================================================
// Throttle — simple timestamp-based rate limiting (no timers, no event loop)
//
// Google limits: 500 req/100s per user (~5 req/s).
// Default interval: 200ms (5 req/s). Adapts on 429 or rate limit headers.
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Throttle {
  private lastCall = 0;
  private intervalMs: number;

  constructor(intervalMs: number = 200) {
    this.intervalMs = intervalMs;
  }

  setInterval(ms: number): void {
    this.intervalMs = ms;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCall;
    if (elapsed < this.intervalMs) {
      await sleep(this.intervalMs - elapsed);
    }
    this.lastCall = Date.now();
  }
}

// ============================================================================
// Attendee data shape (accumulated during event loading)
// ============================================================================

export interface CollectedAttendee {
  calendarId: string;
  eventId: string;
  email: string;
  displayName: string;
  responseStatus: string;
  organizer: boolean;
  self: boolean;
  optional: boolean;
}

// ============================================================================
// Client
// ============================================================================

export class GoogleCalendarClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private readonly throttle = new Throttle(200);
  private cachedCalendars: Record<string, unknown>[] | null = null;
  private readonly collectedAttendees: CollectedAttendee[] = [];

  constructor(
    private readonly accessTokenHandle: CredentialHandle<string>,
    private readonly refreshTokenHandle: CredentialHandle<string>,
    private readonly clientId: string,
    private readonly clientSecret: string,
  ) {}

  async start(): Promise<void> {
    this.accessToken = await this.accessTokenHandle.get();
    this.refreshToken = await this.refreshTokenHandle.get();
    // Assume token may be expired — first request will refresh if needed
    this.tokenExpiresAt = 0;
  }

  // --------------------------------------------------------------------------
  // Token refresh
  // --------------------------------------------------------------------------

  private async ensureValidToken(): Promise<void> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) {
      return; // Still valid (with 60s margin)
    }
    await this.refreshAccessToken();
  }

  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw ErrTokenRefreshFailed.create({ reason: "No refresh token available" });
    }

    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      refresh_token: this.refreshToken,
      grant_type: "refresh_token",
    });

    const response = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      const text = await response.text();
      throw ErrTokenRefreshFailed.create({ reason: `${response.status}: ${text}` });
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
      refresh_token?: string;
    };

    this.accessToken = data.access_token;
    this.tokenExpiresAt = Date.now() + data.expires_in * 1000;

    // Google may rotate the refresh token
    if (data.refresh_token) {
      this.refreshToken = data.refresh_token;
    }
  }

  private get headers(): Record<string, string> {
    if (!this.accessToken) throw ErrNotStarted.create({});
    return {
      Authorization: `Bearer ${this.accessToken}`,
      Accept: "application/json",
    };
  }

  // --------------------------------------------------------------------------
  // Attendee accumulator
  // --------------------------------------------------------------------------

  collectAttendees(attendees: CollectedAttendee[]): void {
    this.collectedAttendees.push(...attendees);
  }

  getCollectedAttendees(): CollectedAttendee[] {
    return this.collectedAttendees;
  }

  // --------------------------------------------------------------------------
  // Calendar cache
  // --------------------------------------------------------------------------

  async getAllCalendars(): Promise<Record<string, unknown>[]> {
    if (this.cachedCalendars) return this.cachedCalendars;
    this.cachedCalendars = await this.listCalendars();
    return this.cachedCalendars;
  }

  // --------------------------------------------------------------------------
  // REST requests with rate limiting and retry
  // --------------------------------------------------------------------------

  async request<T>(path: string): Promise<T> {
    await this.ensureValidToken();
    await this.throttle.wait();

    const url = `${CALENDAR_API}${path}`;
    const response = await fetch(url, { headers: this.headers });

    // Adapt throttle based on rate limit headers
    const remaining = response.headers.get("X-RateLimit-Remaining");
    if (remaining !== null) {
      const rem = Number(remaining);
      if (rem > 2000) {
        this.throttle.setInterval(200);
      } else if (rem > 500) {
        this.throttle.setInterval(500);
      } else if (rem > 100) {
        this.throttle.setInterval(2000);
      } else {
        this.throttle.setInterval(5000);
      }
    }

    // 429 — respect Retry-After
    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("Retry-After") ?? "5");
      await sleep(retryAfter * 1000);
      return this.request(path);
    }

    // 403 — exponential backoff for rate limit errors
    if (response.status === 403) {
      const body = await response.json().catch(() => ({})) as Record<string, unknown>;
      const error = body.error as { errors?: Array<{ reason?: string }> } | undefined;
      const reason = error?.errors?.[0]?.reason ?? "";

      if (reason === "rateLimitExceeded" || reason === "userRateLimitExceeded") {
        return this.retryWithBackoff(path);
      }

      throw ErrApiError.create({
        status: response.status,
        statusText: response.statusText,
      });
    }

    if (!response.ok) {
      throw ErrApiError.create({
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response.json() as Promise<T>;
  }

  private async retryWithBackoff<T>(path: string, attempt: number = 0): Promise<T> {
    const maxRetries = 5;
    if (attempt >= maxRetries) {
      throw ErrApiError.create({ status: 403, statusText: "Rate limit exceeded after retries" });
    }

    const delayMs = Math.min(1000 * Math.pow(2, attempt), 32000);
    await sleep(delayMs);
    return this.request(path);
  }

  // --------------------------------------------------------------------------
  // Calendar API methods
  // --------------------------------------------------------------------------

  async listCalendars(): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = [];
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({ maxResults: "250" });
      if (pageToken) params.set("pageToken", pageToken);

      const data = await this.request<{
        items?: Record<string, unknown>[];
        nextPageToken?: string;
      }>(`/users/me/calendarList?${params}`);

      if (data.items) all.push(...data.items);
      pageToken = data.nextPageToken;
    } while (pageToken);

    return all;
  }

  async listEvents(
    calendarId: string,
    timeMin: string,
    timeMax: string,
    pageToken?: string,
  ): Promise<{ items: Record<string, unknown>[]; nextPageToken?: string }> {
    const params = new URLSearchParams({
      maxResults: "2500",
      singleEvents: "true",
      orderBy: "startTime",
      timeMin,
      timeMax,
    });
    if (pageToken) params.set("pageToken", pageToken);

    const data = await this.request<{
      items?: Record<string, unknown>[];
      nextPageToken?: string;
    }>(`/calendars/${encodeURIComponent(calendarId)}/events?${params}`);

    return {
      items: data.items ?? [],
      nextPageToken: data.nextPageToken,
    };
  }

  async getAllEventsForCalendar(
    calendarId: string,
    timeMin: string,
    timeMax: string,
  ): Promise<Record<string, unknown>[]> {
    const all: Record<string, unknown>[] = [];
    let pageToken: string | undefined;

    do {
      const result = await this.listEvents(calendarId, timeMin, timeMax, pageToken);
      all.push(...result.items);
      pageToken = result.nextPageToken;
    } while (pageToken);

    return all;
  }

  // --------------------------------------------------------------------------
  // Health
  // --------------------------------------------------------------------------

  async health(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.ensureValidToken();
      await this.request<unknown>("/users/me/calendarList?maxResults=1");
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}
