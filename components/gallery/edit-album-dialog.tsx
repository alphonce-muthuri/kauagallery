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
import type { Album } from "@/sanity/queries";

interface EditAlbumDialogProps {
  album: Pick<Album, "_id" | "title" | "description">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (patch: { title: string; description?: string }) => void;
}

export function EditAlbumDialog({ album, open, onOpenChange, onSuccess }: EditAlbumDialogProps) {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [title, setTitle] = useState(album.title ?? "");
  const [description, setDescription] = useState(album.description ?? "");
  const [saving, setSaving] = useState(false);

  function resetToAlbum() {
    setTitle(album.title ?? "");
    setDescription(album.description ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Album title is required.");
      return;
    }

    setSaving(true);
    const toastId = toast.loading("Saving changes…");
    try {
      const res = await fetch(`/api/update-album?id=${album._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Update failed (${res.status})`);

      toast.success("Album updated!", { id: toastId });
      onSuccess?.({ title: title.trim(), description: description.trim() || undefined });
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
        <Label htmlFor="ea-title">Album title</Label>
        <Input
          id="ea-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          placeholder="Family reunion 2024"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ea-description">Description</Label>
        <Textarea
          id="ea-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={saving}
          placeholder="A short description of this album…"
          rows={3}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => { resetToAlbum(); onOpenChange(false); }}
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
      <Sheet open={open} onOpenChange={(next) => { if (!saving) { resetToAlbum(); onOpenChange(next); } }}>
        <SheetContent side="bottom" className="max-h-[92dvh] gap-0 p-0 pb-0">
          <SheetHeader className="px-5 pb-2 pt-4 text-left">
            <SheetTitle>Edit album</SheetTitle>
            <SheetDescription>Update the album title or description.</SheetDescription>
          </SheetHeader>
          <div className="overflow-y-auto px-5 pb-4 pt-3">
            {fields}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) { resetToAlbum(); onOpenChange(next); } }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit album</DialogTitle>
          <DialogDescription>Update the album title or description.</DialogDescription>
        </DialogHeader>
        {fields}
      </DialogContent>
    </Dialog>
  );
}
