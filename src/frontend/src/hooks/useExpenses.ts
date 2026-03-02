import { useEffect, useState } from "react";

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

function saveExpenses(records: ExpenseRecord[]): void {
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

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  function addExpense(entry: Omit<ExpenseRecord, "id" | "createdAt">): void {
    const record: ExpenseRecord = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [record, ...prev]);
  }

  function updateExpense(
    id: string,
    changes: Partial<Omit<ExpenseRecord, "id" | "createdAt">>,
  ): void {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...changes } : e)),
    );
  }

  function deleteExpense(id: string): void {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }

  return { expenses, addExpense, updateExpense, deleteExpense };
}
