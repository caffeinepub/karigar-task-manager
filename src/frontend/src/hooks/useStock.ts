import { useEffect, useState } from "react";

export type StockDirection = "in" | "out";
export type StockInType = "buyback" | "raw_stock";
export type StockItem = "resale" | "scrap";
export type StockMaterial = "gold" | "silver";

export interface BuybackEntry {
  id: string;
  type: "buyback";
  date: string;
  material: StockMaterial;
  totalScrapWeight: string;
  givenPureWeight: string;
  currentRate: string;
  givenRate: string;
  amount: string;
  item: StockItem;
  remarks: string;
  createdAt: number;
}

export interface RawStockEntry {
  id: string;
  type: "raw_stock";
  date: string;
  material: StockMaterial;
  weight: string;
  currentRate: string;
  amount: string;
  createdAt: number;
}

export interface StockOutEntry {
  id: string;
  type: "stock_out";
  date: string;
  material: StockMaterial;
  weight: string;
  givenTo: string;
  createdAt: number;
}

export type StockEntry = BuybackEntry | RawStockEntry | StockOutEntry;

const STORAGE_KEY = "karigar_stock";

function loadStock(): StockEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StockEntry[];
  } catch {
    return [];
  }
}

function saveStock(entries: StockEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useStock() {
  const [entries, setEntries] = useState<StockEntry[]>(() => loadStock());

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setEntries(loadStock());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function addEntry(entry: Omit<StockEntry, "id" | "createdAt">) {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      createdAt: Date.now(),
    } as StockEntry;
    setEntries((prev) => {
      const updated = [newEntry, ...prev];
      saveStock(updated);
      return updated;
    });
    return newEntry;
  }

  function removeEntry(id: string) {
    setEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveStock(updated);
      return updated;
    });
  }

  function updateEntry(id: string, changes: Partial<StockEntry>) {
    setEntries((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? ({ ...e, ...changes } as StockEntry) : e,
      );
      saveStock(updated);
      return updated;
    });
  }

  return { entries, addEntry, removeEntry, updateEntry };
}
