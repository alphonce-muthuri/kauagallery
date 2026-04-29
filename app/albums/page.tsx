import { Plus } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { AlbumCardWrapper } from "@/components/gallery/album-card-wrapper";
import { Button } from "@/components/ui/button";
import { getAlbums } from "@/lib/data";

export default async function AlbumsPage() {
  const albums = await getAlbums();

  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <Sidebar />

        <section className="flex-1 min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                Albums
              </p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">
                Your family albums
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Group your favorite memories into beautiful collections.
              </p>
            </div>
            <Button className="self-start sm:self-auto">
              <Plus className="size-4" /> New album
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            {albums.map((album) => (
              <AlbumCardWrapper key={album._id} album={album} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
