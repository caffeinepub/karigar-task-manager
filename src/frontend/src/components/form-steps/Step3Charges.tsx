import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Hammer, MessageSquare } from "lucide-react";
import type { FormData } from "../JobForm";
import { FormCard, FormField, RadioGroup, SectionHeading } from "./FormHelpers";

interface Props {
  data: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (patch: Partial<FormData>) => void;
}

export default function Step3Charges({ data, errors, onChange }: Props) {
  return (
    <FormCard>
      <SectionHeading
        icon={<Hammer />}
        title="Charges & Remarks"
        subtitle="Enter the making charges and any additional notes"
      />

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Making Charge Customer */}
          <FormField
            label="Making Charge (Customer)"
            error={errors.makingChargeCustomer}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={data.makingChargeCustomer}
                onChange={(e) =>
                  onChange({ makingChargeCustomer: e.target.value })
                }
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </FormField>

          {/* Making Charge Karigar */}
          <FormField
            label="Making Charge (Karigar)"
            error={errors.makingChargeKarigar}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={data.makingChargeKarigar}
                onChange={(e) =>
                  onChange({ makingChargeKarigar: e.target.value })
                }
                placeholder="0.00"
                className="pl-7"
              />
            </div>
          </FormField>
        </div>

        {/* Charges summary pill */}
        {(data.makingChargeCustomer || data.makingChargeKarigar) && (
          <div
            className="rounded-xl p-4 border"
            style={{
              background: "oklch(0.72 0.148 60 / 0.06)",
              borderColor: "oklch(0.72 0.148 60 / 0.25)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: "oklch(0.52 0.03 60)" }}
            >
              Charge Summary
            </p>
            <div className="space-y-1.5">
              {data.makingChargeCustomer && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer Charge</span>
                  <span className="font-medium">
                    ₹{data.makingChargeCustomer}
                  </span>
                </div>
              )}
              {data.makingChargeKarigar && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Karigar Charge</span>
                  <span className="font-medium">
                    ₹{data.makingChargeKarigar}
                  </span>
                </div>
              )}
              {(data.makingChargeCustomer || data.makingChargeKarigar) && (
                <div
                  className="flex justify-between text-sm font-bold pt-1.5 border-t"
                  style={{
                    borderColor: "oklch(0.72 0.148 60 / 0.25)",
                    color: "oklch(0.62 0.14 50)",
                  }}
                >
                  <span>Karigar Margin</span>
                  <span>
                    ₹
                    {(
                      (Number(data.makingChargeCustomer) || 0) -
                      (Number(data.makingChargeKarigar) || 0)
                    ).toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Delivery Date & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Delivery Date" error={errors.deliveryDate}>
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="date"
                value={data.deliveryDate}
                onChange={(e) => onChange({ deliveryDate: e.target.value })}
                className="pl-9"
              />
            </div>
          </FormField>

          <FormField label="Status" error={errors.status}>
            <RadioGroup
              options={[
                { value: "pending", label: "Pending" },
                { value: "delivered", label: "Delivered" },
              ]}
              value={data.status}
              onChange={(v) =>
                onChange({ status: v as "pending" | "delivered" })
              }
            />
          </FormField>
        </div>

        {/* Remarks */}
        <FormField label="Remarks" error={errors.remarks}>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Textarea
              value={data.remarks}
              onChange={(e) => onChange({ remarks: e.target.value })}
              placeholder="Any additional notes, special instructions, or observations..."
              className="pl-9 min-h-24 resize-none"
            />
          </div>
        </FormField>
      </div>
    </FormCard>
  );
}
