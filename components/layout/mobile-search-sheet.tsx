"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

interface MobileSearchSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const suggestions = [
  "Christmas",
  "Sunday lunch",
  "Mama Nkiro",
  "School day",
  "Birthdays",
  "Weekend mornings",
];

export function MobileSearchSheet({
  open,
  onOpenChange,
}: MobileSearchSheetProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="full"
        className="bg-background p-0"
        showCloseButton={false}
        showHandle={false}
      >
        <SheetTitle className="sr-only">Search memories</SheetTitle>
        <div className="flex items-center gap-2 border-b border-border/70 px-3 py-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder="Search memories, people, places…"
              className="h-11 w-full rounded-full bg-muted/50 pl-9 text-base"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  const value = (event.target as HTMLInputElement).value.trim();
                  if (value) {
                    router.push(`/gallery?q=${encodeURIComponent(value)}`);
                    onOpenChange(false);
                  }
                }
              }}
            />
          </div>
          <SheetClose className="inline-flex size-11 items-center justify-center rounded-full text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <X className="size-5" />
            <span className="sr-only">Close search</span>
          </SheetClose>
        </div>

        <div className="px-5 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Try searching
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                className="rounded-full border border-border bg-background/60 px-3 py-1.5 text-sm text-foreground/80 transition-colors hover:bg-accent"
                onClick={() => {
                  router.push(`/gallery?q=${encodeURIComponent(s)}`);
                  onOpenChange(false);
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
