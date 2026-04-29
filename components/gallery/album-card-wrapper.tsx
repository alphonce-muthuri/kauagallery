"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useUser } from "@clerk/nextjs";

import { AlbumCard } from "@/components/gallery/album-card";
import { EditAlbumDialog } from "@/components/gallery/edit-album-dialog";
import { DeleteAlbumButton } from "@/components/gallery/delete-album-button";
import type { Album } from "@/sanity/queries";

export function AlbumCardWrapper({ album }: { album: Album }) {
  const { isSignedIn } = useUser();
  const [editing, setEditing] = useState(false);

  return (
    <div className="group relative">
      <AlbumCard album={album} />
      {isSignedIn && (
        <>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setEditing(true); }}
            aria-label="Edit album"
            className="absolute right-3 top-3 z-10 inline-flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-opacity hover:bg-black/70 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <Pencil className="size-3.5" />
          </button>
          <DeleteAlbumButton
            albumId={album._id}
            albumSlug={album.slug}
            albumTitle={album.title}
            iconOnly
            className="absolute right-3 top-12 z-10 inline-flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-opacity hover:bg-red-600/80 disabled:opacity-60 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          />
          <EditAlbumDialog
            album={album}
            open={editing}
            onOpenChange={setEditing}
          />
        </>
      )}
    </div>
  );
}
