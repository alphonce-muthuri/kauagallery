"use client";

function vibrate(pattern: number | number[]) {
  if (typeof window === "undefined") return;
  const nav = window.navigator as Navigator & {
    vibrate?: (p: number | number[]) => boolean;
  };
  if (!nav.vibrate) return;
  try {
    nav.vibrate(pattern);
  } catch {
    /* noop */
  }
}

export const haptics = {
  /** Subtle tap for selection, taps on tabs, button presses. */
  tap: () => vibrate(8),
  /** Light tick for toggles like favorite on. */
  light: () => vibrate(10),
  /** Medium feedback after a successful action. */
  success: () => vibrate([14, 30, 14]),
  /** Warning before destructive action. */
  warn: () => vibrate([30, 40, 30]),
  /** Strong feedback for an error. */
  error: () => vibrate([60, 30, 60]),
};
