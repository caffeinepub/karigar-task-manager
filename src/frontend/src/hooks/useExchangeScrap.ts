import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import {
  SENTINEL_EXCHANGE_SCRAP,
  readSentinel,
  writeSentinel,
} from "./useSentinel";

export type OldScrapType = "resale" | "refine";

export interface ExchangeScrapEntry {
  id: string;
  date: string;
  exchangeScrapWeight: string;
  givenPureWeight: string;
  oldScrap: OldScrapType;
  remarks: string;
  createdAt: string;
}

const STORAGE_KEY = "exchange_scrap_records";

function loadExchangeScrap(): ExchangeScrapEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ExchangeScrapEntry[];
  } catch {
    return [];
  }
}

function saveExchangeScrapLocal(records: ExchangeScrapEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore storage errors
  }
}

export function useExchangeScrap() {
  const [exchangeScrapEntries, setExchangeScrapEntries] = useState<
    ExchangeScrapEntry[]
  >(() => loadExchangeScrap());
  const { actor, isFetching } = useActor();

  // Always sync from backend on every mount when actor is ready.
  // No syncedActorRef guard — the backend is the source of truth and every
  // device (phone, laptop) must fetch fresh data on every app open.
  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;
    (async () => {
      const backendData = await readSentinel<ExchangeScrapEntry[]>(
        actor,
        SENTINEL_EXCHANGE_SCRAP,
      );
      if (cancelled) return;

      if (backendData && Array.isArray(backendData)) {
        const localData = loadExchangeScrap();
        // Include local-only entries not yet synced to backend
        const backendIds = new Set(backendData.map((e) => e.id));
        const localOnly = localData.filter((e) => !backendIds.has(e.id));
        const merged = [...backendData, ...localOnly];
        // If there were local-only entries, push full merged list back to backend
        if (localOnly.length > 0) {
          writeSentinel(actor, SENTINEL_EXCHANGE_SCRAP, merged);
        }
        saveExchangeScrapLocal(merged);
        setExchangeScrapEntries(merged);
      } else {
        // Backend returned nothing — push local data to backend so it's available on other devices
        const localData = loadExchangeScrap();
        if (localData.length > 0) {
          writeSentinel(actor, SENTINEL_EXCHANGE_SCRAP, localData);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run whenever actor becomes available (covers page re-opens & device switches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, isFetching]);

  // Persist to localStorage whenever entries change (keeps cache fresh)
  useEffect(() => {
    saveExchangeScrapLocal(exchangeScrapEntries);
  }, [exchangeScrapEntries]);

  function addExchangeScrap(
    entry: Omit<ExchangeScrapEntry, "id" | "createdAt">,
  ): void {
    const record: ExchangeScrapEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [record, ...exchangeScrapEntries];
    saveExchangeScrapLocal(updated);
    setExchangeScrapEntries(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_EXCHANGE_SCRAP, updated);
    }
  }

  function updateExchangeScrap(
    id: string,
    changes: Partial<Omit<ExchangeScrapEntry, "id" | "createdAt">>,
  ): void {
    const updated = exchangeScrapEntries.map((e) =>
      e.id === id ? { ...e, ...changes } : e,
    );
    saveExchangeScrapLocal(updated);
    setExchangeScrapEntries(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_EXCHANGE_SCRAP, updated);
    }
  }

  function deleteExchangeScrap(id: string): void {
    const updated = exchangeScrapEntries.filter((e) => e.id !== id);
    saveExchangeScrapLocal(updated);
    setExchangeScrapEntries(updated);
    if (actor) {
      writeSentinel(actor, SENTINEL_EXCHANGE_SCRAP, updated);
    }
  }

  return {
    exchangeScrapEntries,
    addExchangeScrap,
    updateExchangeScrap,
    deleteExchangeScrap,
  };
}
