import { Sparkles, Star } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { getPhotos } from "@/lib/data";

export const metadata = { title: "Highlights · Kaua's " };

export default async function HighlightsPage() {
  const photos = await getPhotos();
  // A curated "best of" -every third photo until editorial picks are wired.
  const highlights = photos.filter((_, i) => i % 3 === 0);

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 sm:px-6">
        <Sidebar />

        <section className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
              <Sparkles className="size-3.5 text-primary" />
              A curated reel
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Highlights
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The year&apos;s best moments, gathered in one place.
            </p>
          </div>

          {highlights.length > 0 ? (
            <MasonryGrid photos={highlights} />
          ) : (
            <div className="mac-card flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl p-10 text-center">
              <Star className="size-8 text-primary" />
              <p className="text-sm font-medium">No highlights yet</p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Add more memories and we&apos;ll start surfacing your best moments here.
              </p>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
