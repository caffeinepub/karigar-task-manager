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
  ArrowLeft,
  CalendarDays,
  List,
  Pencil,
  Plus,
  Repeat,
  Trash2,
  Weight,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type ExchangeScrapEntry,
  type OldScrapType,
  useExchangeScrap,
} from "../hooks/useExchangeScrap";
import { FormCard, FormField, SectionHeading } from "./form-steps/FormHelpers";

interface Props {
  onBack: () => void;
}

const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  exchangeScrapWeight: "",
  givenPureWeight: "",
  oldScrap: "resale" as OldScrapType,
  remarks: "",
};

type ExchangeTab = "entry" | "records";

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

export default function ExchangeScrapForm({ onBack }: Props) {
  const [tab, setTab] = useState<ExchangeTab>("entry");
  const [form, setForm] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const {
    exchangeScrapEntries,
    addExchangeScrap,
    updateExchangeScrap,
    deleteExchangeScrap,
  } = useExchangeScrap();

  function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        updateExchangeScrap(editingId, {
          date: form.date,
          exchangeScrapWeight: form.exchangeScrapWeight,
          givenPureWeight: form.givenPureWeight,
          oldScrap: form.oldScrap,
          remarks: form.remarks,
        });
        setEditingId(null);
        toast.success("Exchange scrap entry updated");
      } else {
        addExchangeScrap({
          date: form.date,
          exchangeScrapWeight: form.exchangeScrapWeight,
          givenPureWeight: form.givenPureWeight,
          oldScrap: form.oldScrap,
          remarks: form.remarks,
        });
        toast.success("Exchange scrap entry saved");
      }
      setForm({ ...emptyForm });
    } catch {
      toast.error("Failed to save entry");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(entry: ExchangeScrapEntry) {
    setForm({
      date: entry.date,
      exchangeScrapWeight: entry.exchangeScrapWeight,
      givenPureWeight: entry.givenPureWeight,
      oldScrap: entry.oldScrap,
      remarks: entry.remarks,
    });
    setEditingId(entry.id);
    setTab("entry");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteExchangeScrap(deleteTarget);
    setDeleteTarget(null);
    toast.success("Entry deleted");
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
            data-ocid="exchange-scrap.back_button"
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
              <Repeat className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1
                className="font-display text-lg font-bold leading-tight"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                Exchange Scrap
              </h1>
              <p className="text-xs text-muted-foreground">
                Track scrap exchanges
              </p>
            </div>
          </div>

          {/* Tab toggle */}
          <div className="flex items-center gap-1 rounded-lg p-1 bg-muted">
            <Button
              variant="ghost"
              size="sm"
              data-ocid="exchange-scrap.entry_tab"
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
              data-ocid="exchange-scrap.records_tab"
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
        {tab === "records" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="records"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {exchangeScrapEntries.length === 0 ? (
                <div
                  className="rounded-2xl border border-border bg-card p-12 text-center shadow-warm"
                  data-ocid="exchange-scrap.empty_state"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.92 0.06 78 / 0.5), oklch(0.88 0.08 72 / 0.3))",
                      border: "1px solid oklch(0.72 0.148 60 / 0.2)",
                    }}
                  >
                    <Repeat
                      className="w-8 h-8"
                      style={{ color: "oklch(0.72 0.148 60 / 0.6)" }}
                    />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    No exchange records yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Add your first exchange scrap entry using the New Entry tab.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border bg-card shadow-warm overflow-hidden">
                  {/* Table header */}
                  <div className="hidden sm:grid grid-cols-[100px_100px_100px_90px_1fr_auto] gap-3 px-4 py-3 border-b border-border bg-muted/30">
                    {[
                      "Date",
                      "Exch. Scrap Wt",
                      "Given Pure Wt",
                      "Old Scrap",
                      "Remarks",
                      "",
                    ].map((h) => (
                      <span
                        key={h}
                        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                  <AnimatePresence initial={false}>
                    {exchangeScrapEntries.map((entry, i) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8, height: 0 }}
                        transition={{ delay: i * 0.03, duration: 0.2 }}
                        className={`flex flex-col sm:grid sm:grid-cols-[100px_100px_100px_90px_1fr_auto] sm:items-center gap-2 sm:gap-3 px-4 py-4 ${
                          i < exchangeScrapEntries.length - 1
                            ? "border-b border-border"
                            : ""
                        } hover:bg-accent/20 transition-colors duration-150`}
                        data-ocid={`exchange-scrap.item.${i + 1}`}
                      >
                        {/* Date */}
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(entry.date)}
                        </span>
                        {/* Exchange scrap weight */}
                        <span className="text-sm text-muted-foreground">
                          {entry.exchangeScrapWeight
                            ? `${entry.exchangeScrapWeight}g`
                            : "–"}
                        </span>
                        {/* Given pure weight */}
                        <span className="text-sm text-muted-foreground">
                          {entry.givenPureWeight
                            ? `${entry.givenPureWeight}g`
                            : "–"}
                        </span>
                        {/* Old scrap type */}
                        <span
                          className="text-xs font-semibold capitalize px-2 py-0.5 rounded-full inline-block w-fit"
                          style={{
                            background:
                              entry.oldScrap === "resale"
                                ? "oklch(0.55 0.14 155 / 0.12)"
                                : "oklch(0.55 0.14 240 / 0.12)",
                            color:
                              entry.oldScrap === "resale"
                                ? "oklch(0.45 0.14 155)"
                                : "oklch(0.45 0.14 240)",
                          }}
                        >
                          {entry.oldScrap}
                        </span>
                        {/* Remarks */}
                        <span className="text-sm text-muted-foreground truncate">
                          {entry.remarks || "–"}
                        </span>
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                            onClick={() => handleEdit(entry)}
                            aria-label="Edit entry"
                            data-ocid={`exchange-scrap.edit_button.${i + 1}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteTarget(entry.id)}
                            aria-label="Delete entry"
                            data-ocid={`exchange-scrap.delete_button.${i + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

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
                  icon={<Repeat />}
                  title={
                    editingId ? "Edit Exchange Scrap" : "Exchange Scrap Details"
                  }
                  subtitle={
                    editingId
                      ? "Update exchange scrap information"
                      : "Enter exchange scrap information"
                  }
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
                        data-ocid="exchange-scrap.date_input"
                      />
                    </div>
                  </FormField>

                  {/* Exchange Scrap Weight */}
                  <FormField label="Exchange Scrap Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.exchangeScrapWeight}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            exchangeScrapWeight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="exchange-scrap.exchange_weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  {/* Given Pure Weight */}
                  <FormField label="Given Pure Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.givenPureWeight}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            givenPureWeight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="exchange-scrap.pure_weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  {/* Old Scrap */}
                  <FormField label="Old Scrap">
                    <Select
                      value={form.oldScrap}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, oldScrap: v as OldScrapType }))
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-ocid="exchange-scrap.old_scrap_select"
                      >
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="resale">Resale</SelectItem>
                        <SelectItem value="refine">Refine</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

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
                      data-ocid="exchange-scrap.remarks_textarea"
                    />
                  </FormField>
                </div>
              </FormCard>

              {/* Save / Cancel buttons */}
              <div className="flex justify-end gap-3 pb-8">
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="font-medium"
                    data-ocid="exchange-scrap.cancel_button"
                  >
                    Cancel
                  </Button>
                )}
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
                  data-ocid="exchange-scrap.save_button"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Repeat className="w-4 h-4" />
                      {editingId ? "Update Entry" : "Save Entry"}
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent data-ocid="exchange-scrap.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Entry
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The exchange scrap entry will be
              permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="exchange-scrap.cancel_button"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="exchange-scrap.confirm_button"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
