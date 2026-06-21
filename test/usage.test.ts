import { describe, expect, test } from "bun:test";

import { formatUsage, totalCalls, track, type UsageCounts } from "../src/usage.js";

describe("track — per-tool call counter", () => {
  test("first call initializes a counter to 1", () => {
    const u: UsageCounts = {};
    track(u, "guiri-style-guide");
    expect(u["guiri-style-guide"]).toBe(1);
  });

  test("repeated calls accumulate", () => {
    const u: UsageCounts = {};
    for (let i = 0; i < 5; i++) track(u, "guiri-list-posts");
    expect(u["guiri-list-posts"]).toBe(5);
  });

  test("distinct tools are counted independently", () => {
    const u: UsageCounts = {};
    track(u, "a");
    track(u, "b");
    track(u, "a");
    expect(u).toEqual({ a: 2, b: 1 });
  });
});

describe("totalCalls — sum across tools", () => {
  test("empty map sums to zero", () => {
    expect(totalCalls({})).toBe(0);
  });

  test("sums every tool's count", () => {
    expect(totalCalls({ a: 2, b: 1, c: 3 })).toBe(6);
  });

  test("agrees with the number of track() calls made", () => {
    const u: UsageCounts = {};
    track(u, "a");
    track(u, "a");
    track(u, "b");
    expect(totalCalls(u)).toBe(3);
  });
});

describe("formatUsage — descending-by-count rendering", () => {
  test("placeholder when nothing recorded", () => {
    expect(formatUsage({})).toBe("No tool calls recorded yet.");
  });

  test("single entry renders as 'tool: count'", () => {
    expect(formatUsage({ "guiri-get-photo": 4 })).toBe("guiri-get-photo: 4");
  });

  test("orders lines by descending count", () => {
    const out = formatUsage({ low: 1, high: 9, mid: 3 });
    expect(out).toBe("high: 9\nmid: 3\nlow: 1");
  });

  test("each tool appears on its own line", () => {
    const out = formatUsage({ a: 1, b: 2 });
    expect(out.split("\n")).toHaveLength(2);
  });

  test("count after track() matches what formatUsage prints", () => {
    const u: UsageCounts = {};
    track(u, "guiri-save-caption");
    track(u, "guiri-save-caption");
    expect(formatUsage(u)).toBe("guiri-save-caption: 2");
  });
});
