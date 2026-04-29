import Link from "next/link";
import { Home, ImageOff } from "lucide-react";

import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6">
        <section className="glass mx-auto w-full max-w-2xl rounded-3xl p-8 text-center sm:p-12">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ImageOff className="size-8" aria-hidden />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            404 error
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            This memory page was not found
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            The link may be broken, or this page may have moved. Head back home
            and continue exploring your family gallery.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href="/">
                <Home className="size-4" />
                Back to home
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/gallery">Browse gallery</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
