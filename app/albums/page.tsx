import { Plus } from "lucide-react";
import { Suspense } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { AlbumCardWrapper } from "@/components/gallery/album-card-wrapper";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getAlbumsPaginated } from "@/lib/data";

const PAGE_SIZE = 12;

function parsePage(page?: string) {
  const parsed = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export default async function AlbumsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <Sidebar />
        <Suspense
          fallback={
            <section className="flex-1 min-w-0">
              <div className="h-28 rounded-2xl border border-border/50 bg-muted/20" />
              <div className="mt-6 h-[360px] rounded-2xl border border-border/50 bg-muted/20" />
            </section>
          }
        >
          <AlbumsContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function AlbumsContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = parsePage(page);
  const pagination = await getAlbumsPaginated(currentPage, PAGE_SIZE);
  const albums = pagination.items;

  return (
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
            {pagination.total} total albums.
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
      <PaginationControls
        basePath="/albums"
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
      />
    </section>
  );
}
