import { cn } from "@/lib/cn";
import { useEffect, useRef, useState } from "react";

export function Marquee({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  if (!overflow) {
    return (
      <div ref={ref} className={cn("truncate", className)}>
        {text}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("overflow-hidden whitespace-nowrap", className)}>
      <div className="marquee-track gap-8">
        <span>{text}</span>
        <span>{text}</span>
      </div>
    </div>
  );
}
