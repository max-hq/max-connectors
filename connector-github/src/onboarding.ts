/**
 * GitHub onboarding flow — gh CLI token extraction + validation.
 *
 * Requires the GitHub CLI (gh) to be installed and authenticated.
 * The token is extracted via `gh auth token` and stored as a credential.
 * No repo input needed — the token determines scope.
 */

import { OnboardingFlow, CustomStep, ValidationStep } from "@max/connector";
import {
  ErrGhCliNotAvailable,
  ErrGitHubValidationFailed,
} from "./errors.js";
import { GitHubToken } from "./credentials.js";
import type { GitHubConfig } from "./config.js";

export const GitHubOnboarding = OnboardingFlow.create<GitHubConfig>([
  CustomStep.create({
    label: "Authenticate via GitHub CLI",
    async execute(_accumulated, ctx) {
      try {
        const proc = Bun.spawn(["gh", "auth", "token"], {
          stdout: "pipe",
          stderr: "pipe",
        });

        const exitCode = await proc.exited;
        if (exitCode !== 0) {
          const stderr = await new Response(proc.stderr).text();
          throw ErrGhCliNotAvailable.create({
            reason: stderr.trim() || "gh auth token failed. Run `gh auth login` first.",
          });
        }

        const token = (await new Response(proc.stdout).text()).trim();
        if (!token) {
          throw ErrGhCliNotAvailable.create({
            reason: "gh auth token returned empty. Run `gh auth login` first.",
          });
        }

        await ctx.credentialStore.set(GitHubToken.name, token);
      } catch (e) {
        if (e && typeof e === "object" && "code" in e) {
          throw ErrGhCliNotAvailable.create({
            reason: "gh CLI not found. Install it from https://cli.github.com",
          });
        }
        throw e;
      }

      return {};
    },
  }),

  ValidationStep.create({
    label: "Verify GitHub access",
    async validate(_accumulated, { credentialStore }) {
      const token = await credentialStore.get(GitHubToken.name);

      const response = await fetch("https://api.github.com/user", {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });

      if (!response.ok) {
        throw ErrGitHubValidationFailed.create({
          status: response.status,
          statusText: response.statusText,
        });
      }
    },
  }),
]);
