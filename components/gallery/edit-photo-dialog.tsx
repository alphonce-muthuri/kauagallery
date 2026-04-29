"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMediaQuery } from "@/lib/use-media-query";
import type { Photo } from "@/sanity/queries";

interface EditPhotoDialogProps {
  photo: Photo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (patch: Partial<Pick<Photo, "title" | "caption" | "tags" | "takenAt">>) => void;
}

export function EditPhotoDialog({ photo, open, onOpenChange, onSuccess }: EditPhotoDialogProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [title, setTitle] = useState(photo.title ?? "");
  const [caption, setCaption] = useState(photo.caption ?? "");
  const [tags, setTags] = useState((photo.tags ?? []).join(", "));
  const [takenAt, setTakenAt] = useState(
    photo.takenAt ? photo.takenAt.slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);

  // Keep form in sync when the dialog re-opens for a different photo
  function resetToPhoto() {
    setTitle(photo.title ?? "");
    setCaption(photo.caption ?? "");
    setTags((photo.tags ?? []).join(", "));
    setTakenAt(photo.takenAt ? photo.takenAt.slice(0, 16) : "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Title is required.");
      return;
    }

    const parsedTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    setSaving(true);
    const toastId = toast.loading("Saving changes…");
    try {
      const res = await fetch(`/api/update?id=${photo._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          caption: caption.trim(),
          tags: parsedTags,
          takenAt: takenAt || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Update failed (${res.status})`);

      toast.success("Changes saved!", { id: toastId });
      onSuccess({
        title: title.trim(),
        caption: caption.trim() || undefined,
        tags: parsedTags.length > 0 ? parsedTags : undefined,
        takenAt: takenAt ? new Date(takenAt).toISOString() : photo.takenAt,
      });
      onOpenChange(false);
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to save", { id: toastId, description: message });
    } finally {
      setSaving(false);
    }
  }

  const fields = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="ep-title">Title</Label>
        <Input
          id="ep-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          placeholder="Untitled"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ep-caption">Caption</Label>
        <Textarea
          id="ep-caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={saving}
          placeholder="A little note for this memory…"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ep-tags">Tags</Label>
        <Input
          id="ep-tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={saving}
          placeholder="family, holiday, summer"
        />
        <p className="text-[11px] text-muted-foreground">Separate tags with commas</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ep-date">Date taken</Label>
        <Input
          id="ep-date"
          type="datetime-local"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
          disabled={saving}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => { resetToPhoto(); onOpenChange(false); }}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </DialogFooter>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={(next) => { if (!saving) { resetToPhoto(); onOpenChange(next); } }}>
        <SheetContent side="bottom" className="max-h-[92dvh] gap-0 p-0 pb-0">
          <SheetHeader className="px-5 pb-2 pt-4 text-left">
            <SheetTitle>Edit photo</SheetTitle>
            <SheetDescription>Update the title, caption, or tags.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-5 pb-4 pt-3">
            {fields}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) { resetToPhoto(); onOpenChange(next); } }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit photo</DialogTitle>
          <DialogDescription>Update the title, caption, or tags.</DialogDescription>
        </DialogHeader>
        {fields}
      </DialogContent>
    </Dialog>
  );
}
