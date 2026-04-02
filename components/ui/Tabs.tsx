"use client";
import { cn } from "@/lib/utils";

interface Tab { label: string; value: string }

interface TabsProps {
  tabs: Tab[];
  active: string;
  onChange: (value: string) => void;
  className?: string;
}

export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("flex gap-0 border-b border-gold/10", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            "px-5 py-3 text-sm font-heading transition-all duration-200 relative",
            "hover:text-cream",
            active === tab.value
              ? "text-gold"
              : "text-cream-muted"
          )}
        >
          {tab.label}
          {active === tab.value && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold rounded-full" />
          )}
        </button>
      ))}
    </div>
  );
}
