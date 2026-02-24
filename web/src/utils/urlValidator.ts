/**
 * Secure URL validation - prevents XSS attacks via malformed URLs
 */
export function isValidUrl(text: string): boolean {
  if (!text || typeof text !== 'string') return false;

  try {
    // Only allow http/https protocols
    const url = new URL(text.startsWith('http') ? text : `https://${text}`);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    // Fallback for domain-only strings (e.g., "example.com")
    return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(text);
  }
}
