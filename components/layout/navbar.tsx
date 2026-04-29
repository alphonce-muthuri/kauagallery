"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Search, Upload } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { MobileDrawer } from "./mobile-drawer";
import { MobileSearchSheet } from "./mobile-search-sheet";

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      if (currentY < 10) {
        setHidden(false);
      } else if (delta > 6 && !isMobile) {
        // Only auto-hide on desktop; on mobile keep header reachable
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }

      lastY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-transform duration-300 ease-out will-change-transform pt-safe",
          hidden ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <div className="mx-auto max-w-[1400px] px-3 pt-3 sm:px-6 sm:pt-4">
          <div className="glass flex h-14 items-center gap-2 rounded-2xl px-2 sm:gap-3 sm:px-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent md:hidden touch-manipulation"
            >
              <Menu className="size-5" />
            </button>

            <Logo />

            <nav className="ml-4 hidden items-center gap-1 md:flex">
              <Link
                href="/gallery"
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Gallery
              </Link>
              <Link
                href="/albums"
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Albums
              </Link>
              <Link
                href="/family"
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Family
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-1 sm:gap-2">
              <div className="relative hidden md:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search memories…"
                  className="h-9 w-64 pl-9 bg-background/60"
                />
              </div>

              <button
                type="button"
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="inline-flex size-10 items-center justify-center rounded-full text-foreground/80 transition-colors hover:bg-accent md:hidden touch-manipulation"
              >
                <Search className="size-5" />
              </button>

              <Show when="signed-in">
                <Button asChild size="sm" className="hidden sm:inline-flex">
                  <Link href="/upload">
                    <Upload className="size-4" />
                    Upload
                  </Link>
                </Button>
                <div className="ml-1">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          "size-9 ring-2 ring-background shadow-sm rounded-full",
                      },
                    }}
                  />
                </div>
              </Show>

              <Show when="signed-out">
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/sign-up">Get started</Link>
                </Button>
              </Show>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer open={drawerOpen} onOpenChange={setDrawerOpen} />
      <MobileSearchSheet open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
