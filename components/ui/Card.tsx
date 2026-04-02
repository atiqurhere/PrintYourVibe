import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, glass = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border-gold-15 bg-dark-card",
        hover && "card-hover cursor-pointer",
        glass && "glass",
        className
      )}
      style={{ border: "1px solid rgba(201,168,76,0.15)", borderRadius: "12px" }}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = "Card";

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pb-0", className)} {...props}>{children}</div>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props}>{children}</div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 pb-6 flex items-center", className)} {...props}>{children}</div>
);
