import { useEffect, useState } from "react";
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

  // Always sync from backend on every mount when actor is ready.
  // No syncedActorRef guard — the backend is the source of truth and every
  // device (phone, laptop) must fetch fresh data on every app open.
  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;
    (async () => {
      const backendData = await readSentinel<ExpenseRecord[]>(
        actor,
        SENTINEL_EXPENSES,
      );
      if (cancelled) return;

      if (backendData && Array.isArray(backendData)) {
        const localData = loadExpenses();
        // Include local-only entries not yet synced to backend
        const backendIds = new Set(backendData.map((e) => e.id));
        const localOnly = localData.filter((e) => !backendIds.has(e.id));
        const merged = [...backendData, ...localOnly];
        // If there were local-only entries, push full merged list back to backend
        if (localOnly.length > 0) {
          writeSentinel(actor, SENTINEL_EXPENSES, merged);
        }
        saveExpensesLocal(merged);
        setExpenses(merged);
      } else {
        // Backend returned nothing — push local data to backend so it's available on other devices
        const localData = loadExpenses();
        if (localData.length > 0) {
          writeSentinel(actor, SENTINEL_EXPENSES, localData);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run whenever actor becomes available (covers page re-opens & device switches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const updated = [record, ...expenses];
    saveExpensesLocal(updated);
    setExpenses(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_EXPENSES, updated);
    }
  }

  function updateExpense(
    id: string,
    changes: Partial<Omit<ExpenseRecord, "id" | "createdAt">>,
  ): void {
    const updated = expenses.map((e) =>
      e.id === id ? { ...e, ...changes } : e,
    );
    saveExpensesLocal(updated);
    setExpenses(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_EXPENSES, updated);
    }
  }

  function deleteExpense(id: string): void {
    const updated = expenses.filter((e) => e.id !== id);
    saveExpensesLocal(updated);
    setExpenses(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_EXPENSES, updated);
    }
  }

  return { expenses, addExpense, updateExpense, deleteExpense };
}
