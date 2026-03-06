/**
 * AWS Performance Insights credential definitions.
 *
 * Access key + secret collected during onboarding.
 */

import { Credential } from "@max/connector";

export const AWSAccessKeyId = Credential.string("aws_access_key_id");
export const AWSSecretAccessKey = Credential.string("aws_secret_access_key");
