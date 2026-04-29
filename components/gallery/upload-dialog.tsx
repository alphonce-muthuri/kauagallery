"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/lib/use-media-query";
import { useUploadDefaultAlbum, useUploadOpen } from "@/lib/upload-store";
import { haptics } from "@/lib/haptics";

const MAX_BYTES = 25 * 1024 * 1024;

interface UploadDialogProps {
  trigger?: React.ReactNode;
  defaultAlbum?: string;
}

export function UploadDialog({
  trigger,
  defaultAlbum = "",
}: UploadDialogProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [storeOpen, setStoreOpen] = useUploadOpen();
  const storeDefaultAlbum = useUploadDefaultAlbum();
  const [localOpen, setLocalOpen] = useState(false);

  const open = trigger ? localOpen : storeOpen;
  const setOpen = trigger ? setLocalOpen : setStoreOpen;

  // For the global dialog (no trigger), honour the album pushed into the store
  const resolvedDefaultAlbum = trigger ? defaultAlbum : storeDefaultAlbum;

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [album, setAlbum] = useState(resolvedDefaultAlbum);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const libraryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function setSelectedFile(nextFile: File | null) {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
    setFile(nextFile);
    if (nextFile) {
      const nextPreview = URL.createObjectURL(nextFile);
      previewUrlRef.current = nextPreview;
      setPreview(nextPreview);
      return;
    }
    setPreview(null);
  }

  // Sync album field when the store's defaultAlbum changes (e.g. opened from album page)
  useEffect(() => {
    if (!trigger) {
      setAlbum(storeDefaultAlbum);
    }
  }, [storeDefaultAlbum, trigger]);

  function reset() {
    setSelectedFile(null);
    setTitle("");
    setAlbum(resolvedDefaultAlbum);
    setCaption("");
  }

  function handleSelect(input: File | null) {
    if (!input) return;
    if (input.size > MAX_BYTES) {
      haptics.warn();
      toast.error("That photo is over 25MB.", {
        description: "Try a smaller version or compress it first.",
      });
      return;
    }
    setSelectedFile(input);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoaded && !isSignedIn) {
      toast.error("Please sign in to upload memories.");
      return;
    }

    if (!file) {
      toast.error("Please choose a photo to upload.");
      return;
    }

    const form = new FormData();
    form.set("file", file);
    form.set("title", title || file.name.replace(/\.[^.]+$/, ""));
    form.set("caption", caption);
    form.set("album", album);

    setSubmitting(true);
    const toastId = toast.loading("Uploading to the family library…");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error ?? `Upload failed (${res.status})`);
      }

      haptics.success();
      toast.success("Memory saved!", {
        id: toastId,
        description: "Everyone in the family can see it now.",
      });

      setOpen(false);
      reset();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      haptics.error();
      toast.error("Upload failed", { id: toastId, description: message });
    } finally {
      setSubmitting(false);
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!submitting) setOpen(next);
  };

  const dropZone = (
    <div className="space-y-3">
      {/* Hidden inputs */}
      <input
        ref={libraryInputRef}
        id="photo"
        name="photo"
        type="file"
        accept="image/*"
        className="hidden"
        disabled={submitting}
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />
      <input
        ref={cameraInputRef}
        id="photo-camera"
        name="photo-camera"
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={submitting}
        onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
      />

      <button
        type="button"
        onClick={() => libraryInputRef.current?.click()}
        className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background/60 text-center transition-colors hover:border-primary/60 hover:bg-accent/40 active:scale-[0.99]"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt={file?.name ?? "preview"}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <>
            <UploadCloud className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">Tap to choose a photo</p>
            <p className="text-xs text-muted-foreground">
              JPG, PNG, WebP or HEIC up to 25MB
            </p>
          </>
        )}
        {file && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent p-3 text-left text-white">
            <p className="line-clamp-1 text-sm font-medium">{file.name}</p>
            <p className="text-[11px] text-white/80">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        )}
      </button>

      {isMobile && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => libraryInputRef.current?.click()}
            disabled={submitting}
          >
            <ImageIcon className="size-4" /> Library
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={submitting}
          >
            <Camera className="size-4" /> Camera
          </Button>
        </div>
      )}
    </div>
  );

  const fields = (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="First steps"
            value={title}
            disabled={submitting}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="album">Album</Label>
          <Input
            id="album"
            placeholder="Everyday moments"
            value={album}
            disabled={submitting}
            onChange={(e) => setAlbum(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="caption">Caption</Label>
        <Input
          id="caption"
          placeholder="A little note for this memory…"
          value={caption}
          disabled={submitting}
          onChange={(e) => setCaption(e.target.value)}
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
        <SheetContent
          side="bottom"
          className="max-h-[92dvh] gap-0 p-0 pb-0"
        >
          <SheetHeader className="px-5 pb-2 pt-2 text-left">
            <SheetTitle>Upload a new memory</SheetTitle>
            <SheetDescription>
              Add a photo and share it with the family.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-4 pt-3">
              {dropZone}
              {fields}
            </div>
            <SheetFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? "Uploading…" : "Save memory"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button size="lg" className="gap-2">
            <UploadCloud className="size-4" /> Upload memory
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Upload a new memory</DialogTitle>
          <DialogDescription>
            Drop a photo in and share it instantly with the whole family.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {dropZone}
          {fields}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Uploading…" : "Save memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
