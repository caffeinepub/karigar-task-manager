import { useEffect, useState } from "react";
import { useActor } from "./useActor";
import { SENTINEL_EMPLOYEES, readSentinel, writeSentinel } from "./useSentinel";

export interface Employee {
  id: string;
  name: string;
  phone: string;
}

const STORAGE_KEY = "karigar_employees";

function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Employee[];
  } catch {
    return [];
  }
}

function saveEmployeesLocal(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees());
  const { actor, isFetching } = useActor();

  // Always sync from backend on every mount when actor is ready.
  // No syncedActorRef guard — the backend is the source of truth and every
  // device (phone, laptop) must fetch fresh data on every app open.
  useEffect(() => {
    if (!actor || isFetching) return;

    let cancelled = false;
    (async () => {
      const backendData = await readSentinel<Employee[]>(
        actor,
        SENTINEL_EMPLOYEES,
      );
      if (cancelled) return;

      if (backendData && Array.isArray(backendData)) {
        // Merge: backend data wins (it's the cross-device source of truth)
        const localData = loadEmployees();
        // Include local-only entries (added while offline) not yet in backend
        const backendIds = new Set(backendData.map((e) => e.id));
        const localOnly = localData.filter((e) => !backendIds.has(e.id));
        const merged = [...backendData, ...localOnly];
        // If there were local-only entries, push full merged list back to backend
        if (localOnly.length > 0) {
          writeSentinel(actor, SENTINEL_EMPLOYEES, merged);
        }
        saveEmployeesLocal(merged);
        setEmployees(merged);
      } else {
        // Backend returned nothing — push local data to backend so it's available on other devices
        const localData = loadEmployees();
        if (localData.length > 0) {
          writeSentinel(actor, SENTINEL_EMPLOYEES, localData);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // Re-run whenever actor becomes available (covers page re-opens & device switches)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor, isFetching]);

  // Keep in sync if another tab updates
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setEmployees(loadEmployees());
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function addEmployee(name: string, phone: string) {
    const newEmployee: Employee = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
    };
    const updated = [...employees, newEmployee];
    saveEmployeesLocal(updated);
    setEmployees(updated);
    // Fire-and-forget backend sync
    if (actor) {
      writeSentinel(actor, SENTINEL_EMPLOYEES, updated);
    }
  }

  function removeEmployee(id: string) {
    const updated = employees.filter((e) => e.id !== id);
    saveEmployeesLocal(updated);
    setEmployees(updated);
    // Fire-and-forget backend sync
    if (actor) {
      writeSentinel(actor, SENTINEL_EMPLOYEES, updated);
    }
  }

  return { employees, addEmployee, removeEmployee };
}
