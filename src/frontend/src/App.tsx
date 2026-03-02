import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import ExpensesForm from "./components/ExpensesForm";
import JobForm, { type FormData } from "./components/JobForm";
import RecordsList from "./components/RecordsList";
import StockForm from "./components/StockForm";
import { JobType, type LocalJobRecord, Material } from "./hooks/useQueries";

export type AppView = "list" | "new-job" | "edit-job" | "stock" | "expenses";

function recordToFormData(record: LocalJobRecord): FormData {
  return {
    date: record.date ?? new Date().toISOString().split("T")[0],
    assignTo: record.assignTo ?? "",
    jobType: record.jobType ?? JobType.new_,
    billNo: record.billNo ?? "",
    material: record.material ?? Material.gold,
    itemName: record.itemName ?? "",
    givenMaterialWeight:
      record.givenMaterialWeight !== undefined
        ? String(record.givenMaterialWeight)
        : "",
    workDescription: record.workDescription ?? "",
    workReceivedDate:
      record.workReceivedDate ?? new Date().toISOString().split("T")[0],
    receivedItemWeight:
      record.receivedItemWeight !== undefined
        ? String(record.receivedItemWeight)
        : "",
    returnScrapWeight:
      record.returnScrapWeight !== undefined
        ? String(record.returnScrapWeight)
        : "",
    otherCharge:
      record.otherCharge !== undefined ? String(record.otherCharge) : "",
    makingChargeCustomer:
      record.makingChargeCustomer !== undefined
        ? String(record.makingChargeCustomer)
        : "",
    makingChargeKarigar:
      record.makingChargeKarigar !== undefined
        ? String(record.makingChargeKarigar)
        : "",
    deliveryDate: record.deliveryDate ?? "",
    status: record.status ?? "pending",
    remarks: record.remarks ?? "",
  };
}

export default function App() {
  const [view, setView] = useState<AppView>("list");
  const [viewingRecord, setViewingRecord] = useState<LocalJobRecord | null>(
    null,
  );
  const [editingRecord, setEditingRecord] = useState<LocalJobRecord | null>(
    null,
  );

  function goToNewJob() {
    setView("new-job");
  }

  function goToList() {
    setView("list");
    setViewingRecord(null);
    setEditingRecord(null);
  }

  function goToExpenses() {
    setView("expenses");
  }

  function handleViewRecord(record: LocalJobRecord) {
    setViewingRecord(record);
  }

  function goToEditJob(record: LocalJobRecord) {
    setEditingRecord(record);
    setView("edit-job");
  }

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Decorative top accent */}
      <div
        className="fixed top-0 left-0 right-0 h-0.5 z-50"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, oklch(0.72 0.148 60) 30%, oklch(0.88 0.14 78) 50%, oklch(0.72 0.148 60) 70%, transparent 100%)",
        }}
      />

      {view === "list" && (
        <RecordsList
          onNewJob={goToNewJob}
          onViewRecord={handleViewRecord}
          viewingRecord={viewingRecord}
          onCloseRecord={() => setViewingRecord(null)}
          onEditRecord={goToEditJob}
          onStock={() => setView("stock")}
          onExpenses={goToExpenses}
        />
      )}
      {view === "new-job" && (
        <JobForm onSuccess={goToList} onCancel={goToList} />
      )}
      {view === "edit-job" && editingRecord && (
        <JobForm
          initialData={recordToFormData(editingRecord)}
          recordId={editingRecord.id}
          onSuccess={goToList}
          onCancel={goToList}
        />
      )}
      {view === "stock" && <StockForm onBack={goToList} />}
      {view === "expenses" && <ExpensesForm onBack={goToList} />}

      <Toaster
        toastOptions={{
          classNames: {
            toast: "font-body",
          },
        }}
      />
    </div>
  );
}
