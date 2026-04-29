"use client";

import {
  AnimatePresence,
  type MotionProps,
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Cross } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Photo } from "@/sanity/queries";

type HeroProps = {
  photos: Photo[];
};

const SLIDE_INTERVAL_MS = 7000;
const NEXT_SLIDE_DELAY_MS = 800;

type AnimProps = Pick<MotionProps, "initial" | "animate" | "transition">;

export function Hero({ photos }: HeroProps) {
  const reduced = useReducedMotion();
  const slides = useMemo(() => photos.filter((p) => Boolean(p.imageUrl)), [photos]);

  const [current, setCurrent] = useState(0);
  const [nextDisplay, setNextDisplay] = useState(1);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = window.setInterval(
      () => setCurrent((i) => (i + 1) % slides.length),
      SLIDE_INTERVAL_MS,
    );
    return () => window.clearInterval(id);
  }, [slides.length]);

  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  useEffect(() => {
    if (slides.length <= 1) {
      setNextDisplay(0);
      return;
    }
    const target = (current + 1) % slides.length;
    const id = window.setTimeout(() => setNextDisplay(target), NEXT_SLIDE_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [current, slides.length]);

  const active = slides[current];
  const next = slides.length > 1 ? slides[nextDisplay] : undefined;

  const ease = "easeOut" as const;

  const fadeUp = (y: number, delayMs: number): AnimProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.55, ease, delay: delayMs / 1000 },
        };

  const fadeIn = (delayMs: number): AnimProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.5, ease, delay: delayMs / 1000 },
        };

  const slideFromRight = (delayMs: number): AnimProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, x: 32, scale: 0.9 },
          animate: { opacity: 1, x: 0, scale: 1 },
          transition: {
            type: "spring",
            stiffness: 260,
            damping: 22,
            mass: 0.8,
            delay: delayMs / 1000,
          },
        };

  const scaleIn = (delayMs: number): AnimProps =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, scale: 0.6 },
          animate: { opacity: 1, scale: 1 },
          transition: { duration: 0.7, ease, delay: delayMs / 1000 },
        };

  return (
    <section
      aria-label="Hero"
      className="relative w-full overflow-hidden"
      style={{
        // Fill the visible viewport on every device; never collapse on landscape
        // and never grow absurdly tall on large desktops.
        height: "min(900px, max(540px, 90dvh))",
      }}
    >
      {/* ── Full-bleed backdrop: cross-fade + Ken Burns ── */}
      <div className="brand-gradient absolute inset-0">
        <AnimatePresence mode="sync">
          {active?.imageUrl && (
            <motion.div
              key={current}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-0"
                initial={reduced ? undefined : { scale: 1 }}
                animate={reduced ? undefined : { scale: 1.06 }}
                transition={{ duration: SLIDE_INTERVAL_MS / 1000, ease: "linear" }}
              >
                <Image
                  src={active.imageUrl}
                  alt={active.title}
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Cinematic gradient vignette (bottom-up) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(10,6,2,0.93) 0%, rgba(10,6,2,0.68) 28%, rgba(10,6,2,0.22) 54%, transparent 74%)",
        }}
      />

      {/* ── Top fade for nav readability (extends through iOS notch) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: "calc(env(safe-area-inset-top) + 8rem)",
          background:
            "linear-gradient(to bottom, rgba(10,6,2,0.5) 0%, transparent 100%)",
        }}
      />

      {/* ── Brand warm glow overlay ── */}
      <div
        aria-hidden="true"
        className="mac-glow pointer-events-none absolute inset-0 opacity-50"
        style={{ mixBlendMode: "soft-light" }}
      />

      {/* ── Eyebrow badge (top-left) ── */}
      <motion.div
        className="absolute z-10"
        style={{
          top: "calc(env(safe-area-inset-top) + 1.25rem)",
          left: "max(env(safe-area-inset-left), 1.25rem)",
        }}
        {...fadeIn(0)}
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 backdrop-blur-md sm:px-3 sm:py-1.5">
          <Cross className="size-3 text-primary" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">
            God is good
          </span>
        </span>
      </motion.div>

      {/* ── Floating "up next" card (top-right) ── */}
      <motion.div
        className="absolute z-10"
        style={{
          top: "calc(env(safe-area-inset-top) + 4rem)",
          right: "max(env(safe-area-inset-right), 1.25rem)",
        }}
        {...slideFromRight(180)}
      >
        <AnimatePresence mode="wait">
          {next?.imageUrl && (
            <motion.div
              key={nextDisplay}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, x: 20, y: -14, scale: 0.8, rotate: 4 }
              }
              animate={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, x: -8, scale: 0.92, transition: { duration: 0.18 } }
              }
              transition={
                reduced
                  ? { duration: 0.2 }
                  : { type: "spring", stiffness: 340, damping: 24, mass: 0.75 }
              }
            >

              <div className="relative h-[108px] w-[80px] overflow-hidden rounded-2xl shadow-[0_20px_48px_rgba(0,0,0,0.55)] ring-1 ring-white/20 sm:h-[144px] sm:w-[106px]">
                <Image
                  src={next.imageUrl}
                  alt={next.title}
                  fill
                  className="object-cover"
                  sizes="(max-width:639px) 80px, 106px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                  <p className="truncate text-[8px] font-semibold uppercase tracking-[0.14em] text-white/80">
                    {next.title ?? "Up next"}
                  </p>
                </div>
                {/* Progress bar -fills across the slide duration */}
                {!reduced && (
                  <motion.div
                    className="absolute inset-x-0 top-0 h-[2px] origin-left bg-primary"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: (SLIDE_INTERVAL_MS - NEXT_SLIDE_DELAY_MS) / 1000,
                      ease: "linear",
                    }}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Bottom content block ──
          Outer .pb-tabbar clears the fixed mobile tabbar + iOS home indicator
          on <md, then resets to 0 on md+. Inner block adds breathing room. */}
      <div className="absolute inset-x-0 bottom-0 z-10 pb-tabbar">
        <div
          className="mx-auto w-full max-w-[1400px] pb-6 sm:pb-8 md:pb-12 lg:pb-16"
          style={{
            paddingLeft: "max(env(safe-area-inset-left), 1.25rem)",
            paddingRight: "max(env(safe-area-inset-right), 1.25rem)",
          }}
        >
          <motion.h1
            className="font-display max-w-[18ch] text-[clamp(1.875rem,7vw,3.75rem)] font-semibold leading-[1.05] tracking-tight text-white"
            {...fadeUp(20, 100)}
          >
            Every blessing,{" "}
            <span
              style={{
                backgroundImage:
                  "linear-gradient(135deg, oklch(0.82 0.18 75), oklch(0.7 0.22 48))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              kept with gratitude.
            </span>
          </motion.h1>

          <motion.div
            className="mt-5 flex flex-wrap items-center gap-2.5 sm:gap-3"
            {...fadeUp(12, 220)}
          >
            <Button asChild size="lg" className="rounded-full">
              <Link href="/gallery">
                Open gallery <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="glass"
              className="glass-strong rounded-full border-white/20 text-white hover:bg-transparent"
            >
              <Link href="/sign-up">Join family</Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* ── Decorative arc rings ── */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-20 h-[280px] w-[280px] rounded-full border border-white/[0.05]"
        {...scaleIn(350)}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-10 h-[190px] w-[190px] rounded-full border border-white/[0.07]"
        {...scaleIn(450)}
      />
    </section>
  );
}
