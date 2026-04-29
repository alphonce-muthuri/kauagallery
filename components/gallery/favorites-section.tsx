"use client";
import { Heart } from "lucide-react";

import { MasonryGrid } from "./masonry-grid";
import { useFavorites } from "@/lib/use-favorites";
import type { Photo } from "@/sanity/queries";

export function FavoritesSection({ photos }: { photos: Photo[] }) {
  const { has } = useFavorites();

  const favorites = photos.filter((p) => has(p._id));

  if (favorites.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border border-border bg-background/70 p-10 text-center">
        <Heart className="size-8 text-primary" />
        <p className="text-sm font-medium">No favorites yet</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Tap the heart on any memory to keep it close at hand.
        </p>
      </div>
    );
  }

  return <MasonryGrid photos={favorites} />;
}
