import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2.5 font-semibold tracking-tight",
        className
      )}
    >
      <span className="relative inline-flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-[#F5EFDF] shadow-[0_6px_16px_-4px_rgba(220,110,40,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] ring-1 ring-black/5">
        <Image
          src="/icons/icon-192.png"
          alt="Kaua's "
          width={64}
          height={64}
          priority
          className="h-full w-full object-cover"
        />
      </span>
      <span className="text-[17px]">Kaua's </span>
    </Link>
  );
}
