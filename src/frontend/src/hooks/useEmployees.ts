import { useEffect, useRef, useState } from "react";
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
  const syncedRef = useRef(false);

  // On mount (once actor is ready): sync from backend — backend wins for cross-device truth
  useEffect(() => {
    if (!actor || isFetching || syncedRef.current) return;
    syncedRef.current = true;

    (async () => {
      const backendData = await readSentinel<Employee[]>(
        actor,
        SENTINEL_EMPLOYEES,
      );
      if (backendData && Array.isArray(backendData)) {
        // Merge: backend data wins (it's the cross-device source of truth)
        const localData = loadEmployees();
        // Include local-only entries (added while offline) not yet in backend
        const backendIds = new Set(backendData.map((e) => e.id));
        const localOnly = localData.filter((e) => !backendIds.has(e.id));
        const merged = [...backendData, ...localOnly];
        saveEmployeesLocal(merged);
        setEmployees(merged);
      }
    })();
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
    setEmployees((prev) => {
      const updated = [...prev, newEmployee];
      saveEmployeesLocal(updated);
      // Fire-and-forget backend sync
      if (actor) {
        writeSentinel(actor, SENTINEL_EMPLOYEES, updated);
      }
      return updated;
    });
  }

  function removeEmployee(id: string) {
    setEmployees((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEmployeesLocal(updated);
      // Fire-and-forget backend sync
      if (actor) {
        writeSentinel(actor, SENTINEL_EMPLOYEES, updated);
      }
      return updated;
    });
  }

  return { employees, addEmployee, removeEmployee };
}
