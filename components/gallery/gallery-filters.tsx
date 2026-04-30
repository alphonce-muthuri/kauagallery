"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Filter, SlidersHorizontal, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Album } from "@/sanity/queries";

interface GalleryFiltersProps {
  albums: Album[];
}

export function GalleryFilters({ albums }: GalleryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") ?? "desc";
  const currentAlbum = searchParams.get("album") ?? "";

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const activeAlbum = albums.find((a) => a.slug === currentAlbum);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={currentAlbum ? "default" : "outline"}
            size="sm"
            className="shrink-0"
          >
            <Filter className="size-4" />
            {activeAlbum ? activeAlbum.title : "Filter"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52 max-h-72 overflow-y-auto">
          <DropdownMenuLabel>Filter by album</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updateParam("album", "")}>
            <span className="flex items-center gap-2">
              {!currentAlbum && <Check className="size-4" />}
              <span className={!currentAlbum ? "" : "ml-6"}>All photos</span>
            </span>
          </DropdownMenuItem>
          {albums.map((album) => (
            <DropdownMenuItem
              key={album._id}
              onClick={() => updateParam("album", album.slug)}
            >
              <span className="flex items-center gap-2">
                {currentAlbum === album.slug && <Check className="size-4" />}
                <span className={currentAlbum === album.slug ? "" : "ml-6"}>
                  {album.title}
                </span>
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={currentSort === "asc" ? "default" : "outline"}
            size="sm"
            className="shrink-0"
          >
            <SlidersHorizontal className="size-4" />
            {currentSort === "asc" ? "Oldest first" : "Sort"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Sort by</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => updateParam("sort", "desc")}>
            <span className="flex items-center gap-2">
              {currentSort !== "asc" && <Check className="size-4" />}
              <span className={currentSort !== "asc" ? "" : "ml-6"}>Newest first</span>
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateParam("sort", "asc")}>
            <span className="flex items-center gap-2">
              {currentSort === "asc" && <Check className="size-4" />}
              <span className={currentSort === "asc" ? "" : "ml-6"}>Oldest first</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
