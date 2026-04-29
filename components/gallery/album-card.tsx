import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

import type { Album } from "@/sanity/queries";

export function AlbumCard({ album }: { album: Album }) {
  return (
    <Link
      href={`/albums/${album.slug}`}
      className="mac-card group relative block overflow-hidden rounded-[var(--radius-xl)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {album.coverUrl ? (
          <Image
            src={album.coverUrl}
            alt={album.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <ImageIcon className="size-8" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] opacity-80">
            {album.photoCount} {album.photoCount === 1 ? "photo" : "photos"}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            {album.title}
          </h3>
          {album.description && (
            <p className="mt-1 line-clamp-1 text-xs opacity-80">
              {album.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
