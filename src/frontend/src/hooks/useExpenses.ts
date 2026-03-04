import { useEffect, useRef, useState } from "react";
import { useActor } from "./useActor";
import { SENTINEL_EXPENSES, readSentinel, writeSentinel } from "./useSentinel";

export type ExpenseCategory =
  | "tea_snacks"
  | "gas_equipment"
  | "daily_wear"
  | "electricity"
  | "house_expenses"
  | "rent"
  | "personal"
  | "other";

export interface ExpenseRecord {
  id: string;
  date: string;
  amount: string;
  category: ExpenseCategory;
  remarks: string;
  description: string; // only relevant when category === "other"
  createdAt: string;
}

const STORAGE_KEY = "expenses_records";

function loadExpenses(): ExpenseRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExpenseRecord[];
  } catch {
    return [];
  }
}

function saveExpensesLocal(records: ExpenseRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() =>
    loadExpenses(),
  );
  const { actor, isFetching } = useActor();
  const syncedRef = useRef(false);

  // On mount (once actor is ready): sync from backend
  useEffect(() => {
    if (!actor || isFetching || syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      const backendData = await readSentinel<ExpenseRecord[]>(
        actor,
        SENTINEL_EXPENSES,
      );
      if (backendData && Array.isArray(backendData)) {
        const localData = loadExpenses();
        // Include local-only entries not yet synced to backend
        const backendIds = new Set(backendData.map((e) => e.id));
        const localOnly = localData.filter((e) => !backendIds.has(e.id));
        const merged = [...backendData, ...localOnly];
        saveExpensesLocal(merged);
        setExpenses(merged);
      }
    })();
  }, [actor, isFetching]);

  // Persist to localStorage whenever expenses change (keeps cache fresh)
  useEffect(() => {
    saveExpensesLocal(expenses);
  }, [expenses]);

  function addExpense(entry: Omit<ExpenseRecord, "id" | "createdAt">): void {
    const record: ExpenseRecord = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => {
      const updated = [record, ...prev];
      if (actor) {
        writeSentinel(actor, SENTINEL_EXPENSES, updated);
      }
      return updated;
    });
  }

  function updateExpense(
    id: string,
    changes: Partial<Omit<ExpenseRecord, "id" | "createdAt">>,
  ): void {
    setExpenses((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, ...changes } : e));
      if (actor) {
        writeSentinel(actor, SENTINEL_EXPENSES, updated);
      }
      return updated;
    });
  }

  function deleteExpense(id: string): void {
    setExpenses((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      if (actor) {
        writeSentinel(actor, SENTINEL_EXPENSES, updated);
      }
      return updated;
    });
  }

  return { expenses, addExpense, updateExpense, deleteExpense };
}
