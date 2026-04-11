/**
 * Sanitize user input before injecting into AI prompts.
 * Strips control characters and limits length to prevent prompt injection.
 */
export function sanitizeInput(input: unknown, maxLength = 200): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // strip control chars
    .replace(/[{}[\]]/g, "") // strip JSON-like chars
    .trim()
    .slice(0, maxLength);
}

export function sanitizeNumber(input: unknown, min: number, max: number, fallback: number): number {
  const num = Number(input);
  if (isNaN(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}
