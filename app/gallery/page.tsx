import { Search } from "lucide-react";
import { Suspense } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { OpenUploadButton } from "@/components/gallery/open-upload-button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { GalleryFilters } from "@/components/gallery/gallery-filters";
import { getPhotosFiltered, getAlbums } from "@/lib/data";

const PAGE_SIZE = 24;

function parsePage(page?: string) {
  const parsed = Number.parseInt(page ?? "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function parseSort(sort?: string): "asc" | "desc" {
  return sort === "asc" ? "asc" : "desc";
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; album?: string }>;
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
          <GalleryContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function GalleryContent({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; album?: string }>;
}) {
  const { page, q, sort, album } = await searchParams;
  const currentPage = parsePage(page);
  const sortOrder = parseSort(sort);
  const query = q?.trim() ?? "";
  const albumSlug = album ?? "";

  const [pagination, albums] = await Promise.all([
    getPhotosFiltered(currentPage, PAGE_SIZE, { q: query, albumSlug, sort: sortOrder }),
    getAlbums(),
  ]);

  const photos = pagination.items;
  const isSearching = query.length > 0;

  const extraParams: Record<string, string> = {};
  if (query) extraParams.q = query;
  if (albumSlug) extraParams.album = albumSlug;
  if (sortOrder !== "desc") extraParams.sort = sortOrder;

  return (
    <section className="flex-1 min-w-0">
      <div className="mb-5 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Gallery
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-4xl">
            {isSearching ? `Results for "${query}"` : "All family memories"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? "photo" : "photos"}
            {isSearching ? " found" : " across every album and person"}.
          </p>
        </div>
        <div className="-mx-1 flex items-center gap-2 overflow-x-auto px-1 scrollbar-none">
          <Suspense>
            <GalleryFilters albums={albums} />
          </Suspense>
          <div className="hidden sm:block">
            <OpenUploadButton />
          </div>
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Search className="mb-4 size-12 text-muted-foreground/40" />
          <p className="text-lg font-medium">
            {isSearching ? "No photos found" : "No photos yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSearching
              ? "Try a different search term or clear the filters."
              : "Upload your first memory to get started."}
          </p>
        </div>
      ) : (
        <>
          <MasonryGrid photos={photos} />
          <PaginationControls
            basePath="/gallery"
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            extraParams={extraParams}
          />
        </>
      )}
    </section>
  );
}
