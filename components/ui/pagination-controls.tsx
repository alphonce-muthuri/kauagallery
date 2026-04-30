import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  extraParams?: Record<string, string>;
};

function buildPageHref(basePath: string, page: number, extraParams?: Record<string, string>) {
  const params = new URLSearchParams(extraParams);
  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function PaginationControls({
  basePath,
  currentPage,
  totalPages,
  extraParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  const prevPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(totalPages, currentPage + 1);

  return (
    <nav
      className="mt-6 flex flex-col items-center justify-between gap-3 sm:mt-8 sm:flex-row"
      aria-label="Pagination"
    >
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        aria-disabled={currentPage <= 1}
      >
        <Link href={buildPageHref(basePath, prevPage, extraParams)}>
          <ChevronLeft className="size-4" /> Previous
        </Link>
      </Button>

      <p className="text-xs font-medium text-muted-foreground sm:text-sm">
        Page {currentPage} of {totalPages}
      </p>

      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        aria-disabled={currentPage >= totalPages}
      >
        <Link href={buildPageHref(basePath, nextPage, extraParams)}>
          Next <ChevronRight className="size-4" />
        </Link>
      </Button>
    </nav>
  );
}
