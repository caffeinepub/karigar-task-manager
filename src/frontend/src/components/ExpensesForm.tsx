import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  CalendarDays,
  IndianRupee,
  List,
  Plus,
  Receipt,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { type ExpenseCategory, useExpenses } from "../hooks/useExpenses";
import ExpensesRecordsList from "./ExpensesRecordsList";
import { FormCard, FormField, SectionHeading } from "./form-steps/FormHelpers";

interface Props {
  onBack: () => void;
}

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  tea_snacks: "Tea & Snacks",
  gas_equipment: "Gas & Equipment",
  daily_wear: "Daily Wear",
  electricity: "Electricity",
  house_expenses: "House Expenses",
  rent: "Rent",
  personal: "Personal",
  other: "Other",
};

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  amount: "",
  category: "" as ExpenseCategory | "",
  remarks: "",
  description: "",
};

type ExpenseTab = "entry" | "records";

export default function ExpensesForm({ onBack }: Props) {
  const [tab, setTab] = useState<ExpenseTab>("entry");
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const { addExpense } = useExpenses();

  function handleSave() {
    setSaving(true);
    try {
      addExpense({
        date: form.date,
        amount: form.amount,
        category: (form.category || "other") as ExpenseCategory,
        remarks: form.remarks,
        description: form.description,
      });
      setForm({ ...emptyForm });
      toast.success("Expense saved successfully");
    } catch {
      toast.error("Failed to save expense");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0.5 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-warm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 hover:bg-accent/50"
            aria-label="Back"
            data-ocid="expenses.back_button"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.148 60), oklch(0.62 0.14 50))",
              }}
            >
              <Receipt className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1
                className="font-display text-lg font-bold leading-tight"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                Expenses
              </h1>
              <p className="text-xs text-muted-foreground">
                Track daily expenses
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 rounded-lg p-1 bg-muted">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="expenses.entry_tab"
              onClick={() => setTab("entry")}
              className={`gap-1.5 px-3 h-8 text-xs font-medium transition-all ${
                tab === "entry"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Entry</span>
              <span className="sm:hidden">New</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              data-ocid="expenses.records_tab"
              onClick={() => setTab("records")}
              className={`gap-1.5 px-3 h-8 text-xs font-medium transition-all ${
                tab === "records"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Records
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Records tab */}
        {tab === "records" && <ExpensesRecordsList />}

        {/* Entry tab */}
        {tab === "entry" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="entry-form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <FormCard>
                <SectionHeading
                  icon={<Receipt />}
                  title="Expense Details"
                  subtitle="Enter expense information"
                />

                <div className="space-y-5">
                  {/* Date */}
                  <FormField label="Date">
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        value={form.date}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, date: e.target.value }))
                        }
                        className="pl-9"
                        data-ocid="expenses.date_input"
                      />
                    </div>
                  </FormField>

                  {/* Amount */}
                  <FormField label="Amount (₹)">
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.amount}
                        onChange={(e) =>
                          setForm((p) => ({ ...p, amount: e.target.value }))
                        }
                        placeholder="0.00"
                        className="pl-9"
                        data-ocid="expenses.amount_input"
                      />
                    </div>
                  </FormField>

                  {/* For (Category) */}
                  <FormField label="For">
                    <Select
                      value={form.category}
                      onValueChange={(v) =>
                        setForm((p) => ({
                          ...p,
                          category: v as ExpenseCategory,
                          description: v !== "other" ? "" : p.description,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-ocid="expenses.for_select"
                      >
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(CATEGORY_LABELS) as [
                            ExpenseCategory,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormField>

                  {/* Description — only shown when "other" is selected */}
                  <AnimatePresence>
                    {form.category === "other" && (
                      <motion.div
                        key="description-field"
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 20 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <FormField label="Description">
                          <Input
                            type="text"
                            value={form.description}
                            onChange={(e) =>
                              setForm((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Describe the expense..."
                            data-ocid="expenses.description_input"
                          />
                        </FormField>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Remarks */}
                  <FormField label="Remarks">
                    <Textarea
                      value={form.remarks}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, remarks: e.target.value }))
                      }
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={3}
                      data-ocid="expenses.remarks_textarea"
                    />
                  </FormField>
                </div>
              </FormCard>

              {/* Save button */}
              <div className="flex justify-end pb-8">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-2 min-w-36 font-medium shadow-gold-sm"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
                    color: "oklch(0.12 0.025 45)",
                    border: "1px solid oklch(0.68 0.14 58)",
                  }}
                  data-ocid="expenses.save_button"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4" />
                      Save Expense
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
