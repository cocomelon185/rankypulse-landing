/**
 * Email validation for forms.
 * Accepts common valid formats; rejects obviously invalid.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  const trimmed = value.trim();
  if (trimmed.length > 254) return false;
  return EMAIL_REGEX.test(trimmed);
}
