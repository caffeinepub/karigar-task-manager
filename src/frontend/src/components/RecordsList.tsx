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
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Circle,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Gem,
  Package,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  JobType,
  type LocalJobRecord,
  Material,
  useDeleteJobRecord,
  useGetAllJobRecords,
} from "../hooks/useQueries";
import {
  type BuybackEntry,
  type StockOutEntry,
  useStock,
} from "../hooks/useStock";
import {
  exportJobRecordsExcel,
  exportJobRecordsPDF,
} from "../utils/exportData";
import EmployeeForm from "./EmployeeForm";
import JobDetailModal from "./JobDetailModal";

interface Props {
  onNewJob: () => void;
  onViewRecord: (r: LocalJobRecord) => void;
  viewingRecord: LocalJobRecord | null;
  onCloseRecord: () => void;
  onEditRecord: (r: LocalJobRecord) => void;
  onStock: () => void;
  onExpenses: () => void;
}

type SortColumn =
  | "date"
  | "assignTo"
  | "billNo"
  | "material"
  | "workReceivedDate"
  | "deliveryDate"
  | "status";

type SortDir = "asc" | "desc";

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

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

function getSortValue(record: LocalJobRecord, col: SortColumn): string {
  switch (col) {
    case "date":
      return record.date ?? "";
    case "assignTo":
      return (record.assignTo ?? "").toLowerCase();
    case "billNo":
      return (record.billNo ?? "").toLowerCase();
    case "material":
      return materialLabel(record.material).toLowerCase();
    case "workReceivedDate":
      return (record.workReceivedDate ?? "").toLowerCase();
    case "deliveryDate":
      return (record.deliveryDate ?? "").toLowerCase();
    case "status":
      return (record.status ?? "").toLowerCase();
  }
}

export default function RecordsList({
  onNewJob,
  onViewRecord,
  viewingRecord,
  onCloseRecord,
  onEditRecord,
  onStock,
  onExpenses,
}: Props) {
  const { data: rawRecords = [], isLoading } = useGetAllJobRecords();
  const records = rawRecords as LocalJobRecord[];
  const deleteMutation = useDeleteJobRecord();
  const { entries: stockEntries } = useStock();
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [search, setSearch] = useState("");
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [sortColumn, setSortColumn] = useState<SortColumn>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = records.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.billNo.toLowerCase().includes(q) ||
      r.date.includes(q) ||
      materialLabel(r.material).toLowerCase().includes(q) ||
      (r.jobType === JobType.new_ ? "new" : "repair").includes(q) ||
      (r.assignTo ?? "").toLowerCase().includes(q) ||
      (r.itemName ?? "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const aVal = getSortValue(a, sortColumn);
    const bVal = getSortValue(b, sortColumn);
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function handleSortClick(col: SortColumn) {
    if (col === sortColumn) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDir("asc");
    }
  }

  async function handleDelete() {
    if (deleteTarget === null) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      toast.success("Record deleted successfully");
    } catch {
      toast.error("Failed to delete record");
    } finally {
      setDeleteTarget(null);
    }
  }

  const columns: { key: SortColumn; label: string; title?: string }[] = [
    { key: "date", label: "Date" },
    { key: "assignTo", label: "Assign To" },
    { key: "billNo", label: "Bill No" },
    { key: "material", label: "Material" },
    {
      key: "workReceivedDate",
      label: "Rcvd Date",
      title: "Complete Work Received Date",
    },
    { key: "deliveryDate", label: "Delivery Date" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0.5 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-warm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.148 60), oklch(0.62 0.14 50))",
              }}
            >
              <Gem className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1
                className="font-display text-xl font-bold leading-tight"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                Karigar Task Manager
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Jewelry Job Records
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowEmployeeForm(true)}
              className="gap-2 font-medium border-border hover:bg-accent/50"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Add Employee</span>
              <span className="sm:hidden">Employee</span>
            </Button>
            <Button
              variant="outline"
              onClick={onExpenses}
              className="gap-2 font-medium border-border hover:bg-accent/50"
              data-ocid="header.expenses_button"
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Expenses</span>
              <span className="sm:hidden">Exp</span>
            </Button>
            <Button
              variant="outline"
              onClick={onStock}
              className="gap-2 font-medium border-border hover:bg-accent/50"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Stock</span>
              <span className="sm:hidden">Stock</span>
            </Button>
            <Button
              onClick={onNewJob}
              className="gap-2 font-medium shadow-gold-sm"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
                color: "oklch(0.12 0.025 45)",
                border: "1px solid oklch(0.68 0.14 58)",
              }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Job</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-3 mb-8"
        >
          {/* Job stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Total Jobs",
                value: isLoading ? "–" : records.length,
                sub: "all records",
              },
              {
                label: "New Jobs",
                value: isLoading
                  ? "–"
                  : records.filter((r) => r.jobType === JobType.new_).length,
                sub: "fabrication",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-xl border border-border bg-card p-4 shadow-warm hover:shadow-gold-sm transition-shadow duration-200"
              >
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
                  {stat.label}
                </p>
                <p
                  className="font-display text-2xl font-bold leading-none mb-0.5"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Stock summary */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="rounded-xl border border-border bg-card shadow-warm overflow-hidden"
          >
            {/* Section header */}
            <button
              type="button"
              onClick={onStock}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-border hover:bg-accent/30 transition-colors duration-150"
            >
              <div className="flex items-center gap-2">
                <Package
                  className="w-4 h-4"
                  style={{ color: "oklch(0.72 0.148 60)" }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Stock Overview
                </span>
              </div>
              <span className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                View All →
              </span>
            </button>

            <div className="grid grid-cols-3 divide-x divide-border">
              {[
                {
                  label: "Stock In",
                  value: stockEntries.filter(
                    (e) => e.type === "buyback" || e.type === "raw_stock",
                  ).length,
                  sub: "buyback + raw",
                  icon: <ArrowDownToLine className="w-4 h-4" />,
                  color: "oklch(0.55 0.14 155)",
                },
                {
                  label: "Buyback",
                  value: stockEntries.filter((e) => e.type === "buyback")
                    .length,
                  sub: "entries",
                  icon: <ArrowLeftRight className="w-4 h-4" />,
                  color: "oklch(0.55 0.14 240)",
                },
                {
                  label: "Stock Out",
                  value: stockEntries.filter((e) => e.type === "stock_out")
                    .length,
                  sub: "dispatched",
                  icon: <ArrowUpFromLine className="w-4 h-4" />,
                  color: "oklch(0.55 0.16 25)",
                },
              ].map((stat) => (
                <div key={stat.label} className="p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span style={{ color: stat.color }}>{stat.icon}</span>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                  <p
                    className="font-display text-2xl font-bold leading-none mb-0.5"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.sub}</p>
                </div>
              ))}
            </div>

            {/* Gold vs Silver breakdown */}
            <div className="border-t border-border px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Material Breakdown
              </p>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    {
                      material: "gold" as const,
                      label: "Gold",
                      color: "oklch(0.72 0.148 60)",
                      bg: "oklch(0.97 0.04 78 / 0.5)",
                      border: "oklch(0.72 0.148 60 / 0.25)",
                    },
                    {
                      material: "silver" as const,
                      label: "Silver",
                      color: "oklch(0.50 0.02 260)",
                      bg: "oklch(0.96 0.01 260 / 0.5)",
                      border: "oklch(0.60 0.04 260 / 0.3)",
                    },
                  ] as const
                ).map(({ material, label, color, bg, border }) => {
                  const inCount = stockEntries.filter(
                    (e) =>
                      (e.type === "buyback" || e.type === "raw_stock") &&
                      e.material === material,
                  ).length;
                  const outCount = stockEntries.filter(
                    (e) => e.type === "stock_out" && e.material === material,
                  ).length;

                  const inWeight = stockEntries
                    .filter(
                      (e) =>
                        (e.type === "buyback" || e.type === "raw_stock") &&
                        e.material === material,
                    )
                    .reduce((sum, e) => {
                      const w =
                        e.type === "buyback"
                          ? Number.parseFloat(e.givenPureWeight) || 0
                          : e.type === "raw_stock"
                            ? Number.parseFloat(e.weight) || 0
                            : 0;
                      return sum + w;
                    }, 0);

                  const outWeight = stockEntries
                    .filter(
                      (e): e is StockOutEntry =>
                        e.type === "stock_out" && e.material === material,
                    )
                    .reduce(
                      (sum, e) => sum + (Number.parseFloat(e.weight) || 0),
                      0,
                    );

                  const scrapWeight = stockEntries
                    .filter(
                      (e) => e.type === "buyback" && e.material === material,
                    )
                    .reduce((sum, e) => {
                      return (
                        sum +
                        (Number.parseFloat(
                          (e as BuybackEntry).totalScrapWeight,
                        ) || 0)
                      );
                    }, 0);

                  const netWeight = inWeight - outWeight;
                  const netPositive = netWeight >= 0;

                  return (
                    <div
                      key={material}
                      className="rounded-lg px-3 py-2.5"
                      style={{ background: bg, border: `1px solid ${border}` }}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Circle
                          className="w-3 h-3 shrink-0 fill-current"
                          style={{ color }}
                        />
                        <p
                          className="text-sm font-semibold leading-tight"
                          style={{ color }}
                        >
                          {label}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        In:{" "}
                        <span className="font-medium text-foreground">
                          {inCount} ({inWeight.toFixed(2)}g)
                        </span>
                        {"  "}Out:{" "}
                        <span className="font-medium text-foreground">
                          {outCount} ({outWeight.toFixed(2)}g)
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Scrap:{" "}
                        <span className="font-medium text-foreground">
                          {scrapWeight.toFixed(2)}g
                        </span>
                      </p>
                      <div
                        className="mt-1.5 pt-1.5 border-t"
                        style={{ borderColor: border }}
                      >
                        <p className="text-xs font-semibold">
                          Net:{" "}
                          <span
                            style={{
                              color: netPositive
                                ? "oklch(0.50 0.14 155)"
                                : "oklch(0.50 0.16 25)",
                            }}
                          >
                            {netPositive ? "+" : ""}
                            {netWeight.toFixed(2)}g
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Search + Export */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by bill no, material, assign to..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-card border-border focus-visible:ring-primary"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="gap-2 font-medium border-border hover:bg-accent/50 shrink-0"
                  data-ocid="jobs.export_button"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-medium">
                  Download Job Records
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="jobs.export_excel_button"
                  onClick={() => exportJobRecordsExcel(sorted)}
                  className="gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel (.xlsx)
                </DropdownMenuItem>
                <DropdownMenuItem
                  data-ocid="jobs.export_pdf_button"
                  onClick={() => exportJobRecordsPDF(sorted)}
                  className="gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}

        {/* Records Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="rounded-xl border border-border bg-card shadow-warm overflow-hidden"
        >
          {isLoading ? (
            <div className="p-6 space-y-3">
              {["sk1", "sk2", "sk3", "sk4"].map((sk) => (
                <div key={sk} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-8 w-16 ml-auto rounded-md" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <EmptyState onNewJob={onNewJob} hasSearch={search.length > 0} />
          ) : (
            <>
              {/* Desktop table header — scrollable on medium screens */}
              <div className="hidden sm:block overflow-x-auto">
                <div className="min-w-[860px] grid grid-cols-[110px_120px_100px_90px_110px_110px_90px_auto] gap-3 px-4 py-3 border-b border-border bg-muted/30">
                  {columns.map((col) => (
                    <button
                      key={col.key}
                      type="button"
                      title={col.title}
                      onClick={() => handleSortClick(col.key)}
                      className="flex items-center gap-1 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
                    >
                      <span className="truncate">{col.label}</span>
                      {sortColumn === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: "oklch(0.72 0.148 60)" }}
                          />
                        ) : (
                          <ChevronDown
                            className="w-3.5 h-3.5 shrink-0"
                            style={{ color: "oklch(0.72 0.148 60)" }}
                          />
                        )
                      ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5 shrink-0 opacity-40" />
                      )}
                    </button>
                  ))}
                  {/* Empty header for actions column */}
                  <span />
                </div>
              </div>

              <div className="overflow-x-auto">
                <AnimatePresence initial={false}>
                  {sorted.map((record, i) => (
                    <motion.div
                      key={record.id.toString()}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.25 }}
                      className={`group flex items-center gap-3 sm:min-w-[860px] sm:grid sm:grid-cols-[110px_120px_100px_90px_110px_110px_90px_auto] sm:gap-3 px-4 py-4 ${
                        i < sorted.length - 1 ? "border-b border-border" : ""
                      } hover:bg-accent/30 transition-colors duration-150 cursor-pointer`}
                      onClick={() => onViewRecord(record)}
                    >
                      {/* Date */}
                      <div className="min-w-[80px]">
                        <span className="text-sm font-medium text-foreground">
                          {formatDate(record.date)}
                        </span>
                      </div>

                      {/* Assign To */}
                      <div className="min-w-[90px] hidden sm:block">
                        <span className="text-sm text-muted-foreground truncate block">
                          {record.assignTo ?? "–"}
                        </span>
                      </div>

                      {/* Bill No */}
                      <div className="min-w-[70px]">
                        <span
                          className="text-sm font-semibold font-mono"
                          style={{ color: "oklch(0.62 0.14 50)" }}
                        >
                          #{record.billNo}
                        </span>
                      </div>

                      {/* Material */}
                      <div className="min-w-[70px] hidden sm:block">
                        <span className="text-sm text-muted-foreground">
                          {materialLabel(record.material)}
                        </span>
                      </div>

                      {/* Work Received Date */}
                      <div className="min-w-[80px] hidden sm:block">
                        <span className="text-sm text-muted-foreground">
                          {record.workReceivedDate
                            ? formatDate(record.workReceivedDate)
                            : "–"}
                        </span>
                      </div>

                      {/* Delivery Date */}
                      <div className="min-w-[80px] hidden sm:block">
                        <span className="text-sm text-muted-foreground">
                          {record.deliveryDate
                            ? formatDate(record.deliveryDate)
                            : "–"}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="min-w-[70px] hidden sm:block">
                        {record.status === "delivered" ? (
                          <Badge
                            className="text-xs font-semibold border bg-green-500/10 text-green-700 border-green-400/30 dark:text-green-400"
                            variant="outline"
                          >
                            Delivered
                          </Badge>
                        ) : (
                          <Badge
                            className="text-xs font-semibold border bg-amber-500/10 text-amber-700 border-amber-400/30 dark:text-amber-400"
                            variant="outline"
                          >
                            Pending
                          </Badge>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-auto">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewRecord(record);
                          }}
                          aria-label="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-primary hover:bg-primary/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditRecord(record);
                          }}
                          aria-label="Edit record"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(record.id);
                          }}
                          aria-label="Delete record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity sm:hidden" />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </motion.div>

        {sorted.length > 0 && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Showing {sorted.length} of {records.length} records
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-5 px-4">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span style={{ color: "oklch(0.72 0.148 60)" }}>♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      {/* Detail Modal */}
      <AnimatePresence>
        {viewingRecord && (
          <JobDetailModal
            record={viewingRecord}
            onClose={onCloseRecord}
            onEdit={() => {
              onCloseRecord();
              onEditRecord(viewingRecord);
            }}
          />
        )}
      </AnimatePresence>

      {/* Employee Form Dialog */}
      <EmployeeForm
        open={showEmployeeForm}
        onOpenChange={setShowEmployeeForm}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 font-display">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Record
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The job record will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmptyState({
  onNewJob,
  hasSearch,
}: { onNewJob: () => void; hasSearch: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.92 0.06 78 / 0.5), oklch(0.88 0.08 72 / 0.3))",
          border: "1px solid oklch(0.72 0.148 60 / 0.2)",
        }}
      >
        <Gem
          className="w-10 h-10"
          style={{ color: "oklch(0.72 0.148 60 / 0.6)" }}
        />
      </div>
      {hasSearch ? (
        <>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No results found
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            No records match your search. Try a different bill number or
            material.
          </p>
        </>
      ) : (
        <>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
            No job records yet
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-xs mb-6">
            Create your first job record to start tracking karigar work and
            client orders.
          </p>
          <Button
            onClick={onNewJob}
            style={{
              background:
                "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
              color: "oklch(0.12 0.025 45)",
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Job
          </Button>
        </>
      )}
    </div>
  );
}
