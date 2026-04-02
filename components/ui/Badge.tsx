import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/utils";

type BadgeVariant = "gold" | "outline" | "status" | OrderStatus;

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const statusClasses: Record<OrderStatus, string> = {
  pending:    "text-amber-400   bg-amber-400/10   border-amber-400/30",
  confirmed:  "text-blue-400    bg-blue-400/10    border-blue-400/30",
  printing:   "text-purple-400  bg-purple-400/10  border-purple-400/30",
  dispatched: "text-teal-400    bg-teal-400/10    border-teal-400/30",
  delivered:  "text-green-400   bg-green-400/10   border-green-400/30",
  cancelled:  "text-red-400     bg-red-400/10     border-red-400/30",
  refunded:   "text-gray-400    bg-gray-400/10    border-gray-400/30",
};

export function Badge({ className, variant = "gold", children, ...props }: BadgeProps) {
  const isStatus = variant in statusClasses;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border rounded-full px-2.5 py-0.5",
        "font-label text-[10px] uppercase tracking-widest",
        variant === "gold" && "text-gold bg-gold/10 border-gold/25",
        variant === "outline" && "text-cream-muted bg-transparent border-cream-faint/50",
        isStatus && statusClasses[variant as OrderStatus],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
