import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import JobForm from "./components/JobForm";
import RecordsList from "./components/RecordsList";
import type { LocalJobRecord } from "./hooks/useQueries";

export type AppView = "list" | "new-job";

export default function App() {
  const [view, setView] = useState<AppView>("list");
  const [viewingRecord, setViewingRecord] = useState<LocalJobRecord | null>(
    null,
  );

  function goToNewJob() {
    setView("new-job");
  }

  function goToList() {
    setView("list");
    setViewingRecord(null);
  }

  function handleViewRecord(record: LocalJobRecord) {
    setViewingRecord(record);
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
        />
      )}
      {view === "new-job" && (
        <JobForm onSuccess={goToList} onCancel={goToList} />
      )}

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
