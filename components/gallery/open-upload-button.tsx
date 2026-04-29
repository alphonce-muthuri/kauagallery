"use client";

import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadStore } from "@/lib/upload-store";

export function OpenUploadButton() {
  return (
    <Button size="lg" className="gap-2" onClick={() => uploadStore.open()}>
      <UploadCloud className="size-4" /> Upload memory
    </Button>
  );
}
