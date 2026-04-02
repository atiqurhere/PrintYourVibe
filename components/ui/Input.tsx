"use client";
import { cn } from "@/lib/utils";
import { forwardRef, useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, icon, rightIcon, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-[11px] font-label uppercase tracking-widest transition-colors duration-200",
              focused ? "text-gold" : "text-cream-muted"
            )}
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "flex items-center gap-3 w-full rounded-xl border px-4 py-2.5 transition-all duration-200 bg-dark-elevated",
            focused
              ? "border-gold/50 ring-2 ring-gold/10 shadow-sm shadow-gold/5"
              : error
              ? "border-red-400/60"
              : "border-gold/15 hover:border-gold/30"
          )}
        >
          {icon && (
            <span className={cn("shrink-0 transition-colors duration-200", focused ? "text-gold" : "text-cream-faint/60")}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              "flex-1 min-w-0 bg-transparent text-cream text-sm placeholder:text-cream-faint/40",
              "focus:outline-none",
              className
            )}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            {...props}
          />
          {rightIcon && (
            <span className="shrink-0 text-cream-faint/60">{rightIcon}</span>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-0.5 flex items-center gap-1">⚠ {error}</p>}
        {hint && !error && <p className="text-cream-faint/60 text-xs mt-0.5">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false);

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className={cn(
              "text-[11px] font-label uppercase tracking-widest transition-colors duration-200",
              focused ? "text-gold" : "text-cream-muted"
            )}
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            "rounded-xl border transition-all duration-200 bg-dark-elevated",
            focused
              ? "border-gold/50 ring-2 ring-gold/10"
              : error
              ? "border-red-400/60"
              : "border-gold/15 hover:border-gold/30"
          )}
        >
          <textarea
            ref={ref}
            id={id}
            className={cn(
              "w-full bg-transparent px-4 py-3 text-cream text-sm placeholder:text-cream-faint/40 resize-none",
              "focus:outline-none rounded-xl",
              className
            )}
            onFocus={(e) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); onBlur?.(e); }}
            {...props}
          />
        </div>
        {error && <p className="text-red-400 text-xs mt-0.5">⚠ {error}</p>}
        {hint && !error && <p className="text-cream-faint/60 text-xs mt-0.5">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
