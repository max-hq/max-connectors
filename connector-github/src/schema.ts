/**
 * GitHub connector schema.
 */

import { Schema } from "@max/core";
import {
  GitHubUser,
  GitHubRepository,
  GitHubIssue,
  GitHubCommit,
  GitHubPullRequest,
  GitHubWorkflowRun,
  GitHubReview,
  GitHubRoot,
} from "./entities.js";

export {
  GitHubUser,
  GitHubRepository,
  GitHubIssue,
  GitHubCommit,
  GitHubPullRequest,
  GitHubWorkflowRun,
  GitHubReview,
  GitHubRoot,
};

export const GitHubSchema = Schema.create({
  namespace: "github",
  entities: [
    GitHubUser,
    GitHubRepository,
    GitHubIssue,
    GitHubCommit,
    GitHubPullRequest,
    GitHubWorkflowRun,
    GitHubReview,
    GitHubRoot,
  ],
  roots: [GitHubRoot],
});
