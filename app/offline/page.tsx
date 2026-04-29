import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Offline -Kaua's ",
  description: "You're offline. We'll pick up where you left off when you're back.",
};

export default function OfflinePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-20">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-background/80 p-10 text-center shadow-xl backdrop-blur-xl">
        <div className="mx-auto mb-6 h-20 w-20 overflow-hidden rounded-2xl">
          <Image
            src="/icons/icon-192.png"
            alt="Kaua's "
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          You&apos;re offline
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          No internet connection was found. Any photos you&apos;ve already viewed
          are still available, and we&apos;ll refresh the rest as soon as
          you&apos;re back online.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Try again
        </Link>
      </div>
    </main>
  );
}
