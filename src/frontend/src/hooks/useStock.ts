import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { SENTINEL_STOCK, readSentinel, writeSentinel } from "./useSentinel";

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

function saveStockLocal(entries: StockEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useStock() {
  const [entries, setEntries] = useState<StockEntry[]>(() => loadStock());
  const { actor, isFetching } = useActor();

  // Always sync from backend on every mount when actor is ready.
  // No syncedActorRef guard — the backend is the source of truth and every
  // device (phone, laptop) must fetch fresh data on every app open.
  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;
    (async () => {
      const backendData = await readSentinel<StockEntry[]>(
        actor,
        SENTINEL_STOCK,
      );
      if (cancelled) return;

      if (backendData && Array.isArray(backendData)) {
        const localData = loadStock();
        // Include local-only entries not yet synced to backend
        const backendIds = new Set(backendData.map((e) => e.id));
        const localOnly = localData.filter((e) => !backendIds.has(e.id));
        const merged = [...backendData, ...localOnly];
        // If there were local-only entries, push full merged list back to backend
        if (localOnly.length > 0) {
          writeSentinel(actor, SENTINEL_STOCK, merged);
        }
        saveStockLocal(merged);
        setEntries(merged);
      } else {
        // Backend returned nothing — push local data to backend so it's available on other devices
        const localData = loadStock();
        if (localData.length > 0) {
          writeSentinel(actor, SENTINEL_STOCK, localData);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run whenever actor becomes available (covers page re-opens & device switches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, isFetching]);

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
    const updated = [newEntry, ...entries];
    saveStockLocal(updated);
    setEntries(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_STOCK, updated);
    }
    return newEntry;
  }

  function removeEntry(id: string) {
    const updated = entries.filter((e) => e.id !== id);
    saveStockLocal(updated);
    setEntries(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_STOCK, updated);
    }
  }

  function updateEntry(id: string, changes: Partial<StockEntry>) {
    const updated = entries.map((e) =>
      e.id === id ? ({ ...e, ...changes } as StockEntry) : e,
    );
    saveStockLocal(updated);
    setEntries(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_STOCK, updated);
    }
  }

  return { entries, addEntry, removeEntry, updateEntry };
}
