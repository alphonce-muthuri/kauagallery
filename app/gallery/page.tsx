import { Filter, SlidersHorizontal } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { OpenUploadButton } from "@/components/gallery/open-upload-button";
import { Button } from "@/components/ui/button";
import { getPhotos } from "@/lib/data";

export default async function GalleryPage() {
  const photos = await getPhotos();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <Sidebar />

        <section className="flex-1 min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Gallery
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">
                All family memories
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {photos.length} photos across every album and person.
              </p>
            </div>
            <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 scrollbar-none">
              <Button variant="outline" size="sm" className="shrink-0">
                <Filter className="size-4" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="shrink-0">
                <SlidersHorizontal className="size-4" /> Sort
              </Button>
              <div className="hidden sm:block">
                <OpenUploadButton />
              </div>
            </div>
          </div>

          <MasonryGrid photos={photos} />
        </section>
      </main>
      <Footer />
    </>
  );
}
