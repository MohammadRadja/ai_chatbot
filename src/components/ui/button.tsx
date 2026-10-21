import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "solid" | "outline" | "ghost";
  size?: "sm" | "md";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant = "solid", size = "md", ...props },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" ? "px-3 text-xs" : "px-4 text-sm",
          variant === "solid" && "bg-ink text-paper hover:bg-ink-soft",
          variant === "outline" &&
            "border border-line bg-surface text-ink hover:border-ink hover:bg-paper",
          variant === "ghost" && "text-muted hover:bg-wash hover:text-ink",
          className,
        )}
        {...props}
      />
    );
  },
);
