import { Heart } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { FavoritesSection } from "@/components/gallery/favorites-section";
import { getPhotos } from "@/lib/data";

export const metadata = { title: "Favorites · Kaua's " };

export default async function FavoritesPage() {
  const photos = await getPhotos();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-4 py-6 sm:px-6">
        <Sidebar />

        <section className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur-md">
              <Heart className="size-3.5 text-primary" />
              Your hearted memories
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Favorites
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Photos that keep making you smile.
            </p>
          </div>

          <FavoritesSection photos={photos} />
        </section>
      </main>
      <Footer />
    </>
  );
}
