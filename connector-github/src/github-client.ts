/**
 * GitHubClient — REST + GraphQL wrapper for the GitHub API.
 *
 * REST (v3) is used for repos, PRs, issues, workflow runs, and users.
 * GraphQL (v4) is used for commits (returns stats in-band, no N+1).
 *
 * Includes a token-bucket rate limiter (14 req/s — headroom under GitHub's
 * 900 points/minute secondary limit), a repo cache, a user-login accumulator,
 * and a concurrency helper.
 *
 * Lifecycle: start() resolves the token from the credential handle before
 * any API calls.
 */

import type { CredentialHandle } from "@max/connector";
import { ErrGitHubNotStarted, ErrGitHubApiError } from "./errors.js";

const GITHUB_API = "https://api.github.com";

// ============================================================================
// Throttle — simple timestamp-based rate limiting (no timers, no event loop)
//
// GitHub limits: Primary 5000 req/hour, Secondary 900 points/min (~15 req/s).
// Default interval: 200ms (5 req/s). Adapts based on x-ratelimit-remaining.
// ============================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class Throttle {
  private lastCall = 0;
  private intervalMs: number;

  constructor(intervalMs: number = 200) {
    this.intervalMs = intervalMs;
  }

  setInterval(ms: number): void {
    this.intervalMs = ms;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCall;
    if (elapsed < this.intervalMs) {
      await sleep(this.intervalMs - elapsed);
    }
    this.lastCall = Date.now();
  }
}

// ============================================================================
// Client
// ============================================================================

export class GitHubClient {
  private token: string | null = null;
  private readonly throttle = new Throttle(200);
  private cachedRepos: Record<string, unknown>[] | null = null;
  private readonly userLogins = new Set<string>();
  private readonly pullRequestsByRepo = new Map<string, number[]>();
  private primaryRemaining: number = Infinity;
  private primaryResetAt: number = 0;

  constructor(
    private readonly tokenHandle: CredentialHandle<string>,
  ) {}

  async start(): Promise<void> {
    this.token = await this.tokenHandle.get();
  }

  private get headers(): Record<string, string> {
    if (!this.token) throw ErrGitHubNotStarted.create({});
    return {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${this.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  // --------------------------------------------------------------------------
  // User login accumulator
  // --------------------------------------------------------------------------

  collectUserLogin(login: string): void {
    if (login) this.userLogins.add(login);
  }

  getCollectedUserLogins(): Set<string> {
    return this.userLogins;
  }

  // --------------------------------------------------------------------------
  // PR number accumulator (consumed by ReviewsLoader)
  // --------------------------------------------------------------------------

  collectPullRequest(fullName: string, prNumber: number): void {
    let prs = this.pullRequestsByRepo.get(fullName);
    if (!prs) {
      prs = [];
      this.pullRequestsByRepo.set(fullName, prs);
    }
    prs.push(prNumber);
  }

  getCollectedPullRequests(): Map<string, number[]> {
    return this.pullRequestsByRepo;
  }

  // --------------------------------------------------------------------------
  // Concurrency helper
  // --------------------------------------------------------------------------

  async mapConcurrent<T, R>(
    items: T[],
    concurrency: number,
    fn: (item: T) => Promise<R>,
  ): Promise<R[]> {
    const results: R[] = [];
    let index = 0;

    async function worker(): Promise<void> {
      while (index < items.length) {
        const i = index++;
        results[i] = await fn(items[i]);
      }
    }

    const workers: Promise<void>[] = [];
    for (let i = 0; i < Math.min(concurrency, items.length); i++) {
      workers.push(worker());
    }
    await Promise.all(workers);

    return results;
  }

  // --------------------------------------------------------------------------
  // Repo cache
  // --------------------------------------------------------------------------

  async getAllRepos(): Promise<Record<string, unknown>[]> {
    if (this.cachedRepos) return this.cachedRepos;

    const all: Record<string, unknown>[] = [];
    let page = 1;

    do {
      const batch = await this.listRepos(page);
      all.push(...batch);
      if (batch.length < 100) break;
      page++;
    } while (true);

    this.cachedRepos = all;
    return all;
  }

  async getActiveRepos(since: string): Promise<Record<string, unknown>[]> {
    const all = await this.getAllRepos();
    return all.filter((r) => {
      const pushedAt = (r.pushed_at as string) ?? "";
      return pushedAt >= since;
    });
  }

  // --------------------------------------------------------------------------
  // REST (v3)
  // --------------------------------------------------------------------------

  private updateRateLimitFromHeaders(headers: Headers): void {
    const remaining = headers.get("x-ratelimit-remaining");
    const reset = headers.get("x-ratelimit-reset");
    if (remaining !== null) this.primaryRemaining = Number(remaining);
    if (reset !== null) this.primaryResetAt = Number(reset);

    // Adapt interval based on remaining budget
    if (this.primaryRemaining > 2000) {
      this.throttle.setInterval(200);   // 5 req/s — plenty of budget
    } else if (this.primaryRemaining > 500) {
      this.throttle.setInterval(500);   // 2 req/s — ease off
    } else if (this.primaryRemaining > 100) {
      this.throttle.setInterval(2000);  // 0.5 req/s — slow crawl
    } else {
      this.throttle.setInterval(5000);  // 0.2 req/s — critical
    }
  }

  private async waitForRateLimitReset(): Promise<void> {
    if (this.primaryRemaining === 0) {
      const now = Math.floor(Date.now() / 1000);
      if (this.primaryResetAt > now) {
        // Cap wait at 60s — if we still have no budget after that, we'll
        // wait again on the next request instead of blocking everything.
        const waitSec = Math.min(this.primaryResetAt - now + 1, 60);
        await sleep(waitSec * 1000);
      }
    }
  }

  async request<T>(path: string): Promise<T> {
    await this.waitForRateLimitReset();
    await this.throttle.wait();

    const url = `${GITHUB_API}${path}`;
    const response = await fetch(url, { headers: this.headers });

    this.updateRateLimitFromHeaders(response.headers);

    if (response.status === 429) {
      const retryAfter = Number(response.headers.get("retry-after") ?? "60");
      await sleep(retryAfter * 1000);
      return this.request(path);
    }

    if (response.status === 403) {
      if (this.primaryRemaining === 0) {
        await this.waitForRateLimitReset();
        return this.request(path);
      }
      throw ErrGitHubApiError.create({
        status: response.status,
        statusText: response.statusText,
      });
    }

    if (!response.ok) {
      throw ErrGitHubApiError.create({
        status: response.status,
        statusText: response.statusText,
      });
    }

    return response.json() as Promise<T>;
  }

  async getAuthenticatedUser(): Promise<Record<string, unknown>> {
    return this.request("/user");
  }

  async listRepos(page: number = 1): Promise<Record<string, unknown>[]> {
    return this.request(`/user/repos?per_page=100&sort=updated&type=all&page=${page}`);
  }

  async listPullRequests(owner: string, repo: string, page: number = 1): Promise<Record<string, unknown>[]> {
    return this.request(`/repos/${owner}/${repo}/pulls?state=all&per_page=100&page=${page}`);
  }

  async listWorkflowRuns(owner: string, repo: string, created: string, page: number = 1): Promise<Record<string, unknown>> {
    return this.request(`/repos/${owner}/${repo}/actions/runs?per_page=1000&created=${encodeURIComponent(created)}&page=${page}`);
  }

  async listIssues(owner: string, repo: string, since: string, page: number = 1): Promise<Record<string, unknown>[]> {
    return this.request(`/repos/${owner}/${repo}/issues?state=all&per_page=100&since=${encodeURIComponent(since)}&page=${page}`);
  }

  async getUser(login: string): Promise<Record<string, unknown>> {
    return this.request(`/users/${login}`);
  }

  async listPullRequestReviews(owner: string, repo: string, pullNumber: number): Promise<Record<string, unknown>[]> {
    return this.request(`/repos/${owner}/${repo}/pulls/${pullNumber}/reviews?per_page=100`);
  }

  // --------------------------------------------------------------------------
  // GraphQL (v4)
  // --------------------------------------------------------------------------

  private async graphqlRequest<T>(query: string): Promise<T> {
    await this.waitForRateLimitReset();
    await this.throttle.wait();

    const url = `${GITHUB_API}/graphql`;
    const response = await fetch(url, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({ query }),
    });

    this.updateRateLimitFromHeaders(response.headers);

    if (!response.ok) {
      throw ErrGitHubApiError.create({
        status: response.status,
        statusText: response.statusText,
      });
    }

    const json = (await response.json()) as { data: T; errors?: unknown[] };
    return json.data;
  }

  /**
   * Fetch reviews for multiple PRs in a single GraphQL call.
   * Batches into groups of 25 to stay under query complexity limits.
   * Returns a map of prNumber → array of normalized review objects.
   */
  async fetchReviewsBatch(
    owner: string,
    repo: string,
    prNumbers: number[],
  ): Promise<Map<number, Record<string, unknown>[]>> {
    const result = new Map<number, Record<string, unknown>[]>();
    const BATCH_SIZE = 25;

    for (let i = 0; i < prNumbers.length; i += BATCH_SIZE) {
      const batch = prNumbers.slice(i, i + BATCH_SIZE);

      const prFields = batch
        .map(
          (num) => `pr_${num}: pullRequest(number: ${num}) {
        reviews(first: 100) {
          nodes { databaseId author { login } state body submittedAt }
        }
      }`,
        )
        .join("\n");

      const query = `{ repository(owner: "${owner}", name: "${repo}") { ${prFields} } }`;

      try {
        const data = await this.graphqlRequest<Record<string, unknown>>(query);
        const repoData = data.repository as Record<string, unknown> | undefined;
        if (!repoData) continue;

        for (const num of batch) {
          const prData = repoData[`pr_${num}`] as { reviews?: { nodes?: Record<string, unknown>[] } } | undefined;
          const nodes = prData?.reviews?.nodes;
          if (nodes && nodes.length > 0) {
            // Normalize to match REST shape so the loader doesn't care
            result.set(
              num,
              nodes.map((n) => ({
                id: n.databaseId,
                user: n.author,
                state: n.state,
                body: n.body,
                submitted_at: n.submittedAt,
              })),
            );
          }
        }
      } catch {
        // skip batch on error
      }
    }

    return result;
  }

  /**
   * Fetch PR stats (additions, deletions, changedFiles, commentCount) for
   * multiple PRs in a single GraphQL call. Batches into groups of 25.
   */
  async fetchPRStatsBatch(
    owner: string,
    repo: string,
    prNumbers: number[],
  ): Promise<Map<number, { additions: number; deletions: number; changedFiles: number; commentCount: number }>> {
    const result = new Map<number, { additions: number; deletions: number; changedFiles: number; commentCount: number }>();
    const BATCH_SIZE = 25;

    for (let i = 0; i < prNumbers.length; i += BATCH_SIZE) {
      const batch = prNumbers.slice(i, i + BATCH_SIZE);

      const prFields = batch
        .map(
          (num) => `pr_${num}: pullRequest(number: ${num}) {
        additions deletions changedFiles
        comments { totalCount }
      }`,
        )
        .join("\n");

      const query = `{ repository(owner: "${owner}", name: "${repo}") { ${prFields} } }`;

      try {
        const data = await this.graphqlRequest<Record<string, unknown>>(query);
        const repoData = data.repository as Record<string, unknown> | undefined;
        if (!repoData) continue;

        for (const num of batch) {
          const prData = repoData[`pr_${num}`] as {
            additions?: number;
            deletions?: number;
            changedFiles?: number;
            comments?: { totalCount?: number };
          } | undefined;
          if (!prData) continue;

          result.set(num, {
            additions: prData.additions ?? 0,
            deletions: prData.deletions ?? 0,
            changedFiles: prData.changedFiles ?? 0,
            commentCount: prData.comments?.totalCount ?? 0,
          });
        }
      } catch {
        // skip batch on error
      }
    }

    return result;
  }

  /**
   * Fetch commits on the default branch for a repo since a given date.
   * Uses GraphQL with cursor-based pagination.
   */
  async fetchCommitsByRepo(
    owner: string,
    repo: string,
    since: string,
  ): Promise<Array<{
    oid: string;
    message: string;
    authorDate: string;
    additions: number;
    deletions: number;
    changedFiles: number;
    authorLogin?: string;
  }>> {
    const commits: Array<{
      oid: string;
      message: string;
      authorDate: string;
      additions: number;
      deletions: number;
      changedFiles: number;
      authorLogin?: string;
    }> = [];

    let cursor: string | null = null;
    let hasNextPage = true;

    while (hasNextPage) {
      const afterClause = cursor ? `, after: "${cursor}"` : "";
      const query = `{
        repository(owner: "${owner}", name: "${repo}") {
          defaultBranchRef {
            target {
              ... on Commit {
                history(first: 100, since: "${since}"${afterClause}) {
                  pageInfo { hasNextPage endCursor }
                  nodes {
                    oid message
                    author { date user { login } }
                    additions deletions changedFilesIfAvailable
                  }
                }
              }
            }
          }
        }
      }`;

      try {
        const data = await this.graphqlRequest<Record<string, unknown>>(query);
        const repoData = data.repository as Record<string, unknown> | undefined;
        const ref = repoData?.defaultBranchRef as Record<string, unknown> | undefined;
        const target = ref?.target as Record<string, unknown> | undefined;
        const history = target?.history as {
          pageInfo?: { hasNextPage?: boolean; endCursor?: string };
          nodes?: Array<Record<string, unknown>>;
        } | undefined;

        if (!history?.nodes) break;

        for (const node of history.nodes) {
          const author = node.author as {
            date?: string;
            user?: { login?: string } | null;
          } | undefined;

          const login = author?.user?.login;
          if (login) this.collectUserLogin(login);

          commits.push({
            oid: (node.oid as string) ?? "",
            message: (node.message as string) ?? "",
            authorDate: author?.date ?? "",
            additions: (node.additions as number) ?? 0,
            deletions: (node.deletions as number) ?? 0,
            changedFiles: (node.changedFilesIfAvailable as number) ?? 0,
            authorLogin: login ?? undefined,
          });
        }

        hasNextPage = history.pageInfo?.hasNextPage ?? false;
        cursor = history.pageInfo?.endCursor ?? null;
      } catch {
        break;
      }
    }

    return commits;
  }

  // --------------------------------------------------------------------------
  // Health
  // --------------------------------------------------------------------------

  async health(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.getAuthenticatedUser();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  }
}
