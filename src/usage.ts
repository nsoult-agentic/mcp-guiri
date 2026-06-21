/**
 * Pure API-usage tracking — a per-session call counter plus formatting.
 *
 * Extracted from http.ts so the counting/formatting logic is testable
 * without standing up the HTTP server. Behavior is unchanged.
 */

export type UsageCounts = Record<string, number>;

/** Increment the counter for `tool` in place, starting from zero. */
export function track(usage: UsageCounts, tool: string): void {
  usage[tool] = (usage[tool] ?? 0) + 1;
}

/** Total number of recorded tool calls. */
export function totalCalls(usage: UsageCounts): number {
  return Object.values(usage).reduce((a, b) => a + b, 0);
}

/**
 * Render the usage map as "tool: count" lines sorted by descending count,
 * or a placeholder when nothing has been recorded.
 */
export function formatUsage(usage: UsageCounts): string {
  const lines = Object.entries(usage)
    .sort(([, a], [, b]) => b - a)
    .map(([tool, count]) => `${tool}: ${count}`)
    .join("\n");
  return lines || "No tool calls recorded yet.";
}
