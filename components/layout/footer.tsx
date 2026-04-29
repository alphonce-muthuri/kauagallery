import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-background/60 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted-foreground">
            The Kaua family -rooted in faith, rich in love.
          </p>
        </div>
        <nav className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
          <Link href="/gallery" className="hover:text-foreground">Gallery</Link>
          <Link href="/albums" className="hover:text-foreground">Albums</Link>
          <Link href="/family" className="hover:text-foreground">Family</Link>
          <Link href="/upload" className="hover:text-foreground">Upload</Link>
        </nav>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Kaua Family · God is good, all the time.
        </p>
      </div>
    </footer>
  );
}
