import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/home/hero";
import { FeatureGrid } from "@/components/home/feature-grid";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { getPhotos } from "@/lib/data";

export default async function HomePage() {
  const photos = await getPhotos();

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero photos={photos} />

        <section className="mx-auto max-w-[1400px] px-3 pb-6 sm:px-6 sm:pb-8">
          <div className="mb-4 flex items-end justify-between sm:mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary pt-5">
                Latest memories
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-3xl">
                Recent blessings
              </h2>
            </div>
            <p className="hidden text-sm text-muted-foreground sm:block">
              The newest moments from Kaua, Alphonce, Mama Nkiro, Zamzam, Kawira, Muchai & the family.
            </p>
          </div>
          <MasonryGrid photos={photos.slice(0, 12)} />
        </section>

        <FeatureGrid />
      </main>
      <Footer />
    </>
  );
}
