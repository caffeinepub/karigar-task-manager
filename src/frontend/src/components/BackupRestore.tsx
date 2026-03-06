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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  FileText,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ExpenseRecord } from "../hooks/useExpenses";
import type { LocalJobRecord } from "../hooks/useQueries";
import type { StockEntry } from "../hooks/useStock";
import { exportAllDataExcel, exportAllDataPDF } from "../utils/exportData";

interface BackupData {
  version: number;
  exportedAt: string;
  jobs: unknown[];
  stock: unknown[];
  expenses: unknown[];
  exchangeScrap: unknown[];
  employees: unknown[];
}

interface BackupRestoreProps {
  jobs?: LocalJobRecord[];
  stockEntries?: StockEntry[];
  expenses?: ExpenseRecord[];
}

function bigIntReplacer(_key: string, value: unknown): unknown {
  return typeof value === "bigint" ? value.toString() : value;
}

function readLocalArray(key: string): unknown[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw) as unknown[];
  } catch {
    return [];
  }
}

export default function BackupRestore({
  jobs = [],
  stockEntries = [],
  expenses = [],
}: BackupRestoreProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingRestore, setPendingRestore] = useState<BackupData | null>(null);

  function handleExportAllExcel() {
    try {
      exportAllDataExcel({ jobs, stockEntries, expenses, exchangeScrap: [] });
      toast.success("Full data exported as Excel");
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  function handleExportAllPDF() {
    try {
      exportAllDataPDF({ jobs, stockEntries, expenses, exchangeScrap: [] });
      toast.success("Full data exported as PDF");
    } catch {
      toast.error("Export failed. Please try again.");
    }
  }

  function handleBackup() {
    try {
      const jobs = readLocalArray("karigar_records");
      const stock = readLocalArray("karigar_stock");
      const expenses = readLocalArray("expenses_records");
      const exchangeScrap = readLocalArray("exchange_scrap_records");
      const employees = readLocalArray("karigar_employees");

      const backup: BackupData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        jobs,
        stock,
        expenses,
        exchangeScrap,
        employees,
      };

      const jsonStr = JSON.stringify(backup, bigIntReplacer, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const today = new Date().toISOString().split("T")[0];
      const a = document.createElement("a");
      a.href = url;
      a.download = `mkj-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Backup downloaded successfully");
    } catch {
      toast.error("Failed to create backup. Please try again.");
    }
  }

  function handleRestoreClick() {
    fileInputRef.current?.click();
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so same file can be selected again
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text) as BackupData;

        if (!data.version || !data.exportedAt) {
          toast.error("Invalid backup file. Please select a valid MKJ backup.");
          return;
        }

        setPendingRestore(data);
      } catch {
        toast.error("Invalid backup file. Please select a valid MKJ backup.");
      }
    };
    reader.readAsText(file);
  }

  function handleConfirmRestore() {
    if (!pendingRestore) return;

    try {
      localStorage.setItem(
        "karigar_records",
        JSON.stringify(pendingRestore.jobs ?? []),
      );
      localStorage.setItem(
        "karigar_stock",
        JSON.stringify(pendingRestore.stock ?? []),
      );
      localStorage.setItem(
        "expenses_records",
        JSON.stringify(pendingRestore.expenses ?? []),
      );
      localStorage.setItem(
        "exchange_scrap_records",
        JSON.stringify(pendingRestore.exchangeScrap ?? []),
      );
      localStorage.setItem(
        "karigar_employees",
        JSON.stringify(pendingRestore.employees ?? []),
      );

      setPendingRestore(null);
      toast.success("Data restored successfully. Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.error("Failed to restore backup. Please try again.");
    }
  }

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileSelect}
        data-ocid="backup.upload_button"
      />

      {/* Single dropdown button for Backup / Restore */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 font-medium border-border hover:bg-accent/50"
            data-ocid="backup.open_modal_button"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Backup / Restore</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" data-ocid="backup.dropdown_menu">
          <DropdownMenuItem
            onClick={handleBackup}
            className="gap-2 cursor-pointer"
            data-ocid="backup.primary_button"
          >
            <Download className="w-4 h-4" />
            Backup
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleRestoreClick}
            className="gap-2 cursor-pointer"
            data-ocid="backup.secondary_button"
          >
            <Upload className="w-4 h-4" />
            Restore
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleExportAllExcel}
            className="gap-2 cursor-pointer font-medium"
            data-ocid="backup.export_all_excel_button"
          >
            <FileSpreadsheet className="w-4 h-4 text-green-600" />
            Export All (Excel)
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleExportAllPDF}
            className="gap-2 cursor-pointer font-medium"
            data-ocid="backup.export_all_pdf_button"
          >
            <FileText className="w-4 h-4 text-red-600" />
            Export All (PDF)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Restore confirmation dialog */}
      <AlertDialog
        open={pendingRestore !== null}
        onOpenChange={(o) => !o && setPendingRestore(null)}
      >
        <AlertDialogContent data-ocid="backup.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Restore Backup?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace all current data with:{" "}
              <strong>{pendingRestore?.jobs?.length ?? 0} jobs</strong>,{" "}
              <strong>
                {pendingRestore?.stock?.length ?? 0} stock entries
              </strong>
              ,{" "}
              <strong>{pendingRestore?.expenses?.length ?? 0} expenses</strong>,{" "}
              <strong>
                {pendingRestore?.employees?.length ?? 0} employees
              </strong>
              .
              <br />
              <br />
              Backed up on:{" "}
              {pendingRestore?.exportedAt
                ? new Date(pendingRestore.exportedAt).toLocaleString("en-IN")
                : "unknown"}
              .
              <br />
              <strong>This action cannot be undone.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="backup.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmRestore}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="backup.confirm_button"
            >
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
