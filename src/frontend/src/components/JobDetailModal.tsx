import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Hammer, Receipt, Scale, Wrench } from "lucide-react";
import { JobType, type LocalJobRecord, Material } from "../hooks/useQueries";

interface Props {
  record: LocalJobRecord;
  onClose: () => void;
}

function fmt(n: number | undefined, unit: string): string {
  if (n === undefined || n === null) return "—";
  return `${n} ${unit}`;
}

function fmtDate(d: string | undefined): string {
  if (!d) return "—";
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

interface FieldProps {
  label: string;
  value: string | number | undefined;
}

function Field({ label, value }: FieldProps) {
  const display =
    value === undefined || value === null || value === "" ? "—" : String(value);
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-medium text-foreground">{display}</p>
    </div>
  );
}

export default function JobDetailModal({ record, onClose }: Props) {
  const isNew = record.jobType === JobType.new_;

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-display text-xl flex items-center gap-2">
            {isNew ? (
              <Scale
                className="w-5 h-5"
                style={{ color: "oklch(0.72 0.148 60)" }}
              />
            ) : (
              <Wrench
                className="w-5 h-5"
                style={{ color: "oklch(0.55 0.14 230)" }}
              />
            )}
            Job #{record.billNo}
          </DialogTitle>
        </DialogHeader>

        {/* Type + Material header */}
        <div className="flex items-center gap-3 pb-4">
          <Badge
            className={`font-semibold text-sm px-3 py-1 ${
              isNew
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-blue-500/10 text-blue-600 border-blue-400/30"
            }`}
            variant="outline"
          >
            {isNew ? "New Job" : "Repair"}
          </Badge>
          <Badge
            variant="outline"
            className="text-sm px-3 py-1 text-muted-foreground"
          >
            {materialLabel(record.material)}
          </Badge>
        </div>

        <div className="space-y-5">
          {/* Basic details */}
          <section>
            <div
              className="flex items-center gap-2 mb-3"
              style={{ color: "oklch(0.72 0.148 60)" }}
            >
              <Receipt className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider">
                Job Details
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Date" value={fmtDate(record.date)} />
              <Field label="Bill No" value={`#${record.billNo}`} />
              {record.assignTo && (
                <Field label="Assign To" value={record.assignTo} />
              )}
              <Field label="Material" value={materialLabel(record.material)} />
              {isNew && <Field label="Item" value={record.itemName} />}
              {isNew && (
                <Field
                  label="Given Material Weight"
                  value={fmt(record.givenMaterialWeight, "g")}
                />
              )}
              {!isNew && (
                <div className="col-span-2">
                  <Field
                    label="Work Description"
                    value={record.workDescription}
                  />
                </div>
              )}
            </div>
          </section>

          {isNew && record.workReceivedDate && (
            <>
              <Separator />
              <section>
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                >
                  <Scale className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Work Details
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="Work Received Date"
                    value={fmtDate(record.workReceivedDate)}
                  />
                  <Field
                    label="Received Item Weight"
                    value={fmt(record.receivedItemWeight, "g")}
                  />
                  <Field
                    label="Return Scrap Weight"
                    value={fmt(record.returnScrapWeight, "g")}
                  />
                  <Field
                    label="Loss Weight"
                    value={fmt(record.lossWeight, "g")}
                  />
                </div>
              </section>
            </>
          )}

          {(record.makingChargeCustomer !== undefined ||
            record.makingChargeKarigar !== undefined ||
            record.otherCharge !== undefined) && (
            <>
              <Separator />
              <section>
                <div
                  className="flex items-center gap-2 mb-3"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                >
                  <Hammer className="w-4 h-4" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Charges
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {isNew && (
                    <Field
                      label="Other Charge"
                      value={
                        record.otherCharge !== undefined
                          ? `₹${record.otherCharge}`
                          : undefined
                      }
                    />
                  )}
                  <Field
                    label="Making Charge (Customer)"
                    value={
                      record.makingChargeCustomer !== undefined
                        ? `₹${record.makingChargeCustomer}`
                        : undefined
                    }
                  />
                  <Field
                    label="Making Charge (Karigar)"
                    value={
                      record.makingChargeKarigar !== undefined
                        ? `₹${record.makingChargeKarigar}`
                        : undefined
                    }
                  />
                </div>
              </section>
            </>
          )}

          {record.remarks && (
            <>
              <Separator />
              <section>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Remarks
                </p>
                <p className="text-sm text-foreground leading-relaxed bg-muted/40 rounded-lg p-3">
                  {record.remarks}
                </p>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
