"use client";

import { Cloud, Heart, Lock, Users } from "lucide-react";
import { useRef, useState } from "react";

const features = [
  {
    icon: Heart,
    title: "Rooted in faith",
    description:
      "Every memory here is a testament to God's faithfulness -from Sunday worship to quiet weekday blessings.",
    accent: true,
  },
  {
    icon: Users,
    title: "For the whole family",
    description:
      "Every member can add memories from their own phone, any time.",
    accent: false,
  },
  {
    icon: Lock,
    title: "Private by default",
    description:
      "Only family sees what's inside. No public feeds, no ads.",
    accent: false,
  },
  {
    icon: Cloud,
    title: "Safe and always there",
    description:
      "Every photo is backed up securely -versioned and easy to export.",
    accent: false,
  },
] as const;

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50 });
  const [hovered, setHovered] = useState(false);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative cursor-default select-none rounded-2xl p-5 transition-all duration-500 ease-out"
      style={{
        background: hovered
          ? `radial-gradient(260px circle at ${spotlight.x}% ${spotlight.y}%, color-mix(in oklch, var(--primary) 8%, transparent), transparent 60%)`
          : "transparent",
      }}
    >
      {/* Glass border reveal */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-all duration-500"
        style={{
          border: hovered
            ? "1px solid color-mix(in oklch, var(--foreground) 10%, transparent)"
            : "1px solid transparent",
          boxShadow: hovered
            ? "0 16px 48px -16px color-mix(in oklch, var(--primary) 12%, transparent)"
            : "none",
          background: hovered
            ? "color-mix(in oklch, var(--card) 80%, transparent)"
            : "transparent",
          backdropFilter: hovered ? "saturate(160%) blur(16px)" : "none",
          WebkitBackdropFilter: hovered ? "saturate(160%) blur(16px)" : "none",
        }}
      />

      {/* Mesh grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-500"
        style={{
          opacity: hovered ? 1 : 0,
          backgroundImage: `
            linear-gradient(color-mix(in oklch, var(--primary) 12%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in oklch, var(--primary) 12%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          maskImage: `radial-gradient(ellipse 80% 80% at ${spotlight.x}% ${spotlight.y}%, black 30%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(ellipse 80% 80% at ${spotlight.x}% ${spotlight.y}%, black 30%, transparent 100%)`,
        }}
      />

      <div className="relative">
        <span
          className={`inline-flex size-9 items-center justify-center rounded-xl transition-all duration-300 ${
            accent
              ? "brand-gradient text-white shadow-sm"
              : "bg-gradient-to-br from-primary/15 to-primary/5 text-primary group-hover:from-primary/20 group-hover:to-primary/8"
          }`}
        >
          <Icon className="size-4" />
        </span>

        <h3 className="mt-3 text-[14px] font-semibold tracking-tight">
          {title}
        </h3>

        <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-[1400px] px-3 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Built for family
        </p>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-tight sm:text-3xl">
          A place blessed with purpose.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Because the moments God gives us are worth more than a phone camera roll.
        </p>
      </div>

      <div className="mt-6 grid gap-0.5 sm:mt-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => (
          <FeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            accent={f.accent}
          />
        ))}
      </div>

      <div className="mt-2 rounded-xl border border-border/40 bg-muted/20 px-5 py-4 text-center">
        <p className="text-sm font-medium">
          &ldquo;His mercies are new every morning -great is Your faithfulness.&rdquo;
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Lamentations 3:23</p>
      </div>
    </section>
  );
}
