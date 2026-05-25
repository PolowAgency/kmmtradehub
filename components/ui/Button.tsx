"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  external?: boolean;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold tracking-wide transition-all duration-300 cursor-pointer select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-gold text-[#0A0A0A] hover:bg-gold-light active:scale-[0.98] glow-gold",
  secondary:
    "border border-gold/40 text-gold hover:border-gold hover:bg-gold/5 active:scale-[0.98]",
  ghost:
    "text-muted hover:text-cream transition-colors",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm rounded-full",
  md: "px-6 py-3 text-sm rounded-full",
  lg: "px-8 py-4 text-base rounded-full",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  onClick,
  type = "button",
  disabled,
  className = "",
  external,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""} ${className}`;

  if (href) {
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
