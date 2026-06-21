import { describe, expect, test } from "bun:test";

import { isValidSlug, KEBAB_CASE, sanitizeSlug } from "../src/slug.js";

// sanitizeSlug is security-critical: it is the only thing standing between a
// caller-supplied post slug and an interpolated Nextcloud path. The regexes
// below describe its exact transformation; expected values are reasoned from
// that definition, not copied from a sample run.
//
//   step 1: .replace(/[/\\..]/g, "")  → removes every "/", "\" and "."
//   step 2: .replace(/\.\./g, "")     → removes any leftover ".." pairs
//           (no dots survive step 1, so step 2 only matters if step 1 changes)

describe("sanitizeSlug — strips path-escaping characters", () => {
  test("plain kebab slug is untouched", () => {
    expect(sanitizeSlug("barcelona-cal-pep")).toBe("barcelona-cal-pep");
  });

  test("removes forward slashes (no nested path)", () => {
    expect(sanitizeSlug("a/b/c")).toBe("abc");
  });

  test("removes backslashes", () => {
    expect(sanitizeSlug("a\\b")).toBe("ab");
  });

  test("removes dots so traversal cannot form", () => {
    expect(sanitizeSlug("..")).toBe("");
    expect(sanitizeSlug("...")).toBe("");
  });

  test("classic ../ traversal is neutralized", () => {
    // every "." and "/" is removed in step 1, leaving only safe chars
    expect(sanitizeSlug("../../etc/passwd")).toBe("etcpasswd");
  });

  test("absolute-path attempt loses its leading slash", () => {
    expect(sanitizeSlug("/etc/passwd")).toBe("etcpasswd");
  });

  test("result never contains a slash, backslash, or dot", () => {
    for (const input of ["a/b", "x\\y", "a.b", "../foo", ".\\.\\.", "x/../y"]) {
      const out = sanitizeSlug(input);
      expect(out).not.toMatch(/[/\\.]/);
    }
  });

  test("empty string stays empty", () => {
    expect(sanitizeSlug("")).toBe("");
  });

  test("digits and hyphens are preserved", () => {
    expect(sanitizeSlug("img-01-2026")).toBe("img-01-2026");
  });

  test("is idempotent — sanitizing twice equals sanitizing once", () => {
    for (const input of ["../../a", "a/b.c", "x\\..\\y"]) {
      expect(sanitizeSlug(sanitizeSlug(input))).toBe(sanitizeSlug(input));
    }
  });
});

describe("isValidSlug / KEBAB_CASE — create-post validation", () => {
  test("accepts lowercase kebab-case", () => {
    expect(isValidSlug("barcelona-cal-pep")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
    expect(isValidSlug("post-01")).toBe(true);
  });

  test("rejects uppercase letters", () => {
    expect(isValidSlug("Barcelona")).toBe(false);
  });

  test("rejects spaces and underscores", () => {
    expect(isValidSlug("cal pep")).toBe(false);
    expect(isValidSlug("cal_pep")).toBe(false);
  });

  test("rejects path separators and dots", () => {
    expect(isValidSlug("a/b")).toBe(false);
    expect(isValidSlug("..")).toBe(false);
  });

  test("rejects the empty string (regex requires ≥1 char)", () => {
    expect(isValidSlug("")).toBe(false);
  });

  test("anything isValidSlug accepts survives sanitizeSlug unchanged", () => {
    // a valid kebab slug contains no /, \, or . so sanitize is a no-op —
    // the two guards are consistent, not contradictory
    for (const s of ["barcelona-cal-pep", "post-01", "abc"]) {
      expect(isValidSlug(s)).toBe(true);
      expect(sanitizeSlug(s)).toBe(s);
    }
  });

  test("KEBAB_CASE is anchored at both ends", () => {
    expect(KEBAB_CASE.source).toBe("^[a-z0-9-]+$");
  });
});
