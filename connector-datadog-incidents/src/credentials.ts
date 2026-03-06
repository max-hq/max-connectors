/**
 * Datadog Incidents credential definitions.
 *
 * API key + App key collected during onboarding.
 */

import { Credential } from "@max/connector";

export const DatadogApiKey = Credential.string("datadog_api_key");
export const DatadogAppKey = Credential.string("datadog_app_key");
