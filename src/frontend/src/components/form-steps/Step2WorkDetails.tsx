import { Input } from "@/components/ui/input";
import { AlertCircle, CalendarDays, Scale } from "lucide-react";
import { Material } from "../../hooks/useQueries";
import type { FormData } from "../JobForm";
import { FormCard, FormField, SectionHeading } from "./FormHelpers";

interface Props {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  lossWeight: number;
  onChange: (patch: Partial<FormData>) => void;
}

export default function Step2WorkDetails({
  data,
  errors,
  lossWeight,
  onChange,
}: Props) {
  const isLossNegative = lossWeight < 0;
  const isOther = data.material === Material.other;

  return (
    <FormCard>
      <SectionHeading
        icon={<Scale />}
        title="Work Details"
        subtitle="Record the weights after the item is completed"
      />

      <div className="space-y-5">
        <FormField
          label="Complete Work Received Date"
          error={errors.workReceivedDate}
        >
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={data.workReceivedDate}
              onChange={(e) => onChange({ workReceivedDate: e.target.value })}
              className={`pl-9 ${errors.workReceivedDate ? "border-destructive ring-destructive/20" : ""}`}
              aria-invalid={!!errors.workReceivedDate}
            />
          </div>
        </FormField>

        {!isOther && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Received Item Weight"
              error={errors.receivedItemWeight}
            >
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.receivedItemWeight}
                  onChange={(e) =>
                    onChange({ receivedItemWeight: e.target.value })
                  }
                  placeholder="0.00"
                  className={`pl-9 pr-10 ${errors.receivedItemWeight ? "border-destructive ring-destructive/20" : ""}`}
                  aria-invalid={!!errors.receivedItemWeight}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  g
                </span>
              </div>
            </FormField>

            <FormField
              label="Return Scrap Weight"
              error={errors.returnScrapWeight}
            >
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={data.returnScrapWeight}
                  onChange={(e) =>
                    onChange({ returnScrapWeight: e.target.value })
                  }
                  placeholder="0.00"
                  className={`pl-9 pr-10 ${errors.returnScrapWeight ? "border-destructive ring-destructive/20" : ""}`}
                  aria-invalid={!!errors.returnScrapWeight}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                  g
                </span>
              </div>
            </FormField>
          </div>
        )}

        {/* Loss Weight (calculated) */}
        <div
          className="rounded-xl p-4 border"
          style={{
            background: isLossNegative
              ? "oklch(0.58 0.22 25 / 0.08)"
              : "oklch(0.72 0.148 60 / 0.08)",
            borderColor: isLossNegative
              ? "oklch(0.58 0.22 25 / 0.3)"
              : "oklch(0.72 0.148 60 / 0.3)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wider mb-1"
                style={{ color: "oklch(0.52 0.03 60)" }}
              >
                Loss Weight
              </p>
              <p className="text-xs text-muted-foreground">
                Given ({data.givenMaterialWeight || "0"}g) − Received (
                {data.receivedItemWeight || "0"}g) − Scrap (
                {data.returnScrapWeight || "0"}g)
              </p>
            </div>
            <div className="text-right">
              <p
                className="font-display text-2xl font-bold"
                style={{
                  color: isLossNegative
                    ? "oklch(0.58 0.22 25)"
                    : "oklch(0.62 0.14 50)",
                }}
              >
                {lossWeight.toFixed(2)}
                <span className="text-base font-normal ml-1">g</span>
              </p>
              <p className="text-xs text-muted-foreground">auto-calculated</p>
            </div>
          </div>
          {isLossNegative && (
            <div
              className="mt-2 flex items-center gap-1.5 text-xs"
              style={{ color: "oklch(0.58 0.22 25)" }}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Check weights — loss cannot be negative</span>
            </div>
          )}
        </div>

        {/* Given weight reminder */}
        {!isOther && (
          <div
            className="rounded-lg px-4 py-3 text-sm flex items-center gap-2"
            style={{
              background: "oklch(var(--muted) / 0.5)",
              color: "oklch(var(--muted-foreground))",
            }}
          >
            <Scale className="w-4 h-4 shrink-0" />
            <span>
              Given material weight from Step 1:{" "}
              <strong className="text-foreground">
                {data.givenMaterialWeight || "—"} g
              </strong>
            </span>
          </div>
        )}
      </div>
    </FormCard>
  );
}
