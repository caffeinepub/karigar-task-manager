import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Gem, ListOrdered, Plus } from "lucide-react";
import { motion } from "motion/react";
import { JobType, Material } from "../../hooks/useQueries";
import type { FormData } from "../JobForm";

interface Props {
  formData: FormData;
  lossWeight: number;
  onBackToList: () => void;
  onNewJob: () => void;
}

function fmtDate(d: string): string {
  try {
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y}`;
  } catch {
    return d;
  }
}

function materialLabel(m: Material): string {
  switch (m) {
    case Material.gold:
      return "Gold";
    case Material.silver:
      return "Silver";
    case Material.other:
      return "Other";
  }
}

interface SummaryRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function SummaryRow({ label, value, highlight }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground font-medium">{label}</span>
      <span
        className={`text-sm font-semibold ${highlight ? "" : "text-foreground"}`}
        style={highlight ? { color: "oklch(0.62 0.14 50)" } : undefined}
      >
        {value}
      </span>
    </div>
  );
}

export default function SuccessSummary({
  formData,
  lossWeight,
  onBackToList,
  onNewJob,
}: Props) {
  const isNew = formData.jobType === JobType.new_;

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-12">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center shadow-gold"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.78 0.148 65), oklch(0.65 0.14 52))",
              }}
            >
              <CheckCircle2
                className="w-10 h-10"
                style={{ color: "oklch(0.12 0.025 45)" }}
              />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Job Recorded!
            </h1>
            <p className="text-muted-foreground">
              Bill #{formData.billNo} has been successfully saved.
            </p>
          </motion.div>
        </motion.div>

        {/* Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-2xl border border-border bg-card shadow-card-lift overflow-hidden mb-6"
        >
          {/* Card Header */}
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.72 0.148 60 / 0.1), oklch(0.88 0.11 80 / 0.05))",
              borderBottom: "1px solid oklch(0.72 0.148 60 / 0.2)",
            }}
          >
            <div className="flex items-center gap-2">
              <Gem
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.148 60)" }}
              />
              <span className="font-display font-bold text-foreground">
                Job Summary
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={`font-semibold ${
                  isNew
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-blue-500/10 text-blue-600 border-blue-400/30"
                }`}
              >
                {isNew ? "New Job" : "Repair"}
              </Badge>
            </div>
          </div>

          {/* Summary sections */}
          <div className="px-6 py-4 divide-y divide-border">
            {/* Basic Info */}
            <div className="pb-4">
              <p
                className="text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: "oklch(0.72 0.148 60)" }}
              >
                Basic Information
              </p>
              <SummaryRow label="Date" value={fmtDate(formData.date)} />
              {formData.assignTo && (
                <SummaryRow label="Assign To" value={formData.assignTo} />
              )}
              <SummaryRow
                label="Bill No"
                value={`#${formData.billNo}`}
                highlight
              />
              <SummaryRow
                label="Material"
                value={materialLabel(formData.material)}
              />
              {isNew && (
                <SummaryRow label="Item" value={formData.itemName || "—"} />
              )}
              {isNew && (
                <SummaryRow
                  label="Given Material Weight"
                  value={`${formData.givenMaterialWeight} g`}
                />
              )}
              {!isNew && (
                <SummaryRow
                  label="Work Description"
                  value={formData.workDescription || "—"}
                />
              )}
            </div>

            {/* Work Details (New only) */}
            {isNew && formData.workReceivedDate && (
              <div className="py-4">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3 mt-0.5"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                >
                  Work Details
                </p>
                <SummaryRow
                  label="Complete Work Received Date"
                  value={fmtDate(formData.workReceivedDate)}
                />
                <SummaryRow
                  label="Received Item Weight"
                  value={`${formData.receivedItemWeight} g`}
                />
                <SummaryRow
                  label="Return Scrap Weight"
                  value={`${formData.returnScrapWeight} g`}
                />
                <SummaryRow
                  label="Loss Weight"
                  value={`${lossWeight.toFixed(2)} g`}
                  highlight
                />
              </div>
            )}

            {/* Charges */}
            {(formData.makingChargeCustomer ||
              formData.makingChargeKarigar ||
              formData.otherCharge) && (
              <div className="pt-4">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3 mt-0.5"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                >
                  Charges
                </p>
                {formData.otherCharge && (
                  <SummaryRow
                    label="Other Charge"
                    value={`₹${formData.otherCharge}`}
                  />
                )}
                {formData.makingChargeCustomer && (
                  <SummaryRow
                    label="Making Charge (Customer)"
                    value={`₹${formData.makingChargeCustomer}`}
                  />
                )}
                {formData.makingChargeKarigar && (
                  <SummaryRow
                    label="Making Charge (Karigar)"
                    value={`₹${formData.makingChargeKarigar}`}
                  />
                )}
              </div>
            )}

            {/* Remarks */}
            {formData.remarks && (
              <div className="pt-4">
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-2 mt-0.5"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                >
                  Remarks
                </p>
                <p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-lg p-3">
                  {formData.remarks}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button variant="outline" onClick={onNewJob} className="flex-1 gap-2">
            <Plus className="w-4 h-4" />
            Add Another Job
          </Button>
          <Button
            onClick={onBackToList}
            className="flex-1 gap-2 shadow-gold-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
              border: "1px solid oklch(0.68 0.14 58)",
            }}
          >
            <ListOrdered className="w-4 h-4" />
            View All Records
          </Button>
        </motion.div>
      </main>
    </div>
  );
}
