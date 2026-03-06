/**
 * Stable ID generation for synthetic entities.
 *
 * Joins parts with "|", hashes with Bun.hash, returns 16-char hex string.
 * Deterministic: same inputs always produce the same ID.
 */

export function stableId(...parts: string[]): string {
  const input = parts.join("|");
  const hash = Bun.hash(input);
  return hash.toString(16).padStart(16, "0").slice(0, 16);
}
