/**
 * Google Calendar onboarding flow — OAuth browser flow + validation.
 *
 * Step 1: InputStep — Collect clientId and clientSecret
 * Step 2: CustomStep — OAuth browser flow (consent URL → local callback → token exchange)
 * Step 3: ValidationStep — Verify API access
 */

import { OnboardingFlow, InputStep, CustomStep, ValidationStep } from "@max/connector";
import { GoogleAccessToken, GoogleRefreshToken } from "./credentials.js";
import { ErrOAuthFailed, ErrValidationFailed } from "./errors.js";
import type { GoogleCalendarConfig } from "./config.js";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const REDIRECT_URI = "http://localhost:19876/callback";
const SCOPE = "https://www.googleapis.com/auth/calendar.readonly";

export const GoogleCalendarOnboarding = OnboardingFlow.create<GoogleCalendarConfig>([
  InputStep.create({
    label: "Google Cloud Configuration",
    description: `To set up Google Calendar API access:

1. Go to https://console.cloud.google.com/projectcreate and create a new project (or select an existing one)
2. Enable the Google Calendar API:
   - Visit https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
   - Click "Enable"
3. Configure the OAuth consent screen:
   - Go to https://console.cloud.google.com/apis/credentials/consent
   - Select "External" user type (or "Internal" for Workspace)
   - Fill in app name and your email
   - Add your email as a test user (required while app is in "Testing" status)
4. Create OAuth credentials:
   - Go to https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Desktop app"
   - Copy the Client ID and Client Secret below`,
    fields: {
      clientId: { label: "Client ID", type: "string", required: true },
      clientSecret: { label: "Client Secret", type: "string", required: true },
    },
  }),

  CustomStep.create({
    label: "Authenticate with Google",
    async execute(accumulated, ctx) {
      const clientId = accumulated.clientId as string;
      const clientSecret = accumulated.clientSecret as string;

      // Build consent URL
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: REDIRECT_URI,
        response_type: "code",
        scope: SCOPE,
        access_type: "offline",
        prompt: "consent",
      });
      const consentUrl = `${GOOGLE_AUTH_URL}?${params}`;

      // Start local callback server
      const { promise: codePromise, resolve: resolveCode, reject: rejectCode } =
        Promise.withResolvers<string>();

      const server = Bun.serve({
        port: 19876,
        async fetch(req) {
          const url = new URL(req.url);
          if (url.pathname === "/callback") {
            const code = url.searchParams.get("code");
            const error = url.searchParams.get("error");

            if (error) {
              rejectCode(new Error(`Google OAuth error: ${error}`));
              return new Response(
                "<html><body><h2>Authorization failed.</h2><p>You can close this tab.</p></body></html>",
                { headers: { "Content-Type": "text/html" } },
              );
            }

            if (code) {
              resolveCode(code);
              return new Response(
                "<html><body><h2>Authorization successful!</h2><p>You can close this tab and return to the terminal.</p></body></html>",
                { headers: { "Content-Type": "text/html" } },
              );
            }

            rejectCode(new Error("No authorization code received"));
            return new Response("Missing code", { status: 400 });
          }
          return new Response("Not found", { status: 404 });
        },
      });

      try {
        // Open browser
        Bun.spawn(["open", consentUrl]);

        // Wait for callback
        const code = await codePromise;

        // Exchange code for tokens
        const tokenBody = new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: REDIRECT_URI,
          grant_type: "authorization_code",
        });

        const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenBody.toString(),
        });

        if (!tokenResponse.ok) {
          const text = await tokenResponse.text();
          throw ErrOAuthFailed.create({ reason: `${tokenResponse.status}: ${text}` });
        }

        const tokens = (await tokenResponse.json()) as {
          access_token: string;
          refresh_token?: string;
          expires_in: number;
        };

        if (!tokens.access_token) {
          throw ErrOAuthFailed.create({ reason: "No access token in response" });
        }

        if (!tokens.refresh_token) {
          throw ErrOAuthFailed.create({
            reason: "No refresh token in response. Make sure prompt=consent is set.",
          });
        }

        await ctx.credentialStore.set(GoogleAccessToken.name, tokens.access_token);
        await ctx.credentialStore.set(GoogleRefreshToken.name, tokens.refresh_token);
      } finally {
        server.stop();
      }

      return {};
    },
  }),

  ValidationStep.create({
    label: "Verify Google Calendar access",
    async validate(_accumulated, { credentialStore }) {
      const token = await credentialStore.get(GoogleAccessToken.name);

      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/users/me/calendarList?maxResults=1",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw ErrValidationFailed.create({
          status: response.status,
          statusText: response.statusText,
        });
      }
    },
  }),
]);
