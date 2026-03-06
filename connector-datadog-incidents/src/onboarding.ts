/**
 * Datadog Incidents onboarding flow - site + credentials input, validation.
 *
 * Step 1: Collect Datadog site and API credentials.
 * Step 2: Validate by making a minimal listIncidents(1) call.
 */

import { OnboardingFlow, InputStep, ValidationStep } from "@max/connector";
import { client, v2 } from "@datadog/datadog-api-client";
import { DatadogApiKey, DatadogAppKey } from "./credentials.js";
import { ErrValidationFailed } from "./errors.js";
import type { DatadogIncidentsConfig } from "./config.js";

export const DatadogIncidentsOnboarding = OnboardingFlow.create<DatadogIncidentsConfig>([
  InputStep.create({
    label: "Datadog Configuration",
    description: "Enter your Datadog site and API credentials for Incidents access",
    fields: {
      site: { label: "Datadog Site", type: "string", default: "datadoghq.com" },
    },
    credentials: {
      datadog_api_key: DatadogApiKey,
      datadog_app_key: DatadogAppKey,
    },
  }),

  ValidationStep.create({
    label: "Verify Datadog Incidents access",
    async validate(accumulated, { credentialStore }) {
      const apiKey = await credentialStore.get(DatadogApiKey.name);
      const appKey = await credentialStore.get(DatadogAppKey.name);
      const site = (accumulated.site as string) || "datadoghq.com";

      const configuration = client.createConfiguration({
        authMethods: {
          apiKeyAuth: apiKey,
          appKeyAuth: appKey,
        },
      });
      configuration.setServerVariables({ site });
      configuration.unstableOperations["v2.listIncidents"] = true;

      const api = new v2.IncidentsApi(configuration);

      try {
        await api.listIncidents({ pageSize: 1, pageOffset: 0 });
      } catch (err) {
        throw ErrValidationFailed.create({
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    },
  }),
]);
