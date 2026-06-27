/**
 * Masks the local part of an email for display in OTP / confirmation copy,
 * e.g. "rajesh@abcpoultry.com" → "ra•••@abcpoultry.com". Purely cosmetic —
 * it avoids showing the full address on screen while keeping it recognisable.
 */
export const maskEmail = (email: string): string => {
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 0) {
    return trimmed;
  }

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);
  const visible = local.slice(0, Math.min(2, local.length));

  return `${visible}${'•'.repeat(Math.max(local.length - visible.length, 1))}${domain}`;
};
