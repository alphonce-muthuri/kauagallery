"use client";

import Image from "next/image";
import { Heart, ImageIcon } from "lucide-react";

import { cn, formatDate } from "@/lib/utils";
import { useFavorites } from "@/lib/use-favorites";
import { haptics } from "@/lib/haptics";
import type { Photo } from "@/sanity/queries";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface PhotoCardProps {
  photo: Photo;
  priority?: boolean;
  onOpen: () => void;
  onSetAsCover?: () => void;
}

export function PhotoCard({ photo, priority, onOpen, onSetAsCover }: PhotoCardProps) {
  const { has, toggle } = useFavorites();
  const liked = has(photo._id);

  const aspect = photo.dimensions?.aspectRatio || 1;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        haptics.tap();
        onOpen();
      }}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        haptics.tap();
        onOpen();
      }}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[var(--radius-xl)] bg-muted text-left",
        "shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_14px_28px_-16px_rgba(0,0,0,0.25)]",
        "transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]",
        "hover:-translate-y-0.5 active:scale-[0.99]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "touch-manipulation cursor-pointer"
      )}
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={photo.imageUrl}
        alt={photo.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        placeholder={photo.lqip ? "blur" : undefined}
        blurDataURL={photo.lqip}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* Gradient: hidden on mobile, revealed on desktop hover */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/55 via-black/10 to-transparent opacity-0 md:transition-opacity md:duration-300 md:group-hover:opacity-100" />

      {/* Bottom meta -hidden on mobile, hover-reveal on desktop */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-3 transition-all duration-300 sm:p-4",
          "opacity-0",
          "md:translate-y-2 md:group-hover:translate-y-0 md:group-hover:opacity-100"
        )}
      >
        <p className="line-clamp-1 text-[13px] font-semibold text-white drop-shadow sm:text-sm">
          {photo.title}
        </p>
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/80 sm:text-[11px]">
          <Avatar className="size-4 ring-1 ring-white/40 sm:size-5">
            <AvatarFallback className="text-[8px] sm:text-[9px]">
              {photo.uploader?.name?.[0] ?? "F"}
            </AvatarFallback>
          </Avatar>
          <span className="line-clamp-1">{photo.uploader?.name ?? "Family"}</span>
          {photo.takenAt && (
            <>
              <span className="opacity-40">•</span>
              <span className="hidden xs:inline">{formatDate(photo.takenAt)}</span>
            </>
          )}
        </div>
      </div>

      {/* Bottom right: favorite -on top of meta */}
      <button
        type="button"
        aria-label={liked ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.stopPropagation();
          haptics.light();
          toggle(photo._id);
        }}
        className={cn(
          "absolute bottom-2 right-2 z-10 inline-flex items-center justify-center rounded-full",
          "transition-all active:scale-90 touch-manipulation",
          liked ? "text-red-500" : "text-white/80"
        )}
      >
        <Heart className={cn("size-5", liked && "fill-current")} />
      </button>

      {/* Bottom left: set as album cover -only shown when handler is provided */}
      {onSetAsCover && (
        <button
          type="button"
          aria-label="Set as album cover"
          title="Set as album cover"
          onClick={(e) => {
            e.stopPropagation();
            haptics.light();
            onSetAsCover();
          }}
          className={cn(
            "absolute bottom-2 left-2 z-10 inline-flex items-center gap-1 rounded-full px-2 py-1",
            "bg-black/50 text-[10px] font-medium text-white/90 backdrop-blur-sm",
            "opacity-0 transition-all duration-200 group-hover:opacity-100",
            "active:scale-95 touch-manipulation"
          )}
        >
          <ImageIcon className="size-3" />
          <span>Set cover</span>
        </button>
      )}
    </div>
  );
}
