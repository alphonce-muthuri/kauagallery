"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw } from "lucide-react";

import { useMediaQuery } from "@/lib/use-media-query";
import { usePullToRefresh } from "@/lib/use-pull-to-refresh";
import { haptics } from "@/lib/haptics";
import { cn } from "@/lib/utils";

const THRESHOLD = 72;

export function PullToRefresh() {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const hapticTriggeredRef = useRef(false);

  const { pulling, pullDistance, refreshing } = usePullToRefresh({
    enabled: isMobile,
    threshold: THRESHOLD,
    onRefresh: async () => {
      haptics.success();
      router.refresh();
      // Hold the spinner briefly so the user perceives the refresh
      await new Promise((resolve) => setTimeout(resolve, 600));
    },
  });

  // Light tick when the user crosses the threshold
  useEffect(() => {
    if (pulling && pullDistance >= THRESHOLD && !hapticTriggeredRef.current) {
      haptics.light();
      hapticTriggeredRef.current = true;
    } else if (!pulling || pullDistance < THRESHOLD) {
      hapticTriggeredRef.current = false;
    }
  }, [pulling, pullDistance]);

  if (!isMobile) return null;

  const visible = pulling || refreshing;
  const passed = pullDistance >= THRESHOLD || refreshing;
  const progress = Math.min(1, pullDistance / THRESHOLD);

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center pt-safe transition-opacity",
        visible ? "opacity-100" : "opacity-0"
      )}
      style={{
        transform: `translateY(${Math.min(pullDistance, THRESHOLD) - 8}px)`,
      }}
    >
      <div
        className={cn(
          "mt-1 inline-flex size-10 items-center justify-center rounded-full glass shadow-md transition-transform",
          passed && "scale-110"
        )}
      >
        {refreshing ? (
          <Loader2 className="size-4 animate-spin text-primary" />
        ) : (
          <RefreshCcw
            className="size-4 text-primary transition-transform"
            style={{ transform: `rotate(${progress * 360}deg)` }}
          />
        )}
      </div>
    </div>
  );
}
