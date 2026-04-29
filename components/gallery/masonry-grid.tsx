"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import type { Photo } from "@/sanity/queries";
import { PhotoCard } from "./photo-card";
import { PhotoLightbox } from "./photo-lightbox";

interface MasonryGridProps {
  photos: Photo[];
  albumId?: string;
}

// [minWidthPx, columnCount, gap]
const BREAKPOINTS: Array<[number, number, number]> = [
  [1280, 4, 16],
  [1024, 3, 16],
  [640, 3, 12],
  [420, 2, 8],
  [0, 2, 8],
];

function getLayout(width: number) {
  for (const [minWidth, cols, gap] of BREAKPOINTS) {
    if (width >= minWidth) return { cols, gap };
  }
  return { cols: 2, gap: 8 };
}

export function MasonryGrid({ photos, albumId }: MasonryGridProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ cols: 4, gap: 16 });
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  async function handleSetAsCover(photo: Photo) {
    if (!albumId || !photo.imageAssetId) return;
    const toastId = toast.loading("Setting album cover…");
    try {
      const res = await fetch(`/api/update-album?id=${albumId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverAssetId: photo.imageAssetId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Failed (${res.status})`);
      toast.success("Album cover updated!", { id: toastId });
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Couldn't update cover", { id: toastId, description: message });
    }
  }

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      setLayout(getLayout(el.clientWidth));
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Distribute photos into columns using shortest-column-first (true masonry).
  // Track the original index so the lightbox can navigate the full ordered list.
  const columns = useMemo(() => {
    const cols: { photo: Photo; index: number }[][] = Array.from(
      { length: layout.cols },
      () => []
    );
    const heights = new Array(layout.cols).fill(0);

    photos.forEach((photo, index) => {
      const aspect = photo.dimensions?.aspectRatio || 1;
      const relativeHeight = 1 / aspect;

      let shortest = 0;
      for (let i = 1; i < layout.cols; i++) {
        if (heights[i] < heights[shortest]) shortest = i;
      }

      cols[shortest].push({ photo, index });
      heights[shortest] += relativeHeight;
    });

    return cols;
  }, [photos, layout.cols]);

  if (!photos?.length) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-dashed border-border text-sm text-muted-foreground">
        No memories yet -upload your first photo to get started.
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="flex w-full items-start"
        style={{ gap: layout.gap }}
      >
        {columns.map((column, colIdx) => (
          <div
            key={colIdx}
            className="flex min-w-0 flex-1 flex-col"
            style={{ gap: layout.gap }}
          >
            {column.map(({ photo, index }, idx) => (
              <PhotoCard
                key={photo._id}
                photo={photo}
                priority={colIdx === 0 && idx === 0}
                onOpen={() => setActiveIndex(index)}
                onSetAsCover={
                  albumId && photo.imageAssetId
                    ? () => handleSetAsCover(photo)
                    : undefined
                }
              />
            ))}
          </div>
        ))}
      </div>

      <PhotoLightbox
        photos={photos}
        index={activeIndex}
        onIndexChange={setActiveIndex}
      />
    </>
  );
}
