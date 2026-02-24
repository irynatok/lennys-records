/**
 * Modal dimension constants
 * Single source of truth for consistent modal sizing across the app
 */

export const MODAL_DIMENSIONS = {
  /** Standard modal width */
  MAX_WIDTH: '580px',
  /** Standard modal height */
  MAX_HEIGHT: '88vh',
  /** Padding around modals on mobile */
  MOBILE_PADDING: '16px',
  /** Padding around modals on desktop */
  DESKTOP_PADDING: '64px 24px',
} as const;
