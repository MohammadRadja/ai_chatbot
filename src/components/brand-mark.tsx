import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("h-9 w-9 shrink-0", className)}
      viewBox="0 0 36 36"
      fill="none"
    >
      <rect width="36" height="36" rx="10" fill="currentColor" />
      <path
        d="M11 26V10h7.4c4.3 0 6.9 2.2 6.9 5.7s-2.6 5.8-6.9 5.8H15V26"
        stroke="var(--brand-mark-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m19 21.5 7 4.5"
        stroke="var(--brand-mark-ink)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
