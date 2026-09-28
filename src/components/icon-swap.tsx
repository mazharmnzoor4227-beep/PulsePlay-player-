import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export function IconSwap({
  active,
  On,
  Off,
  className,
}: {
  active: boolean;
  On: LucideIcon;
  Off: LucideIcon;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-flex", className)}>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          active ? "scale-100 opacity-100 blur-none" : "scale-[0.25] opacity-0 blur-[4px]",
        )}
      >
        <On className="size-full" />
      </span>
      <span
        className={cn(
          "flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)]",
          active ? "scale-[0.25] opacity-0 blur-[4px]" : "scale-100 opacity-100 blur-none",
        )}
      >
        <Off className="size-full" />
      </span>
    </span>
  );
}
