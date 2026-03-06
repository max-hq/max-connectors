/**
 * AWS Performance Insights onboarding flow - region, dbResourceId, credentials, validation.
 *
 * Step 1: Collect region (with default), DB resource ID, and AWS credentials.
 * Step 2: Validate by calling GetResourceMetadata to verify PI is enabled.
 */

import { OnboardingFlow, InputStep, ValidationStep } from "@max/connector";
import { PIClient as AWSPISDKClient, GetResourceMetadataCommand } from "@aws-sdk/client-pi";
import { AWSAccessKeyId, AWSSecretAccessKey } from "./credentials.js";
import { ErrValidationFailed } from "./errors.js";
import type { AWSPerfInsightsConfig } from "./config.js";

export const AWSPerfInsightsOnboarding = OnboardingFlow.create<AWSPerfInsightsConfig>([
  InputStep.create({
    label: "AWS Configuration",
    description: "Enter your AWS region, DB resource ID, and credentials for Performance Insights access",
    fields: {
      region: { label: "AWS Region", type: "string", default: "us-east-1" },
      dbResourceId: { label: "DB Resource ID", type: "string" },
    },
    credentials: {
      aws_access_key_id: AWSAccessKeyId,
      aws_secret_access_key: AWSSecretAccessKey,
    },
  }),

  ValidationStep.create({
    label: "Verify AWS Performance Insights access",
    async validate(accumulated, { credentialStore }) {
      const accessKeyId = await credentialStore.get(AWSAccessKeyId.name);
      const secretAccessKey = await credentialStore.get(AWSSecretAccessKey.name);
      const region = (accumulated.region as string) || "us-east-1";
      const dbResourceId = accumulated.dbResourceId as string;

      if (!dbResourceId) {
        throw ErrValidationFailed.create({
          reason: "DB Resource ID is required",
        });
      }

      const client = new AWSPISDKClient({
        region,
        credentials: { accessKeyId, secretAccessKey },
      });

      try {
        await client.send(
          new GetResourceMetadataCommand({
            ServiceType: "RDS",
            Identifier: dbResourceId,
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
