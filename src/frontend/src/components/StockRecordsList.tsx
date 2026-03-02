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
import { Badge } from "@/components/ui/badge";
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
  ArrowLeftRight,
  CalendarDays,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  Gem,
  Package,
  Pencil,
  Search,
  Trash2,
  User,
  Weight,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useEmployees } from "../hooks/useEmployees";
import {
  type BuybackEntry,
  type RawStockEntry,
  type StockEntry,
  type StockItem,
  type StockMaterial,
  type StockOutEntry,
  useStock,
} from "../hooks/useStock";
import {
  exportStockRecordsExcel,
  exportStockRecordsPDF,
} from "../utils/exportData";
import {
  FormCard,
  FormField,
  RadioGroup,
  SectionHeading,
} from "./form-steps/FormHelpers";

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

function typeLabel(type: StockEntry["type"]): string {
  switch (type) {
    case "buyback":
      return "Buyback";
    case "raw_stock":
      return "Raw Stock";
    case "stock_out":
      return "Stock Out";
  }
}

function typeBadgeClass(type: StockEntry["type"]): string {
  switch (type) {
    case "buyback":
      return "bg-blue-500/10 text-blue-700 border-blue-400/30 dark:text-blue-400";
    case "raw_stock":
      return "bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400";
    case "stock_out":
      return "bg-red-500/10 text-red-700 border-red-400/30 dark:text-red-400";
  }
}

interface EditFormProps {
  entry: StockEntry;
  onSave: (changes: Partial<StockEntry>) => void;
  onCancel: () => void;
}

function EditBuyback({
  entry,
  onSave,
  onCancel,
}: { entry: BuybackEntry } & Omit<EditFormProps, "entry">) {
  const [form, setForm] = useState({ ...entry });
  return (
    <FormCard>
      <div className="flex items-center justify-between mb-4">
        <SectionHeading
          icon={<ArrowLeftRight />}
          title="Edit Buyback Entry"
          subtitle="Update buyback stock information"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-5">
        <FormField label="Date">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField label="Material">
          <Select
            value={form.material}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, material: v as StockMaterial }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Total Scrap Weight">
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.totalScrapWeight}
              onChange={(e) =>
                setForm((p) => ({ ...p, totalScrapWeight: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              g
            </span>
          </div>
        </FormField>
        <FormField label="Given Pure Weight">
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.givenPureWeight}
              onChange={(e) =>
                setForm((p) => ({ ...p, givenPureWeight: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              g
            </span>
          </div>
        </FormField>
        <FormField label="Current Rate">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.currentRate}
              onChange={(e) =>
                setForm((p) => ({ ...p, currentRate: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField label="Given Rate">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.givenRate}
              onChange={(e) =>
                setForm((p) => ({ ...p, givenRate: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField label="Amount">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
            />
          </div>
        </FormField>
        <FormField label="Item">
          <RadioGroup
            options={[
              { value: "resale", label: "Resale" },
              { value: "scrap", label: "Scrap" },
            ]}
            value={form.item}
            onChange={(v) => setForm((p) => ({ ...p, item: v as StockItem }))}
          />
        </FormField>
        <FormField label="Remarks">
          <Textarea
            value={form.remarks}
            onChange={(e) =>
              setForm((p) => ({ ...p, remarks: e.target.value }))
            }
            placeholder="Any additional notes..."
            className="resize-none"
            rows={3}
          />
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            className="flex-1 font-medium shadow-gold-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
              border: "1px solid oklch(0.68 0.14 58)",
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </FormCard>
  );
}

function EditRawStock({
  entry,
  onSave,
  onCancel,
}: { entry: RawStockEntry } & Omit<EditFormProps, "entry">) {
  const [form, setForm] = useState({ ...entry });
  return (
    <FormCard>
      <div className="flex items-center justify-between mb-4">
        <SectionHeading
          icon={<Gem />}
          title="Edit Raw Stock Entry"
          subtitle="Update raw stock information"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-5">
        <FormField label="Date">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField label="Material">
          <Select
            value={form.material}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, material: v as StockMaterial }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Weight">
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.weight}
              onChange={(e) =>
                setForm((p) => ({ ...p, weight: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              g
            </span>
          </div>
        </FormField>
        <FormField label="Current Rate">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.currentRate}
              onChange={(e) =>
                setForm((p) => ({ ...p, currentRate: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField label="Amount">
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
            />
          </div>
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            className="flex-1 font-medium shadow-gold-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
              border: "1px solid oklch(0.68 0.14 58)",
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </FormCard>
  );
}

function EditStockOut({
  entry,
  onSave,
  onCancel,
}: { entry: StockOutEntry } & Omit<EditFormProps, "entry">) {
  const [form, setForm] = useState({ ...entry });
  const { employees } = useEmployees();
  return (
    <FormCard>
      <div className="flex items-center justify-between mb-4">
        <SectionHeading
          icon={<Package />}
          title="Edit Stock Out Entry"
          subtitle="Update stock out information"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-5">
        <FormField label="Date">
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
              className="pl-9"
            />
          </div>
        </FormField>
        <FormField label="Material">
          <Select
            value={form.material}
            onValueChange={(v) =>
              setForm((p) => ({ ...p, material: v as StockMaterial }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gold">Gold</SelectItem>
              <SelectItem value="silver">Silver</SelectItem>
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Weight">
          <div className="relative">
            <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.weight}
              onChange={(e) =>
                setForm((p) => ({ ...p, weight: e.target.value }))
              }
              placeholder="0.00"
              className="pl-9 pr-10"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
              g
            </span>
          </div>
        </FormField>
        <FormField label="Given To">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <Select
              value={form.givenTo || "__none__"}
              onValueChange={(v) =>
                setForm((p) => ({ ...p, givenTo: v === "__none__" ? "" : v }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">
                  <span className="text-muted-foreground">Not specified</span>
                </SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.name}>
                    <div className="flex items-center gap-2">
                      <User className="w-3 h-3 text-muted-foreground" />
                      {emp.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(form)}
            className="flex-1 font-medium shadow-gold-sm"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
              border: "1px solid oklch(0.68 0.14 58)",
            }}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </FormCard>
  );
}

export default function StockRecordsList() {
  const { entries, removeEntry, updateEntry } = useStock();
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const filtered = entries.filter((e) => {
    const q = search.toLowerCase();
    return (
      typeLabel(e.type).toLowerCase().includes(q) ||
      e.material.toLowerCase().includes(q) ||
      e.date.includes(q) ||
      ("givenTo" in e && (e as StockOutEntry).givenTo.toLowerCase().includes(q))
    );
  });

  function handleSave(id: string, changes: Partial<StockEntry>) {
    updateEntry(id, changes);
    setEditingId(null);
    toast.success("Stock entry updated");
  }

  function handleDelete() {
    if (!deleteTarget) return;
    removeEntry(deleteTarget);
    setDeleteTarget(null);
    toast.success("Stock entry deleted");
  }

  const editingEntry = editingId
    ? entries.find((e) => e.id === editingId)
    : null;

  return (
    <div className="space-y-6">
      {/* Edit form overlay */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div
            key="edit-form"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
          >
            {editingEntry.type === "buyback" && (
              <EditBuyback
                entry={editingEntry as BuybackEntry}
                onSave={(changes) => handleSave(editingEntry.id, changes)}
                onCancel={() => setEditingId(null)}
              />
            )}
            {editingEntry.type === "raw_stock" && (
              <EditRawStock
                entry={editingEntry as RawStockEntry}
                onSave={(changes) => handleSave(editingEntry.id, changes)}
                onCancel={() => setEditingId(null)}
              />
            )}
            {editingEntry.type === "stock_out" && (
              <EditStockOut
                entry={editingEntry as StockOutEntry}
                onSave={(changes) => handleSave(editingEntry.id, changes)}
                onCancel={() => setEditingId(null)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {!editingEntry && (
        <>
          {entries.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-ocid="stock.search_input"
                  placeholder="Search by type, material, date..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card border-border"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="gap-2 font-medium border-border hover:bg-accent/50 shrink-0"
                    data-ocid="stock.export_button"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                    Download Stock Records
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    data-ocid="stock.export_excel_button"
                    onClick={() => exportStockRecordsExcel(filtered)}
                    className="gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    data-ocid="stock.export_pdf_button"
                    onClick={() => exportStockRecordsPDF(filtered)}
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
                data-ocid="stock.empty_state"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.92 0.06 78 / 0.5), oklch(0.88 0.08 72 / 0.3))",
                    border: "1px solid oklch(0.72 0.148 60 / 0.2)",
                  }}
                >
                  <Package
                    className="w-8 h-8"
                    style={{ color: "oklch(0.72 0.148 60 / 0.6)" }}
                  />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground mb-1">
                  {search ? "No results found" : "No stock entries yet"}
                </h3>
                <p className="text-sm text-muted-foreground text-center max-w-xs">
                  {search
                    ? "Try a different search term."
                    : "Use the form above to add your first stock entry."}
                </p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {filtered.map((entry, i) => (
                  <motion.div
                    key={entry.id}
                    data-ocid={`stock.item.${i + 1}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.22 }}
                    className={`flex items-center gap-3 px-4 py-4 ${
                      i < filtered.length - 1 ? "border-b border-border" : ""
                    } hover:bg-accent/30 transition-colors duration-150`}
                  >
                    {/* Type badge */}
                    <div className="min-w-[90px]">
                      <Badge
                        variant="outline"
                        className={`text-xs font-semibold border ${typeBadgeClass(entry.type)}`}
                      >
                        {typeLabel(entry.type)}
                      </Badge>
                    </div>

                    {/* Date */}
                    <div className="min-w-[80px]">
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(entry.date)}
                      </span>
                    </div>

                    {/* Material */}
                    <div className="min-w-[60px] hidden sm:block">
                      <span className="text-sm text-muted-foreground capitalize">
                        {entry.material}
                      </span>
                    </div>

                    {/* Extra info */}
                    <div className="flex-1 min-w-0 hidden sm:block">
                      <span className="text-sm text-muted-foreground truncate block">
                        {entry.type === "buyback" && (
                          <>
                            Scrap:{" "}
                            {(entry as BuybackEntry).totalScrapWeight || "–"} g
                            | Pure:{" "}
                            {(entry as BuybackEntry).givenPureWeight || "–"} g
                          </>
                        )}
                        {entry.type === "raw_stock" && (
                          <>
                            Weight: {(entry as RawStockEntry).weight || "–"} g |
                            Rate: {(entry as RawStockEntry).currentRate || "–"}
                          </>
                        )}
                        {entry.type === "stock_out" && (
                          <>
                            Weight: {(entry as StockOutEntry).weight || "–"} g |
                            To: {(entry as StockOutEntry).givenTo || "–"}
                          </>
                        )}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 ml-auto shrink-0">
                      <Button
                        data-ocid={`stock.edit_button.${i + 1}`}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                        onClick={() => setEditingId(entry.id)}
                        aria-label="Edit entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        data-ocid={`stock.delete_button.${i + 1}`}
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(entry.id)}
                        aria-label="Delete entry"
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
              Showing {filtered.length} of {entries.length} stock entries
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
              Delete Stock Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The stock entry will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="stock.delete_dialog.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="stock.delete_dialog.confirm_button"
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
