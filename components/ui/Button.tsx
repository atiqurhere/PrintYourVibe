import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size    = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gold text-dark font-heading font-semibold btn-shimmer hover:bg-gold-light active:scale-[0.98] shadow-lg shadow-gold/10",
  secondary:
    "border border-gold/40 text-gold bg-transparent hover:bg-gold/8 hover:border-gold/70 font-heading font-medium active:scale-[0.98]",
  ghost:
    "bg-transparent text-cream-muted hover:text-cream hover:bg-dark-elevated font-body active:scale-[0.98]",
  destructive:
    "bg-red-600/90 text-white hover:bg-red-600 font-heading font-semibold active:scale-[0.98]",
};

const sizeClasses: Record<Size, string> = {
  sm:   "px-4 py-2 text-sm rounded-lg gap-1.5",
  md:   "px-6 py-3 text-sm rounded-xl gap-2",
  lg:   "px-8 py-4 text-base rounded-xl gap-2",
  icon: "p-2.5 rounded-lg",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center transition-all duration-200 cursor-pointer select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
