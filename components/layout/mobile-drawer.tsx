"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  Home,
  Images,
  LogIn,
  LogOut,
  Settings,
  Sparkles,
  Star,
  Upload,
  UserPlus,
} from "lucide-react";
import { Show, useClerk } from "@clerk/nextjs";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { uploadStore } from "@/lib/upload-store";
import { haptics } from "@/lib/haptics";

type DrawerItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
};

const primary: DrawerItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/gallery", label: "Gallery", icon: Images },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/highlights", label: "Highlights", icon: Star },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const pathname = usePathname() || "/";
  const { signOut } = useClerk();

  const handleNavigate = () => {
    haptics.tap();
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex flex-col gap-0 p-0"
        showHandle={false}
      >
        <SheetHeader className="border-b border-border/60 px-5 pb-4 pt-6">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4 text-primary" />
            Kaua's 
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Private family memories, kept beautifully.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Library
          </p>
          <nav className="flex flex-col gap-1">
            {primary.map((item) => (
              <DrawerLink
                key={item.href}
                item={item}
                active={
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href ?? "")
                }
                onSelect={handleNavigate}
              />
            ))}
          </nav>

          <p className="mt-6 px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Quick actions
          </p>
          <button
            type="button"
            onClick={() => {
              handleNavigate();
              uploadStore.open();
            }}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Upload className="size-4" />
            </span>
            Upload memory
          </button>
        </div>

        <div className="border-t border-border/60 bg-background/80 px-3 py-3 backdrop-blur-md">
          <Show when="signed-in">
            <button
              type="button"
              onClick={async () => {
                haptics.tap();
                onOpenChange(false);
                await signOut();
              }}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <LogOut className="size-4" />
              </span>
              Sign out
            </button>
          </Show>

          <Show when="signed-out">
            <Link
              href="/sign-in"
              prefetch
              onClick={handleNavigate}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <LogIn className="size-4" />
              </span>
              Sign in
            </Link>
            <Link
              href="/sign-up"
              prefetch
              onClick={handleNavigate}
              className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
            >
              <span className="inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <UserPlus className="size-4" />
              </span>
              Create family space
            </Link>
          </Show>

          <Link
            href="/settings"
            prefetch
            onClick={handleNavigate}
            className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Settings className="size-3.5" />
            Settings & privacy
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function DrawerLink({
  item,
  active,
  onSelect,
}: {
  item: DrawerItem;
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;
  if (!item.href) return null;
  return (
    <Link
      href={item.href}
      prefetch
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-foreground/85 hover:bg-accent hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-xl",
          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="size-4" />
      </span>
      {item.label}
    </Link>
  );
}
