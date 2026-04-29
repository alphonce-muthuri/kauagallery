"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  Pencil,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate } from "@/lib/utils";
import { useFavorites } from "@/lib/use-favorites";
import { useMediaQuery } from "@/lib/use-media-query";
import { haptics } from "@/lib/haptics";
import type { Photo } from "@/sanity/queries";
import { EditPhotoDialog } from "@/components/gallery/edit-photo-dialog";

interface PhotoLightboxProps {
  photos: Photo[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

async function downloadPhoto(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank");
  }
}

async function sharePhoto(photo: Photo) {
  const url = window.location.href;
  if (navigator.share) {
    try {
      await navigator.share({
        title: photo.title,
        text: photo.caption ?? photo.title,
        url,
      });
      return;
    } catch {
      return;
    }
  }
  await navigator.clipboard.writeText(url);
  toast.success("Link copied to clipboard!");
}

export function PhotoLightbox({
  photos,
  index,
  onIndexChange,
}: PhotoLightboxProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const open = index !== null;
  const photo = open ? photos[index] : null;

  const handleClose = () => onIndexChange(null);
  const handleNext = () => {
    if (index === null) return;
    if (index < photos.length - 1) {
      haptics.tap();
      onIndexChange(index + 1);
    }
  };
  const handlePrev = () => {
    if (index === null) return;
    if (index > 0) {
      haptics.tap();
      onIndexChange(index - 1);
    }
  };

  if (!open || !photo) return null;

  return isMobile ? (
    <MobileLightbox
      key={photo._id}
      photo={photo}
      photos={photos}
      currentIndex={index}
      onClose={handleClose}
      onPrev={handlePrev}
      onNext={handleNext}
    />
  ) : (
    <DesktopLightbox
      key={photo._id}
      photo={photo}
      open={open}
      onClose={handleClose}
      onPrev={handlePrev}
      onNext={handleNext}
      hasPrev={index > 0}
      hasNext={index < photos.length - 1}
    />
  );
}

/* ------------------------------------------------------------------
 * Desktop: dialog with side panel + arrow navigation.
 * ------------------------------------------------------------------ */
function DesktopLightbox({
  photo,
  open,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  photo: Photo;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { has, toggle } = useFavorites();

  const liked = has(photo._id);

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isOwner = !!user && user.id === photo.uploader?._id;

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "Escape" && expanded) setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onPrev, onNext, expanded]);

  async function handleDelete() {
    setDeleting(true);
    const toastId = toast.loading("Deleting photo…");
    try {
      const res = await fetch(`/api/delete?id=${photo._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error ?? `Delete failed (${res.status})`);
      toast.success("Photo deleted.", { id: toastId });
      onClose();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Delete failed", { id: toastId, description: message });
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      {editing && (
        <EditPhotoDialog
          photo={photo}
          open={editing}
          onOpenChange={setEditing}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Full-screen image overlay */}
      {expanded && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          onClick={() => setExpanded(false)}
        >
          <Image
            src={photo.imageUrl}
            alt={photo.title}
            fill
            sizes="100vw"
            className="object-contain"
            priority
          />
          <button
            type="button"
            aria-label="Close full view"
            onClick={() => setExpanded(false)}
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70"
          >
            <X className="size-5" />
          </button>
          {hasPrev && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onPrev(); }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          {hasNext && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onNext(); }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>
      )}

    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) {
          setConfirming(false);
          if (!next) onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
          <div
            className="relative bg-black/90 aspect-[4/5] md:aspect-auto md:min-h-[560px] cursor-zoom-in"
            onClick={() => setExpanded(true)}
          >
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-contain"
              priority
            />

            {hasPrev && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                aria-label="Previous photo"
                className="absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <ChevronLeft className="size-5" />
              </button>
            )}
            {hasNext && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                aria-label="Next photo"
                className="absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
              >
                <ChevronRight className="size-5" />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4 p-6">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>
                  {photo.uploader?.name?.[0] ?? "F"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-tight">
                  {photo.uploader?.name ?? "Family"}
                </p>
                {photo.takenAt && (
                  <p className="text-xs text-muted-foreground">
                    {formatDate(photo.takenAt)}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-2xl">{photo.title}</DialogTitle>
              {photo.caption && (
                <DialogDescription className="text-[15px] leading-relaxed">
                  {photo.caption}
                </DialogDescription>
              )}
            </div>

            {photo.album && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Album
                </p>
                <p className="mt-1 text-sm font-medium">{photo.album.title}</p>
              </div>
            )}

            {photo.tags && photo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {photo.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "gap-1.5 transition-colors",
                  liked &&
                    "border-red-400 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                )}
                onClick={() => {
                  haptics.light();
                  toggle(photo._id);
                }}
              >
                <Heart className={cn("size-4", liked && "fill-current")} />
                {liked ? "Loved" : "Love"}
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => sharePhoto(photo)}
              >
                <Share2 className="size-4" /> Share
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  downloadPhoto(photo.imageUrl, `${photo.title || "photo"}.jpg`)
                }
              >
                <Download className="size-4" /> Download
              </Button>

              {isOwner && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => setEditing(true)}
                >
                  <Pencil className="size-4" /> Edit
                </Button>
              )}

              {isOwner && !confirming && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    haptics.warn();
                    setConfirming(true);
                  }}
                >
                  <Trash2 className="size-4" /> Delete
                </Button>
              )}

              {isOwner && confirming && (
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    Delete this photo?
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={deleting}
                    onClick={() => setConfirming(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? "Deleting…" : "Yes, delete"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

/* ------------------------------------------------------------------
 * Mobile: full-screen with swipe-next/prev, pull-to-dismiss, double-tap zoom.
 * ------------------------------------------------------------------ */
function MobileLightbox({
  photo,
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo;
  photos: Photo[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const router = useRouter();
  const { user } = useUser();
  const { has, toggle } = useFavorites();

  const liked = has(photo._id);

  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);

  // Pan state
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [zoom, setZoom] = useState(false);

  const startRef = useRef<{
    x: number;
    y: number;
    t: number;
    locked: "x" | "y" | null;
  } | null>(null);
  const lastTapRef = useRef<number>(0);

  const isOwner = !!user && user.id === photo.uploader?._id;

  // Lock body scroll while open (but not when edit dialog is open, it manages its own scroll)
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function onTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1 || zoom) return;
    const t = e.touches[0];
    startRef.current = { x: t.clientX, y: t.clientY, t: Date.now(), locked: null };
    setAnimating(false);
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!startRef.current || e.touches.length !== 1 || zoom) return;
    const t = e.touches[0];
    const dx = t.clientX - startRef.current.x;
    const dy = t.clientY - startRef.current.y;

    if (!startRef.current.locked) {
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
        startRef.current.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
    }

    if (startRef.current.locked === "x") {
      setPanX(dx);
      setPanY(0);
    } else if (startRef.current.locked === "y") {
      // Only allow pull-down to dismiss
      setPanY(Math.max(0, dy));
      setPanX(0);
    }
  }

  function onTouchEnd() {
    const start = startRef.current;
    startRef.current = null;
    if (!start) return;

    const elapsed = Date.now() - start.t;
    setAnimating(true);

    if (start.locked === "x") {
      const w = window.innerWidth;
      const velocity = Math.abs(panX) / Math.max(1, elapsed); // px/ms
      const passDistance = Math.abs(panX) > w * 0.28;
      const passVelocity = velocity > 0.55;

      if ((passDistance || passVelocity) && panX < 0 && currentIndex < photos.length - 1) {
        setPanX(-w);
        window.setTimeout(() => onNext(), 180);
        return;
      }
      if ((passDistance || passVelocity) && panX > 0 && currentIndex > 0) {
        setPanX(w);
        window.setTimeout(() => onPrev(), 180);
        return;
      }
      setPanX(0);
      return;
    }

    if (start.locked === "y") {
      const h = window.innerHeight;
      const passDistance = panY > h * 0.18;
      if (passDistance) {
        haptics.tap();
        setPanY(h);
        window.setTimeout(() => onClose(), 180);
        return;
      }
      setPanY(0);
      return;
    }

    setPanX(0);
    setPanY(0);
  }

  function onTapImage() {
    const now = Date.now();
    const since = now - lastTapRef.current;
    lastTapRef.current = now;
    if (since < 280) {
      // Double tap → toggle zoom
      setZoom((z) => !z);
      haptics.light();
    }
  }

  async function handleDelete() {
    setDeleting(true);
    const toastId = toast.loading("Deleting photo…");
    try {
      const res = await fetch(`/api/delete?id=${photo._id}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(data?.error ?? `Delete failed (${res.status})`);
      haptics.success();
      toast.success("Photo deleted.", { id: toastId });
      onClose();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      haptics.error();
      toast.error("Delete failed", { id: toastId, description: message });
      setConfirming(false);
    } finally {
      setDeleting(false);
    }
  }

  const next = currentIndex < photos.length - 1 ? photos[currentIndex + 1] : null;
  const prev = currentIndex > 0 ? photos[currentIndex - 1] : null;

  // Background dim fades as user pulls down
  const dismissProgress = Math.min(1, panY / (window.innerHeight * 0.4 || 1));
  const overlayOpacity = 1 - dismissProgress * 0.6;
  const contentScale = 1 - dismissProgress * 0.06;

  return (
    <>
      {editing && (
        <EditPhotoDialog
          photo={photo}
          open={editing}
          onOpenChange={setEditing}
          onSuccess={() => router.refresh()}
        />
      )}
    <div
      className="fixed inset-0 z-[60] flex flex-col"
      role="dialog"
      aria-modal="true"
      style={{
        background: `rgba(0,0,0,${overlayOpacity})`,
        transition: animating ? "background 200ms ease-out" : undefined,
      }}
    >
      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 px-3 pt-safe">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex size-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md active:scale-95 touch-manipulation"
        >
          <X className="size-5" />
        </button>
        <p className="rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {currentIndex + 1} / {photos.length}
        </p>
      </div>

      {/* Image stage */}
      <div
        className="relative flex-1 overflow-hidden touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Strip of [prev | current | next] photos, translated by -100% + panX */}
        <div
          className="absolute inset-0 flex"
          style={{
            transform: `translate3d(calc(-100% + ${panX}px), ${panY}px, 0) scale(${contentScale})`,
            transition: animating ? "transform 200ms ease-out" : undefined,
            willChange: "transform",
          }}
        >
          <div className="relative w-full shrink-0">
            {prev && (
              <Image
                src={prev.imageUrl}
                alt={prev.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>
          <div className="relative w-full shrink-0" onClick={onTapImage}>
            <Image
              src={photo.imageUrl}
              alt={photo.title}
              fill
              sizes="100vw"
              priority
              className={cn(
                "object-contain transition-transform duration-200",
                zoom && "scale-[1.7]"
              )}
            />
          </div>
          <div className="relative w-full shrink-0">
            {next && (
              <Image
                src={next.imageUrl}
                alt={next.title}
                fill
                sizes="100vw"
                className="object-contain"
              />
            )}
          </div>
        </div>
      </div>

      {/* Bottom info + actions */}
      <div
        className="absolute inset-x-0 bottom-0 z-10 pb-safe"
        style={{
          opacity: 1 - dismissProgress * 0.8,
          transform: `translateY(${dismissProgress * 32}px)`,
          transition: animating ? "transform 200ms, opacity 200ms" : undefined,
        }}
      >
        <div className="bg-gradient-to-t from-black/80 via-black/45 to-transparent px-4 pt-8 pb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="line-clamp-2 text-[13px] font-medium text-white/90">
                {photo.title}
              </h2>
              {photo.caption && (
                <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-white/55">
                  {photo.caption}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => {
                haptics.light();
                toggle(photo._id);
              }}
              aria-label={liked ? "Remove from favorites" : "Add to favorites"}
              className="shrink-0 mt-0.5 active:scale-90 touch-manipulation"
            >
              <Heart
                className={cn(
                  "size-[18px] transition-colors",
                  liked
                    ? "fill-red-400 stroke-red-400"
                    : "stroke-white/50 fill-none"
                )}
                strokeWidth={1.5}
              />
            </button>
          </div>

          {photo.tags && photo.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {photo.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/50"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => sharePhoto(photo)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 text-xs font-medium text-white backdrop-blur-md active:scale-[0.98] touch-manipulation"
            >
              <Share2 className="size-3.5" /> Share
            </button>
            <button
              type="button"
              onClick={() =>
                downloadPhoto(
                  photo.imageUrl,
                  `${photo.title || "photo"}.jpg`
                )
              }
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 text-xs font-medium text-white backdrop-blur-md active:scale-[0.98] touch-manipulation"
            >
              <Download className="size-3.5" /> Download
            </button>
            {isOwner && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit photo"
                className="inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white active:scale-95 touch-manipulation"
              >
                <Pencil className="size-4" />
              </button>
            )}
            {isOwner && !confirming && (
              <button
                type="button"
                onClick={() => {
                  haptics.warn();
                  setConfirming(true);
                }}
                aria-label="Delete photo"
                className="inline-flex size-10 items-center justify-center rounded-full bg-red-500/20 text-red-300 active:scale-95 touch-manipulation"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>

          {isOwner && confirming && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-black/40 p-2 backdrop-blur-md">
              <span className="flex-1 px-2 text-xs text-white/85">
                Delete this photo?
              </span>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="rounded-full px-3 py-1.5 text-xs text-white/85"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
