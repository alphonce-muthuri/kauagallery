"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Image as ImageIcon, UploadCloud, X } from "lucide-react";
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

interface FileEntry {
  id: string;
  file: File;
  preview: string;
}

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

  const resolvedDefaultAlbum = trigger ? defaultAlbum : storeDefaultAlbum;

  const [entries, setEntries] = useState<FileEntry[]>([]);
  const [album, setAlbum] = useState(resolvedDefaultAlbum);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");

  const libraryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const previewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    if (!trigger) {
      setAlbum(storeDefaultAlbum);
    }
  }, [storeDefaultAlbum, trigger]);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const next: FileEntry[] = [];
    for (const file of Array.from(fileList)) {
      if (file.size > MAX_BYTES) {
        haptics.warn();
        toast.error(`"${file.name}" is over 25 MB and was skipped.`);
        continue;
      }
      const preview = URL.createObjectURL(file);
      previewUrlsRef.current.add(preview);
      next.push({ id: `${file.name}-${Date.now()}-${Math.random()}`, file, preview });
    }
    setEntries((prev) => [...prev, ...next]);
    // Reset the input so the same file can be re-added after removal
    if (libraryInputRef.current) libraryInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  }

  function removeEntry(id: string) {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) {
        URL.revokeObjectURL(entry.preview);
        previewUrlsRef.current.delete(entry.preview);
      }
      return prev.filter((e) => e.id !== id);
    });
  }

  function reset() {
    entries.forEach((e) => {
      URL.revokeObjectURL(e.preview);
      previewUrlsRef.current.delete(e.preview);
    });
    setEntries([]);
    setAlbum(resolvedDefaultAlbum);
    setCaption("");
    setProgressLabel("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isLoaded && !isSignedIn) {
      toast.error("Please sign in to upload memories.");
      return;
    }

    if (entries.length === 0) {
      toast.error("Please choose at least one photo to upload.");
      return;
    }

    setSubmitting(true);

    const total = entries.length;
    const toastId = toast.loading(
      total === 1 ? "Uploading to the family library…" : `Uploading 1 of ${total}…`
    );

    let succeeded = 0;
    let failed = 0;

    for (let i = 0; i < entries.length; i++) {
      const { file } = entries[i];

      if (total > 1) {
        const label = `Uploading ${i + 1} of ${total}…`;
        setProgressLabel(label);
        toast.loading(label, { id: toastId });
      }

      const form = new FormData();
      form.set("file", file);
      form.set("title", file.name.replace(/\.[^.]+$/, ""));
      form.set("caption", caption);
      form.set("album", album);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error ?? `Upload failed (${res.status})`);
        succeeded++;
      } catch (err) {
        failed++;
        toast.error(`Failed: ${file.name}`, {
          description: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    }

    if (succeeded > 0) {
      haptics.success();
      toast.success(succeeded === 1 ? "Memory saved!" : `${succeeded} memories saved!`, {
        id: toastId,
        description:
          failed > 0
            ? `${failed} photo(s) failed to upload.`
            : "Everyone in the family can see them now.",
      });
      setOpen(false);
      reset();
      router.refresh();
    } else {
      toast.error("All uploads failed.", { id: toastId });
    }

    setSubmitting(false);
    setProgressLabel("");
  }

  const handleOpenChange = (next: boolean) => {
    if (!submitting) {
      setOpen(next);
      if (!next) reset();
    }
  };

  const dropZone = (
    <div className="space-y-3">
      <input
        ref={libraryInputRef}
        id="photo"
        name="photo"
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={submitting}
        onChange={(e) => addFiles(e.target.files)}
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
        onChange={(e) => addFiles(e.target.files)}
      />

      {entries.length === 0 ? (
        <button
          type="button"
          onClick={() => libraryInputRef.current?.click()}
          className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border-2 border-dashed border-border bg-background/60 text-center transition-colors hover:border-primary/60 hover:bg-accent/40 active:scale-[0.99]"
        >
          <UploadCloud className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Tap to choose photos</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WebP or HEIC · up to 25 MB each · multiple allowed
          </p>
        </button>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.preview}
                  alt={entry.file.name}
                  className="size-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeEntry(entry.id)}
                  disabled={submitting}
                  className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 disabled:pointer-events-none"
                  aria-label={`Remove ${entry.file.name}`}
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => libraryInputRef.current?.click()}
              disabled={submitting}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary/60 hover:bg-accent/40 disabled:pointer-events-none disabled:opacity-50"
            >
              <UploadCloud className="size-5" />
              <span className="text-[10px] font-medium">Add more</span>
            </button>
          </div>

          <p className="text-xs text-muted-foreground">
            {entries.length} photo{entries.length !== 1 ? "s" : ""} selected
            {submitting && progressLabel ? ` · ${progressLabel}` : ""}
          </p>
        </div>
      )}

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

      <div className="space-y-1.5">
        <Label htmlFor="caption">Caption</Label>
        <Input
          id="caption"
          placeholder="A little note for these memories…"
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
        <SheetContent side="bottom" className="max-h-[92dvh] gap-0 p-0 pb-0">
          <SheetHeader className="px-5 pb-2 pt-2 text-left">
            <SheetTitle>Upload memories</SheetTitle>
            <SheetDescription>
              Add one or more photos and share them with the family.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
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
                {submitting
                  ? progressLabel || "Uploading…"
                  : entries.length > 1
                  ? `Save ${entries.length} memories`
                  : "Save memory"}
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
          <DialogTitle>Upload memories</DialogTitle>
          <DialogDescription>
            Drop one or more photos in and share them instantly with the whole family.
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
              {submitting
                ? progressLabel || "Uploading…"
                : entries.length > 1
                ? `Save ${entries.length} memories`
                : "Save memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
