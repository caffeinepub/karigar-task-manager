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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  ChevronRight,
  Eye,
  Gem,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type JobRecord,
  JobType,
  type LocalJobRecord,
  Material,
  useDeleteJobRecord,
  useGetAllJobRecords,
} from "../hooks/useQueries";
import JobDetailModal from "./JobDetailModal";

interface Props {
  onNewJob: () => void;
  onViewRecord: (r: LocalJobRecord) => void;
  viewingRecord: LocalJobRecord | null;
  onCloseRecord: () => void;
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

function formatDate(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

export default function RecordsList({
  onNewJob,
  onViewRecord,
  viewingRecord,
  onCloseRecord,
}: Props) {
  const { data: rawRecords = [], isLoading } = useGetAllJobRecords();
  const records = rawRecords as LocalJobRecord[];
  const deleteMutation = useDeleteJobRecord();
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [search, setSearch] = useState("");

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

  // Sort newest first by createdAt
  const sorted = [...filtered].sort((a, b) => {
    if (a.createdAt > b.createdAt) return -1;
    if (a.createdAt < b.createdAt) return 1;
    return 0;
  });

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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0.5 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-warm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
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
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
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
            {
              label: "Repairs",
              value: isLoading
                ? "–"
                : records.filter((r) => r.jobType === JobType.repair).length,
              sub: "repair work",
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
        </motion.div>

        {/* Search */}
        {records.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-4"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by bill no, material, type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-card border-border focus-visible:ring-primary"
            />
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
              {/* Desktop table header */}
              <div className="hidden sm:grid grid-cols-[1fr_1fr_100px_100px_auto] gap-4 px-6 py-3 border-b border-border bg-muted/30">
                {["Date", "Bill No", "Type", "Material", ""].map((h) => (
                  <span
                    key={h}
                    className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >
                    {h}
                  </span>
                ))}
              </div>

              <AnimatePresence initial={false}>
                {sorted.map((record, i) => (
                  <motion.div
                    key={record.id.toString()}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, height: 0 }}
                    transition={{ delay: i * 0.03, duration: 0.25 }}
                    className={`group flex items-center gap-3 sm:grid sm:grid-cols-[1fr_1fr_100px_100px_auto] sm:gap-4 px-4 sm:px-6 py-4 ${
                      i < sorted.length - 1 ? "border-b border-border" : ""
                    } hover:bg-accent/30 transition-colors duration-150 cursor-pointer`}
                    onClick={() => onViewRecord(record)}
                  >
                    {/* Date */}
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {formatDate(record.date)}
                      </span>
                    </div>

                    {/* Bill No */}
                    <div>
                      <span
                        className="text-sm font-semibold font-mono"
                        style={{ color: "oklch(0.62 0.14 50)" }}
                      >
                        #{record.billNo}
                      </span>
                    </div>

                    {/* Type Badge */}
                    <div>
                      <Badge
                        className={`text-xs font-semibold border ${
                          record.jobType === JobType.new_
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-blue-500/10 text-blue-600 border-blue-400/30 dark:text-blue-400"
                        }`}
                        variant="outline"
                      >
                        {record.jobType === JobType.new_ ? "New" : "Repair"}
                      </Badge>
                    </div>

                    {/* Material */}
                    <div className="hidden sm:block">
                      <span className="text-sm text-muted-foreground">
                        {materialLabel(record.material)}
                      </span>
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
          <JobDetailModal record={viewingRecord} onClose={onCloseRecord} />
        )}
      </AnimatePresence>

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
