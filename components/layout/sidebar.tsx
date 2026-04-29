import Link from "next/link";
import {
  Album,
  Heart,
  Home,
  Images,
  Star,
  Upload,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/albums", label: "Albums", icon: Album },
  { href: "/family", label: "Family", icon: Users },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/highlights", label: "Highlights", icon: Star },
  { href: "/upload", label: "Upload", icon: Upload },
];

export function Sidebar({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "glass sticky top-24 hidden h-[calc(100vh-7rem)] w-60 flex-col gap-1 rounded-2xl p-3 lg:flex",
        className
      )}
    >
      <div className="px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Library
        </p>
      </div>
      {items.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent/70 hover:text-foreground"
        >
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-background/60 text-primary shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <Icon className="size-4" />
          </span>
          {label}
        </Link>
      ))}
      <div className="mt-auto rounded-xl border border-border bg-background/50 p-3">
        <p className="text-xs font-medium">Kaua Family</p>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
          Rooted in faith. Every memory here is a gift from God.
        </p>
      </div>
    </aside>
  );
}
