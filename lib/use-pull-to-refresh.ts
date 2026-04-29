"use client";

import { useEffect, useRef, useState } from "react";

interface Options {
  onRefresh: () => void | Promise<void>;
  /** Distance in px the user must pull before a release triggers refresh. */
  threshold?: number;
  /** Maximum visible pull distance (rubber band cap). */
  maxDistance?: number;
  /** When false, pull-to-refresh is disabled. */
  enabled?: boolean;
}

interface State {
  pulling: boolean;
  pullDistance: number;
  refreshing: boolean;
}

/**
 * Pull-to-refresh hook for the document scroll container.
 * Triggers `onRefresh` when the user pulls past the threshold while at the top.
 */
export function usePullToRefresh({
  onRefresh,
  threshold = 70,
  maxDistance = 120,
  enabled = true,
}: Options): State {
  const [pulling, setPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const startY = useRef<number | null>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (typeof window === "undefined") return;

    const onTouchStart = (e: TouchEvent) => {
      if (refreshing) return;
      // Only initiate when scrolled to top
      if (window.scrollY > 2) {
        startY.current = null;
        return;
      }
      if (e.touches.length !== 1) return;
      startY.current = e.touches[0].clientY;
      activeRef.current = false;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (refreshing) return;
      if (startY.current === null) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy <= 0) return;
      // Activate after a small drag so we don't fight normal scroll
      if (!activeRef.current && dy > 4) activeRef.current = true;
      if (!activeRef.current) return;

      // Rubber-band: ease distance
      const eased = Math.min(maxDistance, dy * 0.55);
      setPulling(true);
      setPullDistance(eased);
    };

    const onTouchEnd = async () => {
      if (refreshing) return;
      if (!activeRef.current) {
        setPulling(false);
        setPullDistance(0);
        startY.current = null;
        return;
      }

      const passed = pullDistance >= threshold;
      activeRef.current = false;
      startY.current = null;

      if (passed) {
        setRefreshing(true);
        setPullDistance(threshold);
        try {
          await onRefresh();
        } finally {
          setRefreshing(false);
          setPulling(false);
          setPullDistance(0);
        }
      } else {
        setPulling(false);
        setPullDistance(0);
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [enabled, refreshing, pullDistance, threshold, maxDistance, onRefresh]);

  return { pulling, pullDistance, refreshing };
}
