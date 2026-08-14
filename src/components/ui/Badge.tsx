import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "forest"
    | "sage"
    | "clay";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-stone text-charcoal": variant === "default",
          "bg-green-100 text-green-800": variant === "success" || variant === "forest",
          "bg-amber-100 text-amber-800": variant === "warning" || variant === "clay",
          "bg-red-100 text-red-800": variant === "danger",
          "bg-sky-100 text-sky-800": variant === "info" || variant === "sage",
        },
        className
      )}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge };
