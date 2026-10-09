import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "sm" | "icon";
};

export function Button({ className, variant = "primary", size = "default", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-ink text-white hover:bg-forest",
    secondary: "border border-line bg-white text-ink hover:bg-canvas",
    ghost: "text-muted hover:bg-canvas hover:text-ink",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  };
  const sizes = { default: "h-10 px-4", sm: "h-8 px-3 text-xs", icon: "h-9 w-9" };
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50", variants[variant], sizes[size], className)} {...props} />;
}
