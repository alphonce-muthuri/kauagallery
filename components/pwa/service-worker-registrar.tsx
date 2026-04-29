"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      onControllerChange,
    );

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        const promptUpdate = (worker: ServiceWorker) => {
          toast("A new version of Kaua's  is available", {
            description: "Reload to get the latest features.",
            duration: 10_000,
            action: {
              label: "Reload",
              onClick: () => worker.postMessage("SKIP_WAITING"),
            },
          });
        };

        if (registration.waiting) {
          promptUpdate(registration.waiting);
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              promptUpdate(installing);
            }
          });
        });

        // Periodically check for updates (every hour) while the tab is open
        const interval = window.setInterval(() => {
          registration.update().catch(() => undefined);
        }, 60 * 60 * 1000);

        return () => window.clearInterval(interval);
      } catch (error) {
        console.warn("[Kaua's ] service worker registration failed", error);
      }
    };

    const cleanupPromise = register();

    return () => {
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        onControllerChange,
      );
      cleanupPromise?.then((cleanup) => cleanup?.()).catch(() => undefined);
    };
  }, []);

  return null;
}
