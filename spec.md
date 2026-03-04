# MKJ Shop Manager

## Current State

The app has:
- A Motoko backend storing only basic job records (missing assignTo, deliveryDate, status fields)
- All employee data stored in localStorage only (key: `karigar_employees`)
- All stock data stored in localStorage only (key: `karigar_stock`)
- All expense data stored in localStorage only (key: `expenses_records`)
- Job records partially stored in backend but with missing fields; frontend falls back to localStorage
- Data is NOT shared across devices -- each device/browser has its own separate localStorage

## Requested Changes (Diff)

### Add
- Backend: `Employee` data model with CRUD (name, phone)
- Backend: `StockEntry` data model with full fields for buyback, raw_stock, stock_out types
- Backend: `ExpenseRecord` data model with all fields (date, amount, category, remarks, description)
- Backend: Update `JobRecord` to include `assignTo`, `deliveryDate`, `status` fields
- Backend: `updateJobRecord` function to update all job fields
- Frontend: Migrate all hooks (useEmployees, useStock, useExpenses, useQueries) to use backend canister as primary source of truth
- Frontend: Keep localStorage as a local cache/fallback for offline resilience, but always sync to backend on each write
- Frontend: On app load, fetch all data from backend and update localStorage cache

### Modify
- Backend `JobRecord` type: add `assignTo: ?Text`, `deliveryDate: ?Text`, `status: ?Text`
- Backend `createJobRecord`: accept all new fields
- Frontend `useQueries.ts`: backend is source of truth; on load fetch from backend, merge with any unsynced local records
- Frontend `useEmployees.ts`: persist to backend; load from backend on mount
- Frontend `useStock.ts`: persist to backend; load from backend on mount
- Frontend `useExpenses.ts`: persist to backend; load from backend on mount

### Remove
- Reliance on localStorage as sole storage for employees, stock, expenses

## Implementation Plan

1. Generate new Motoko backend with:
   - Full JobRecord (with assignTo, deliveryDate, status, all existing fields)
   - createJobRecord / updateJobRecord / deleteJobRecord / getAllJobRecords
   - Employee CRUD: createEmployee, deleteEmployee, getAllEmployees
   - StockEntry CRUD: createStockEntry, updateStockEntry, deleteStockEntry, getAllStockEntries (supports buyback/raw_stock/stock_out types with variant type)
   - ExpenseRecord CRUD: createExpense, updateExpense, deleteExpense, getAllExpenses

2. Update frontend hooks to:
   - On mount: fetch from backend, update local cache
   - On create/update/delete: write to backend first, update local cache on success
   - Fallback to localStorage if backend unreachable

3. Keep localStorage as a resilience cache so the app works offline and data loads instantly
