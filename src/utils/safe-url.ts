// Allowed URL schemes for user-controlled URLs opened via window.open.
const ALLOWED_SCHEMES = new Set(['http:', 'https:', 'mailto:', 'tel:']);

/**
 * Validate that a URL uses an allowed scheme to prevent javascript:/data:
 * injection attacks.
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.href);
    return ALLOWED_SCHEMES.has(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Safely open a URL in a new window/tab, blocking unsafe schemes and always
 * including rel-exposure mitigation flags.
 */
export function safeOpenWindow(
  url: string | undefined | null,
  target: string = '_blank',
  features: string = 'noopener,noreferrer'
): void {
  if (!url) {
    return;
  }
  if (!isSafeUrl(url)) {
    // eslint-disable-next-line no-console
    console.warn(`Blocked unsafe URL scheme: ${url}`);
    return;
  }
  window.open(url, target, features);
}
