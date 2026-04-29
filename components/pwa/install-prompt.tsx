"use client";

import { useEffect, useState } from "react";
import { Download, Plus, Share, X } from "lucide-react";

import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

const DISMISSED_KEY = "Kaua's .install-prompt.dismissed-at";
const DISMISS_DURATION_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari
  if (
    "standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  ) {
    return true;
  }
  return false;
}

function isIos() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
}

function recentlyDismissed() {
  if (typeof window === "undefined") return false;
  const raw = window.localStorage.getItem(DISMISSED_KEY);
  if (!raw) return false;
  const at = Number(raw);
  if (!Number.isFinite(at)) return false;
  return Date.now() - at < DISMISS_DURATION_MS;
}

export function InstallPrompt() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [showIos, setShowIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    if (recentlyDismissed()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setHidden(false);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIos()) {
      // Delay so the app shell renders first; one-time-ish hint
      const id = window.setTimeout(() => {
        setShowIos(true);
        setHidden(false);
      }, 4000);
      return () => {
        window.clearTimeout(id);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      };
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
    };
  }, []);

  if (!isMobile) return null;
  if (hidden) return null;
  if (!deferred && !showIos) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
  };

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setHidden(true);
      } else {
        dismiss();
      }
    } catch {
      dismiss();
    } finally {
      setDeferred(null);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-x-3 z-40 md:hidden",
        "rounded-2xl border border-border/70 bg-background/85 p-3 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.35)] backdrop-blur-xl"
      )}
      style={{
        bottom: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom) + 12px)",
      }}
      role="dialog"
      aria-label="Install Kaua's "
    >
      <div className="flex items-start gap-3">
        <div className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Download className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Add Kaua's  to home screen</p>
          {deferred ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Open the family album in one tap, with offline support.
            </p>
          ) : (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              Tap <Share className="-mt-0.5 inline size-3.5 align-middle" />{" "}
              Share, then{" "}
              <span className="inline-flex items-center gap-1 align-middle">
                <Plus className="size-3.5" />
                Add to Home Screen
              </span>
              .
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          onClick={dismiss}
          className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent"
        >
          <X className="size-4" />
        </button>
      </div>

      {deferred && (
        <button
          type="button"
          onClick={install}
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground active:scale-[0.98] touch-manipulation"
        >
          Install
        </button>
      )}
    </div>
  );
}
