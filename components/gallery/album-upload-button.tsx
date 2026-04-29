"use client";

import { Button } from "@/components/ui/button";
import { uploadStore } from "@/lib/upload-store";

interface AlbumUploadButtonProps {
  albumTitle: string;
}

export function AlbumUploadButton({ albumTitle }: AlbumUploadButtonProps) {
  return (
    <Button
      variant="glass"
      size="sm"
      className="backdrop-blur-xl"
      onClick={() => uploadStore.openWithAlbum(albumTitle)}
    >
      Add
    </Button>
  );
}
