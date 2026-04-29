"use client";

import Link from "next/link";
import { Upload } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";

export function NavbarAuth() {
  return (
    <>
      <Show when="signed-in">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link href="/upload">
            <Upload className="size-4" />
            Upload
          </Link>
        </Button>
        <div className="ml-1">
          <UserButton
            appearance={{
              elements: {
                avatarBox:
                  "size-9 ring-2 ring-background shadow-sm rounded-full",
              },
            }}
          />
        </div>
      </Show>

      <Show when="signed-out">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/sign-up">Get started</Link>
        </Button>
      </Show>
    </>
  );
}
