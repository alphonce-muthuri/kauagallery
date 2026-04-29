"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Album, Home, Images, Plus, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { uploadStore } from "@/lib/upload-store";
import { haptics } from "@/lib/haptics";

type TabItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string) => boolean;
};

const tabs: TabItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
    isActive: (p) => p === "/",
  },
  {
    href: "/gallery",
    label: "Gallery",
    icon: Images,
    isActive: (p) => p.startsWith("/gallery"),
  },
  {
    href: "/albums",
    label: "Albums",
    icon: Album,
    isActive: (p) => p.startsWith("/albums"),
  },
  {
    href: "/family",
    label: "Family",
    icon: Users,
    isActive: (p) => p.startsWith("/family"),
  },
];

export function MobileTabBar() {
  const pathname = usePathname() || "/";

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 md:hidden",
        "border-t border-border/70 bg-background/85 backdrop-blur-xl",
        "pb-safe"
      )}
      style={{ height: "calc(var(--bottom-nav-h) + env(safe-area-inset-bottom))" }}
    >
      <ul className="mx-auto grid h-[var(--bottom-nav-h)] max-w-[640px] grid-cols-5 items-stretch px-2">
        {tabs.slice(0, 2).map((tab) => (
          <TabLink key={tab.href} tab={tab} active={tab.isActive(pathname)} />
        ))}

        <li className="flex items-center justify-center">
          <button
            type="button"
            aria-label="Upload memory"
            onClick={() => {
              haptics.tap();
              uploadStore.open();
            }}
            className={cn(
              "relative -mt-5 inline-flex size-14 items-center justify-center rounded-full",
              "bg-gradient-to-br from-primary via-primary to-orange-600 text-primary-foreground",
              "shadow-[0_12px_28px_-8px_rgba(234,88,12,0.55),inset_0_1px_0_rgba(255,255,255,0.4)]",
              "ring-4 ring-background transition-transform active:scale-95 touch-manipulation"
            )}
          >
            <Plus className="size-6" strokeWidth={2.5} />
          </button>
        </li>

        {tabs.slice(2).map((tab) => (
          <TabLink key={tab.href} tab={tab} active={tab.isActive(pathname)} />
        ))}
      </ul>
    </nav>
  );
}

function TabLink({ tab, active }: { tab: TabItem; active: boolean }) {
  const Icon = tab.icon;
  return (
    <li className="contents">
      <Link
        href={tab.href}
        prefetch
        onClick={() => haptics.tap()}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] font-medium",
          "transition-colors touch-manipulation",
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
        aria-current={active ? "page" : undefined}
      >
        <span
          className={cn(
            "relative inline-flex size-9 items-center justify-center rounded-2xl transition-all",
            active && "bg-primary/10"
          )}
        >
          <Icon className={cn("size-5 transition-transform", active && "scale-110")} />
        </span>
        <span className="leading-none">{tab.label}</span>
      </Link>
    </li>
  );
}
