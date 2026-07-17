import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-teal-700 text-white hover:bg-teal-800",
  secondary: "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50",
  ghost: "bg-transparent text-zinc-700 hover:bg-zinc-100",
  danger: "bg-rose-700 text-white hover:bg-rose-800",
};

export function Button({ children, className = "", icon, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
