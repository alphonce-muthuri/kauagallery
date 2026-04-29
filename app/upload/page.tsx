import { UploadCloud } from "lucide-react";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Sidebar } from "@/components/layout/sidebar";
import { UploadDialog } from "@/components/gallery/upload-dialog";
import { Button } from "@/components/ui/button";

export default function UploadPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1400px] flex-1 gap-6 px-3 py-4 sm:px-6 sm:py-6">
        <Sidebar />
        <section className="flex-1 min-w-0">
          <div className="mx-auto max-w-2xl text-center py-14">
            <span className="inline-flex size-14 items-center justify-center rounded-2xl brand-gradient text-white shadow-lg">
              <UploadCloud className="size-6" />
            </span>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
              Add a new memory
            </h1>
            <p className="mt-2 text-muted-foreground">
              Choose a photo from your device and share it instantly with the
              family library.
            </p>
            <div className="mt-8 flex justify-center">
              <UploadDialog
                trigger={
                  <Button size="lg">
                    <UploadCloud className="size-4" /> Open uploader
                  </Button>
                }
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
