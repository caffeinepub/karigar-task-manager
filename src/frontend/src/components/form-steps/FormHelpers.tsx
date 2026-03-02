import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// ── FormCard ────────────────────────────────────────────────────────────────
interface FormCardProps {
  children: ReactNode;
  className?: string;
}

export function FormCard({ children, className }: FormCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-card-lift",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── SectionHeading ─────────────────────────────────────────────────────────
interface SectionHeadingProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}

export function SectionHeading({ icon, title, subtitle }: SectionHeadingProps) {
  return (
    <div className="flex items-start gap-3 mb-6 pb-5 border-b border-border">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.72 0.148 60 / 0.15), oklch(0.62 0.14 50 / 0.1))",
          border: "1px solid oklch(0.72 0.148 60 / 0.25)",
          color: "oklch(0.62 0.14 50)",
        }}
      >
        <span className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

// ── FormField ──────────────────────────────────────────────────────────────
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FormField({
  label,
  required,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-semibold text-foreground/80">
        {label}
        {required && (
          <span className="ml-1" style={{ color: "oklch(0.72 0.148 60)" }}>
            *
          </span>
        )}
      </Label>
      {children}
      {error && (
        <p
          className="text-xs font-medium"
          style={{ color: "oklch(0.58 0.22 25)" }}
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

// ── RadioGroup ────────────────────────────────────────────────────────────
interface RadioOption {
  value: string;
  label: string;
}

interface RadioGroupProps {
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
}

export function RadioGroup({ options, value, onChange }: RadioGroupProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex-1 min-w-20 h-10 rounded-lg border text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
              isSelected
                ? "text-primary-foreground border-transparent shadow-gold-sm"
                : "border-border bg-background text-muted-foreground hover:bg-accent/50 hover:border-primary/30",
            )}
            style={
              isSelected
                ? {
                    background:
                      "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
                    color: "oklch(0.12 0.025 45)",
                    borderColor: "oklch(0.68 0.14 58)",
                  }
                : undefined
            }
            aria-pressed={isSelected}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
