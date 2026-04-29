import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { MasonryGrid } from "@/components/gallery/masonry-grid";
import { Button } from "@/components/ui/button";
import { AlbumUploadButton } from "@/components/gallery/album-upload-button";
import { EditAlbumButton } from "@/components/gallery/edit-album-button";
import { DeleteAlbumButton } from "@/components/gallery/delete-album-button";
import { getAlbumBySlug } from "@/lib/data";
import type { Album } from "@/sanity/queries";

export default function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <section className="mx-auto max-w-[1400px] px-3 pt-4 sm:px-6 sm:pt-6">
              <div className="h-8 w-28 rounded-xl bg-muted/30 mb-3 sm:mb-4" />
              <div className="aspect-[5/3] w-full sm:aspect-[5/2] rounded-2xl sm:rounded-3xl bg-muted/20 animate-pulse" />
            </section>
          }
        >
          <AlbumContent params={params} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

async function AlbumContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();

  return (
    <>
      <section className="relative mx-auto max-w-[1400px] px-3 pt-4 sm:px-6 sm:pt-6">
        <Button asChild variant="ghost" size="sm" className="mb-3 sm:mb-4">
          <Link href="/albums">
            <ArrowLeft className="size-4" /> All albums
          </Link>
        </Button>

        <AlbumHero album={album} />
      </section>

      <section className="mx-auto max-w-[1400px] px-3 py-6 sm:px-6 sm:py-10">
        <MasonryGrid photos={album.photos ?? []} albumId={album._id} />
      </section>
    </>
  );
}

function AlbumHero({ album }: { album: Album }) {
  return (
    <div className="mac-card relative overflow-hidden rounded-2xl sm:rounded-3xl">
      <div className="relative aspect-[5/3] w-full sm:aspect-[5/2]">
        {album.coverUrl && (
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:gap-4 sm:p-8">
        <div className="min-w-0 text-white">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-80 sm:text-[11px]">
            Album · {album.photos?.length ?? album.photoCount} photos
          </p>
          <h1 className="mt-1.5 line-clamp-2 text-2xl font-semibold tracking-tight sm:mt-2 sm:text-4xl">
            {album.title}
          </h1>
          {album.description && (
            <p className="mt-1.5 line-clamp-2 max-w-xl text-xs opacity-85 sm:mt-2 sm:line-clamp-none sm:text-sm">
              {album.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <EditAlbumButton album={album} />
          <DeleteAlbumButton
            albumId={album._id}
            albumSlug={album.slug}
            albumTitle={album.title}
          />
          <AlbumUploadButton albumTitle={album.title} />
        </div>
      </div>
    </div>
  );
}
