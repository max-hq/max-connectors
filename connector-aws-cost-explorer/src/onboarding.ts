/**
 * AWS Cost Explorer onboarding flow - region + credentials input, validation.
 *
 * Step 1: Collect region (with default) and AWS credentials.
 * Step 2: Validate by making a minimal 1-day GetCostAndUsage call.
 */

import { OnboardingFlow, InputStep, ValidationStep } from "@max/connector";
import { CostExplorerClient as AWSCEClient, GetCostAndUsageCommand } from "@aws-sdk/client-cost-explorer";
import { AWSAccessKeyId, AWSSecretAccessKey } from "./credentials.js";
import { ErrValidationFailed } from "./errors.js";
import type { AWSCostExplorerConfig } from "./config.js";

export const AWSCostExplorerOnboarding = OnboardingFlow.create<AWSCostExplorerConfig>([
  InputStep.create({
    label: "AWS Configuration",
    description: "Enter your AWS region and credentials for Cost Explorer access",
    fields: {
      region: { label: "AWS Region", type: "string", default: "us-east-1" },
    },
    credentials: {
      aws_access_key_id: AWSAccessKeyId,
      aws_secret_access_key: AWSSecretAccessKey,
    },
  }),

  ValidationStep.create({
    label: "Verify AWS Cost Explorer access",
    async validate(accumulated, { credentialStore }) {
      const accessKeyId = await credentialStore.get(AWSAccessKeyId.name);
      const secretAccessKey = await credentialStore.get(AWSSecretAccessKey.name);
      const region = (accumulated.region as string) || "us-east-1";

      const client = new AWSCEClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      try {
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const start = new Date(end);
        start.setDate(start.getDate() - 1);

        const fmt = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };

        await client.send(
          new GetCostAndUsageCommand({
            TimePeriod: { Start: fmt(start), End: fmt(end) },
            Granularity: "DAILY",
            Metrics: ["BlendedCost"],
          }),
        );
      } catch (err) {
        throw ErrValidationFailed.create({
          reason: err instanceof Error ? err.message : String(err),
        });
      } finally {
        client.destroy();
      }
    },
  }),
]);
