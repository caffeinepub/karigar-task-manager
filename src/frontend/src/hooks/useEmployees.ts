import { useEffect, useState } from "react";

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

function saveEmployees(employees: Employee[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
}

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>(() => loadEmployees());

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
      saveEmployees(updated);
      return updated;
    });
  }

  function removeEmployee(id: string) {
    setEmployees((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      saveEmployees(updated);
      return updated;
    });
  }

  return { employees, addEmployee, removeEmployee };
}
