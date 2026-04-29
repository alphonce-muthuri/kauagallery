"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { haptics } from "@/lib/haptics";

interface DeleteAlbumButtonProps {
  albumId: string;
  albumSlug: string;
  albumTitle: string;
  iconOnly?: boolean;
  className?: string;
}

export function DeleteAlbumButton({
  albumId,
  albumSlug,
  albumTitle,
  iconOnly = false,
  className,
}: DeleteAlbumButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    const ok = window.confirm(
      `Delete album "${albumTitle}"?\n\nPhotos will be kept, but removed from this album.`
    );
    if (!ok) return;

    setDeleting(true);
    haptics.warn();
    const toastId = toast.loading("Deleting album…");
    try {
      const res = await fetch(
        `/api/delete-album?id=${encodeURIComponent(albumId)}&slug=${encodeURIComponent(albumSlug)}`,
        { method: "DELETE" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? `Delete failed (${res.status})`);

      haptics.success();
      toast.success("Album deleted.", {
        id: toastId,
        description:
          typeof data?.affectedPhotos === "number"
            ? `${data.affectedPhotos} photo(s) were kept and ungrouped.`
            : undefined,
      });
      router.push("/albums");
      router.refresh();
    } catch (err) {
      haptics.error();
      toast.error("Delete failed", {
        id: toastId,
        description: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!deleting) void onDelete();
        }}
        aria-label="Delete album"
        disabled={deleting}
        className={className}
      >
        <Trash2 className="size-3.5" />
      </button>
    );
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={() => {
        if (!deleting) void onDelete();
      }}
      disabled={deleting}
      className={className}
    >
      <Trash2 className="size-4" />
      {deleting ? "Deleting…" : "Delete album"}
    </Button>
  );
}

