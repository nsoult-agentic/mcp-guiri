/**
 * Pure slug helpers — path sanitization and kebab-case validation.
 *
 * Extracted from nextcloud.ts (sanitizeSlug) and http.ts (the create-post
 * regex) so the security-critical, deterministic logic can be unit-tested
 * without touching the network. Behavior is unchanged from the originals.
 */

/** Kebab-case pattern enforced by the guiri-create-post tool. */
export const KEBAB_CASE = /^[a-z0-9-]+$/;

/** True when `slug` is valid kebab-case (lowercase letters, digits, hyphens). */
export function isValidSlug(slug: string): boolean {
  return KEBAB_CASE.test(slug);
}

/**
 * Strip characters that could escape the intended folder when a slug is
 * interpolated into a Nextcloud path. Removes `/`, `\`, `.` (the class
 * `[/\\..]`) and then any remaining `..` sequences.
 */
export function sanitizeSlug(slug: string): string {
  return slug.replace(/[/\\..]/g, "").replace(/\.\./g, "");
}
