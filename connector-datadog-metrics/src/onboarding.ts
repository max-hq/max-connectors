/**
 * Datadog Metrics onboarding flow - site + credentials input, validation.
 *
 * Step 1: Collect Datadog site, metric patterns, and API credentials.
 * Step 2: Validate by making a minimal listTagConfigurations(pageSize=1) call.
 */

import { OnboardingFlow, InputStep, ValidationStep } from "@max/connector";
import { client, v2 } from "@datadog/datadog-api-client";
import { DatadogApiKey, DatadogAppKey } from "./credentials.js";
import { ErrValidationFailed } from "./errors.js";
import type { DatadogMetricsConfig } from "./config.js";

export const DatadogMetricsOnboarding = OnboardingFlow.create<DatadogMetricsConfig>([
  InputStep.create({
    label: "Datadog Configuration",
    description: "Enter your Datadog site and API credentials for Metrics access",
    fields: {
      site: { label: "Datadog Site", type: "string", default: "datadoghq.com" },
      metricPatterns: { label: "Metric Patterns (comma-separated)", type: "string", default: "aws.*,system.*" },
    },
    credentials: {
      datadog_api_key: DatadogApiKey,
      datadog_app_key: DatadogAppKey,
    },
  }),

  ValidationStep.create({
    label: "Verify Datadog Metrics access",
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

      const api = new v2.MetricsApi(configuration);

      try {
        await api.listTagConfigurations({ pageSize: 1 });
      } catch (err) {
        throw ErrValidationFailed.create({
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    },
  }),
]);
