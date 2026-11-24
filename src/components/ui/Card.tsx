import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "default" | "muted" | "elevated" | "navy" | "paper" | "outline-dashed";

const variantCls: Record<CardVariant, string> = {
  default: "bg-surface border border-line",
  muted: "bg-sunken border border-transparent",
  elevated: "bg-surface border border-line shadow-e1",
  navy: "bg-navy-900 text-white border border-navy-800",
  paper: "bg-paper border border-sand-100",
  "outline-dashed": "bg-transparent border border-dashed border-line-strong",
};

const paddingCls = { none: "", sm: "p-4", md: "p-5", lg: "p-5 md:p-6" };

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: keyof typeof paddingCls;
  interactive?: boolean;
  radius?: "2xl" | "3xl";
  children: ReactNode;
}

export function Card({
  variant = "default",
  padding = "md",
  interactive,
  radius = "2xl",
  className,
  children,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "relative w-full min-w-0 overflow-hidden",
        radius === "2xl" ? "rounded-2xl" : "rounded-3xl",
        variantCls[variant],
        paddingCls[padding],
        interactive &&
          "cursor-pointer transition-[box-shadow,border-color,transform] duration-200 ease-out hover:border-line-strong hover:shadow-e2 focus-within:shadow-e2",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  eyebrow,
  title,
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="mb-1 text-overline uppercase text-ink-muted">{eyebrow}</p>}
        <h3 className="text-subheading text-ink">{title}</h3>
      </div>
      {action}
    </div>
  );
}
