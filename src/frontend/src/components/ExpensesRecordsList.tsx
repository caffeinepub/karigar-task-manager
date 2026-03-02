import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  AlertTriangle,
  CalendarDays,
  Download,
  FileSpreadsheet,
  FileText,
  IndianRupee,
  Pencil,
  Receipt,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ExpenseCategory,
  type ExpenseRecord,
  useExpenses,
} from "../hooks/useExpenses";
import {
  exportExpenseRecordsExcel,
  exportExpenseRecordsPDF,
} from "../utils/exportData";
import { FormCard, FormField, SectionHeading } from "./form-steps/FormHelpers";

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

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

// ─── Edit Form ────────────────────────────────────────────────────────────────

interface EditFormProps {
  expense: ExpenseRecord;
  onSave: (changes: Partial<Omit<ExpenseRecord, "id" | "createdAt">>) => void;
  onCancel: () => void;
}

function EditExpenseForm({ expense, onSave, onCancel }: EditFormProps) {
  const [form, setForm] = useState({ ...expense });

  return (
    <FormCard>
      <div className="flex items-center justify-between mb-4">
        <SectionHeading
          icon={<Receipt />}
          title="Edit Expense"
          subtitle="Update expense information"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0"
          data-ocid="expenses.edit_form.close_button"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-5">
        {/* Date */}
        <FormField label="Date">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="pl-9"
              data-ocid="expenses.edit_form.date_input"
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
              data-ocid="expenses.edit_form.amount_input"
            />
          </div>
        </FormField>

        {/* Category */}
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
              data-ocid="expenses.edit_form.for_select"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>

        {/* Description (only for "other") */}
        <AnimatePresence>
          {form.category === "other" && (
            <motion.div
              key="description"
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
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Describe the expense..."
                  data-ocid="expenses.edit_form.description_input"
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
            data-ocid="expenses.edit_form.remarks_textarea"
          />
        </FormField>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
            data-ocid="expenses.edit_form.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                date: form.date,
                amount: form.amount,
                category: form.category,
                remarks: form.remarks,
                description: form.description,
              })
            }
            className="flex-1 font-medium shadow-gold-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
              border: "1px solid oklch(0.68 0.14 58)",
            }}
            data-ocid="expenses.edit_form.save_button"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </FormCard>
  );
}

// ─── Main List Component ──────────────────────────────────────────────────────

export default function ExpensesRecordsList() {
  const { expenses, updateExpense, deleteExpense } = useExpenses();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = expenses.filter((e) => {
    const q = search.toLowerCase();
    const matchesSearch =
      e.date.includes(q) ||
      (CATEGORY_LABELS[e.category] ?? "").toLowerCase().includes(q) ||
      e.remarks.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.amount.includes(q);
    const matchesCategory =
      categoryFilter === "all" || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  function handleSave(
    id: string,
    changes: Partial<Omit<ExpenseRecord, "id" | "createdAt">>,
  ) {
    updateExpense(id, changes);
    setEditingId(null);
    toast.success("Expense updated");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    deleteExpense(deleteTarget);
    setDeleteTarget(null);
    toast.success("Expense deleted");
  }

  const editingExpense = editingId
    ? expenses.find((e) => e.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      {/* Edit form overlay */}
      <AnimatePresence>
        {editingExpense && (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            <EditExpenseForm
              expense={editingExpense}
              onSave={(changes) => handleSave(editingExpense.id, changes)}
              onCancel={() => setEditingId(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {!editingExpense && (
        <>
          {expenses.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="expenses.records.search_input"
                  placeholder="Search by date, category, amount..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>

              {/* Category filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger
                  className="w-40 bg-card border-border"
                  data-ocid="expenses.records.category_filter"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
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

              {/* Export */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 font-medium border-border hover:bg-accent/50 shrink-0"
                    data-ocid="expenses.records.export_button"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                    Download Expense Records
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    data-ocid="expenses.records.export_excel_button"
                    onClick={() => exportExpenseRecordsExcel(filtered)}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="expenses.records.export_pdf_button"
                    onClick={() => exportExpenseRecordsPDF(filtered)}
                    className="gap-2 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-red-600" />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card shadow-warm overflow-hidden">
            {filtered.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 px-6"
                data-ocid="expenses.records.empty_state"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.92 0.06 78 / 0.5), oklch(0.88 0.08 72 / 0.3))",
                    border: "1px solid oklch(0.72 0.148 60 / 0.2)",
                  }}
                >
                  <Receipt
                    className="w-8 h-8"
                    style={{ color: "oklch(0.72 0.148 60 / 0.6)" }}
                  />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-1">
                  {search || categoryFilter !== "all"
                    ? "No results found"
                    : "No expenses yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  {search || categoryFilter !== "all"
                    ? "Try a different search or filter."
                    : "Use the form above to record your first expense."}
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((expense, i) => (
                  <motion.div
                    key={expense.id}
                    data-ocid={`expenses.records.item.${i + 1}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.22 }}
                    className={`flex items-center gap-3 px-4 py-4 ${
                      i < filtered.length - 1 ? "border-b border-border" : ""
                    } hover:bg-accent/30 transition-colors duration-150`}
                  >
                    {/* Date */}
                    <div className="min-w-[80px]">
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(expense.date)}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="min-w-[120px]">
                      <span className="text-sm text-muted-foreground">
                        {CATEGORY_LABELS[expense.category] ?? expense.category}
                        {expense.category === "other" && expense.description
                          ? ` — ${expense.description}`
                          : ""}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground">
                        ₹{expense.amount || "0"}
                      </span>
                      {expense.remarks && (
                        <span className="text-xs text-muted-foreground ml-2 truncate hidden sm:inline">
                          {expense.remarks}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-auto shrink-0">
                      <Button
                        data-ocid={`expenses.records.edit_button.${i + 1}`}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                        onClick={() => setEditingId(expense.id)}
                        aria-label="Edit expense"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-ocid={`expenses.records.delete_button.${i + 1}`}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(expense.id)}
                        aria-label="Delete expense"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {filtered.length > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Showing {filtered.length} of {expenses.length} expense entries
            </p>
          )}
        </>
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Expense
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The expense entry will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="expenses.records.delete_dialog.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="expenses.records.delete_dialog.confirm_button"
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
