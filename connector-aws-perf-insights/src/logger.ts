/**
 * Simple file logger for debugging sync failures.
 *
 * Writes to /tmp/max-perf-insights.log
 */

import { appendFileSync } from "node:fs";

const LOG_FILE = "/tmp/max-perf-insights.log";

export function log(label: string, message: string): void {
  const line = `[${new Date().toISOString()}] [${label}] ${message}\n`;
  appendFileSync(LOG_FILE, line);
}

export function logError(label: string, err: unknown): void {
  const msg = err instanceof Error ? `${err.message}\n${err.stack}` : String(err);
  log(label, `ERROR: ${msg}`);
}
