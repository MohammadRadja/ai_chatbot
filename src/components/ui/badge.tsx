import { cn } from "@/lib/utils";

export function Badge({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
