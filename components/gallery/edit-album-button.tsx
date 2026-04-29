"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { EditAlbumDialog } from "@/components/gallery/edit-album-dialog";
import type { Album } from "@/sanity/queries";

export function EditAlbumButton({ album }: { album: Pick<Album, "_id" | "title" | "description"> }) {
  const { isSignedIn } = useUser();
  const [editing, setEditing] = useState(false);

  if (!isSignedIn) return null;

  return (
    <>
      <Button
        variant="glass"
        size="sm"
        className="shrink-0 backdrop-blur-xl"
        onClick={() => setEditing(true)}
      >
        <Pencil className="size-3.5" /> Edit
      </Button>
      <EditAlbumDialog album={album} open={editing} onOpenChange={setEditing} />
    </>
  );
}
