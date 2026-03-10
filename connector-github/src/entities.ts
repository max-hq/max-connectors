/**
 * GitHub entity definitions.
 *
 * Ordered leaf-first to avoid forward references in const declarations.
 */

import {
  EntityDef,
  Field,
  type ScalarField,
  type RefField,
  type CollectionField,
} from "@max/core";

// ============================================================================
// GitHubUser (leaf)
// ============================================================================

export interface GitHubUser extends EntityDef<{
  login: ScalarField<"string">;
  name: ScalarField<"string">;
  email: ScalarField<"string">;
  avatarUrl: ScalarField<"string">;
  url: ScalarField<"string">;
  company: ScalarField<"string">;
  bio: ScalarField<"string">;
  location: ScalarField<"string">;
  publicRepos: ScalarField<"number">;
  followers: ScalarField<"number">;
}> {}

export const GitHubUser: GitHubUser = EntityDef.create("GitHubUser", {
  login: Field.string(),
  name: Field.string(),
  email: Field.string(),
  avatarUrl: Field.string(),
  url: Field.string(),
  company: Field.string(),
  bio: Field.string(),
  location: Field.string(),
  publicRepos: Field.number(),
  followers: Field.number(),
});

// ============================================================================
// GitHubRepository (leaf)
// ============================================================================

export interface GitHubRepository extends EntityDef<{
  fullName: ScalarField<"string">;
  name: ScalarField<"string">;
  description: ScalarField<"string">;
  url: ScalarField<"string">;
  language: ScalarField<"string">;
  stars: ScalarField<"number">;
  forks: ScalarField<"number">;
  openIssuesCount: ScalarField<"number">;
  isPrivate: ScalarField<"string">;
  isArchived: ScalarField<"string">;
  defaultBranch: ScalarField<"string">;
  pushedAt: ScalarField<"string">;
  createdAt: ScalarField<"string">;
  updatedAt: ScalarField<"string">;
  topics: ScalarField<"string">;
}> {}

export const GitHubRepository: GitHubRepository = EntityDef.create("GitHubRepository", {
  fullName: Field.string(),
  name: Field.string(),
  description: Field.string(),
  url: Field.string(),
  language: Field.string(),
  stars: Field.number(),
  forks: Field.number(),
  openIssuesCount: Field.number(),
  isPrivate: Field.string(),
  isArchived: Field.string(),
  defaultBranch: Field.string(),
  pushedAt: Field.string(),
  createdAt: Field.string(),
  updatedAt: Field.string(),
  topics: Field.string(),
});

// ============================================================================
// GitHubIssue (refs GitHubRepository, GitHubUser)
// ============================================================================

export interface GitHubIssue extends EntityDef<{
  repo: RefField<GitHubRepository>;
  number: ScalarField<"number">;
  title: ScalarField<"string">;
  body: ScalarField<"string">;
  state: ScalarField<"string">;
  labels: ScalarField<"string">;
  author: RefField<GitHubUser>;
  createdAt: ScalarField<"string">;
  updatedAt: ScalarField<"string">;
}> {}

export const GitHubIssue: GitHubIssue = EntityDef.create("GitHubIssue", {
  repo: Field.ref(GitHubRepository),
  number: Field.number(),
  title: Field.string(),
  body: Field.string(),
  state: Field.string(),
  labels: Field.string(),
  author: Field.ref(GitHubUser),
  createdAt: Field.string(),
  updatedAt: Field.string(),
});

// ============================================================================
// GitHubCommit (refs GitHubRepository, GitHubUser)
// ============================================================================

export interface GitHubCommit extends EntityDef<{
  repo: RefField<GitHubRepository>;
  author: RefField<GitHubUser>;
  sha: ScalarField<"string">;
  message: ScalarField<"string">;
  authorDate: ScalarField<"string">;
  additions: ScalarField<"number">;
  deletions: ScalarField<"number">;
  changedFiles: ScalarField<"number">;
}> {}

export const GitHubCommit: GitHubCommit = EntityDef.create("GitHubCommit", {
  repo: Field.ref(GitHubRepository),
  author: Field.ref(GitHubUser),
  sha: Field.string(),
  message: Field.string(),
  authorDate: Field.string(),
  additions: Field.number(),
  deletions: Field.number(),
  changedFiles: Field.number(),
});

// ============================================================================
// GitHubPullRequest (refs GitHubRepository, GitHubUser)
// ============================================================================

export interface GitHubPullRequest extends EntityDef<{
  repo: RefField<GitHubRepository>;
  number: ScalarField<"number">;
  title: ScalarField<"string">;
  state: ScalarField<"string">;
  author: RefField<GitHubUser>;
  merged: ScalarField<"string">;
  mergedAt: ScalarField<"string">;
  createdAt: ScalarField<"string">;
  updatedAt: ScalarField<"string">;
  closedAt: ScalarField<"string">;
  headRef: ScalarField<"string">;
  baseRef: ScalarField<"string">;
  labels: ScalarField<"string">;
  additions: ScalarField<"number">;
  deletions: ScalarField<"number">;
  changedFiles: ScalarField<"number">;
  commentCount: ScalarField<"number">;
}> {}

export const GitHubPullRequest: GitHubPullRequest = EntityDef.create("GitHubPullRequest", {
  repo: Field.ref(GitHubRepository),
  number: Field.number(),
  title: Field.string(),
  state: Field.string(),
  author: Field.ref(GitHubUser),
  merged: Field.string(),
  mergedAt: Field.string(),
  createdAt: Field.string(),
  updatedAt: Field.string(),
  closedAt: Field.string(),
  headRef: Field.string(),
  baseRef: Field.string(),
  labels: Field.string(),
  additions: Field.number(),
  deletions: Field.number(),
  changedFiles: Field.number(),
  commentCount: Field.number(),
});

// ============================================================================
// GitHubWorkflowRun (refs GitHubRepository, GitHubUser)
// ============================================================================

export interface GitHubWorkflowRun extends EntityDef<{
  repo: RefField<GitHubRepository>;
  workflowName: ScalarField<"string">;
  runNumber: ScalarField<"number">;
  status: ScalarField<"string">;
  conclusion: ScalarField<"string">;
  headBranch: ScalarField<"string">;
  event: ScalarField<"string">;
  createdAt: ScalarField<"string">;
  runStartedAt: ScalarField<"string">;
  actor: RefField<GitHubUser>;
}> {}

export const GitHubWorkflowRun: GitHubWorkflowRun = EntityDef.create("GitHubWorkflowRun", {
  repo: Field.ref(GitHubRepository),
  workflowName: Field.string(),
  runNumber: Field.number(),
  status: Field.string(),
  conclusion: Field.string(),
  headBranch: Field.string(),
  event: Field.string(),
  createdAt: Field.string(),
  runStartedAt: Field.string(),
  actor: Field.ref(GitHubUser),
});

// ============================================================================
// GitHubReview (leaf — refs GitHubUser)
// ============================================================================

export interface GitHubReview extends EntityDef<{
  repo: RefField<GitHubRepository>;
  pullRequestNumber: ScalarField<"number">;
  reviewer: RefField<GitHubUser>;
  state: ScalarField<"string">;
  body: ScalarField<"string">;
  submittedAt: ScalarField<"string">;
}> {}

export const GitHubReview: GitHubReview = EntityDef.create("GitHubReview", {
  repo: Field.ref(GitHubRepository),
  pullRequestNumber: Field.number(),
  reviewer: Field.ref(GitHubUser),
  state: Field.string(),
  body: Field.string(),
  submittedAt: Field.string(),
});

// ============================================================================
// GitHubRoot (root singleton — all collections)
// ============================================================================

export interface GitHubRoot extends EntityDef<{
  login: ScalarField<"string">;
  repositories: CollectionField<GitHubRepository>;
  pullRequests: CollectionField<GitHubPullRequest>;
  commits: CollectionField<GitHubCommit>;
  workflowRuns: CollectionField<GitHubWorkflowRun>;
  issues: CollectionField<GitHubIssue>;
  reviews: CollectionField<GitHubReview>;
  users: CollectionField<GitHubUser>;
}> {}

export const GitHubRoot: GitHubRoot = EntityDef.create("GitHubRoot", {
  login: Field.string(),
  repositories: Field.collection(GitHubRepository),
  pullRequests: Field.collection(GitHubPullRequest),
  commits: Field.collection(GitHubCommit),
  workflowRuns: Field.collection(GitHubWorkflowRun),
  issues: Field.collection(GitHubIssue),
  reviews: Field.collection(GitHubReview),
  users: Field.collection(GitHubUser),
});
