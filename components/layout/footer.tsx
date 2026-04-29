import Link from "next/link";
import { cacheLife } from "next/cache";
import { Logo } from "./logo";

const NAV_LINKS = [
  { href: "/gallery",    label: "Gallery"    },
  { href: "/albums",     label: "Albums"     },
  { href: "/highlights", label: "Highlights" },
  { href: "/favorites",  label: "Favorites"  },
  { href: "/family",     label: "Family"     },
  { href: "/upload",     label: "Upload"     },
];

export async function Footer() {
  "use cache";
  cacheLife("max");
  return (
    <footer className="relative mt-24 overflow-hidden bg-[#0a0a0a]">
      {/* subtle warm glow at the top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/40 to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-56 w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 py-14 sm:px-8">
        {/* top row */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* brand */}
          <div className="flex flex-col gap-3 max-w-xs">
            <Logo className="text-white [&_span:last-child]:text-white" />
            <p className="text-[13px] leading-relaxed text-white/40">
              A private sanctuary for the Kaua family - rooted in faith, rich in love.
            </p>
          </div>

          {/* nav */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3 md:justify-end">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] font-medium text-white/40 transition-colors duration-150 hover:text-white/90"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        {/* divider */}
        <div className="my-10 h-px bg-white/[0.06]" />

        {/* bottom row */}
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-white/25">
            © {new Date().getFullYear()} Kaua Family · All rights reserved.
          </p>
          <p className="text-[12px] text-white/25 italic">
            God is good, all the time.
          </p>
        </div>
      </div>
    </footer>
  );
}
