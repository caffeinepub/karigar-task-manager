# MKJ Shop Manager

## Current State
The app has a dashboard (RecordsList) with job stats, stock overview, expense summary, and records table. The header has buttons: Add Employee, Expenses, Stock, New Job. There are separate views for Stock (StockForm) and Expenses (ExpensesForm). Data is persisted via localStorage and synced to backend using sentinel pattern (useStock, useExpenses hooks).

## Requested Changes (Diff)

### Add
- New "Exchange Scrap" button in the header (RecordsList.tsx)
- New `AppView` state: `"exchange-scrap"` in App.tsx
- New hook `useExchangeScrap.ts` (mirrors useStock/useExpenses pattern with localStorage + backend sentinel sync)
- New `ExchangeScrapForm.tsx` component with:
  - Entry tab: form with Date, Exchange Scrap Weight (g), Given Pure Weight (g), Old Scrap dropdown (Resale / Refine), Remarks
  - Records tab: list of past exchange scrap entries with edit/delete
- New dashboard card "Exchange Scrap" in RecordsList.tsx showing:
  - Total exchange count
  - Total exchange scrap weight (sum)
  - Total given pure weight (sum)
  - Breakdown by Old Scrap type (Resale vs Refine count/weight)
  - "View All →" button navigating to exchange scrap view

### Modify
- `App.tsx`: add `exchange-scrap` to `AppView` union type, add `onExchangeScrap` handler, render `<ExchangeScrapForm>` when view is `exchange-scrap`
- `RecordsList.tsx`:
  - Add `onExchangeScrap` prop and "Exchange Scrap" header button (with recycling/exchange icon)
  - Add Exchange Scrap summary card to the dashboard stats section (after expense summary)
- `src/hooks/useSentinel.ts` (or wherever sentinel keys are defined): add new sentinel key for exchange scrap

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/hooks/useExchangeScrap.ts` with ExchangeScrapEntry type, localStorage CRUD, backend sentinel sync (same pattern as useStock/useExpenses)
2. Create `src/components/ExchangeScrapForm.tsx` with entry form + records list tab (edit/delete support)
3. Update `App.tsx`: add `exchange-scrap` view, handler, and render ExchangeScrapForm
4. Update `RecordsList.tsx`: add `onExchangeScrap` prop, header button, and dashboard summary card
5. Validate with typecheck/build
