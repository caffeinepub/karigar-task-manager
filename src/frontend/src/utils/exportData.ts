import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { ExpenseRecord } from "../hooks/useExpenses";
import type { LocalJobRecord } from "../hooks/useQueries";
import { Material } from "../hooks/useQueries";
import type {
  BuybackEntry,
  RawStockEntry,
  StockEntry,
  StockOutEntry,
} from "../hooks/useStock";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return dateStr;
  }
}

function materialLabel(m: Material): string {
  switch (m) {
    case Material.gold:
      return "Gold";
    case Material.silver:
      return "Silver";
    case Material.other:
      return "Other";
    default:
      return String(m);
  }
}

// ─── JOB RECORDS ─────────────────────────────────────────────────────────────

function jobRecordsToRows(records: LocalJobRecord[]) {
  return records.map((r) => ({
    Date: formatDate(r.date),
    "Bill No": r.billNo,
    "Assign To": r.assignTo ?? "",
    Material: materialLabel(r.material),
    "Item Name": r.itemName ?? "",
    "Given Raw Material Weight (g)": r.givenMaterialWeight ?? "",
    "Rcvd Date": formatDate(r.workReceivedDate ?? ""),
    "Received Item Weight (g)": r.receivedItemWeight ?? "",
    "Return Scrap Weight (g)": r.returnScrapWeight ?? "",
    "Loss Weight (g)": r.lossWeight ?? "",
    "Making Charge (Customer)": r.makingChargeCustomer ?? "",
    "Making Charge (Karigar)": r.makingChargeKarigar ?? "",
    "Delivery Date": formatDate(r.deliveryDate ?? ""),
    Status: r.status
      ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
      : "Pending",
    Remarks: r.remarks ?? "",
  }));
}

export function exportJobRecordsExcel(records: LocalJobRecord[]) {
  const rows = jobRecordsToRows(records);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Job Records");
  XLSX.writeFile(wb, "karigar_job_records.xlsx");
}

export function exportJobRecordsPDF(records: LocalJobRecord[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("MKJ Shop Manager - Job Records", 14, 14);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 21);

  const rows = jobRecordsToRows(records);
  const head = [Object.keys(rows[0] ?? {})];
  const body = rows.map((r) => Object.values(r).map(String));

  autoTable(doc, {
    head,
    body,
    startY: 26,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [184, 144, 50] },
    alternateRowStyles: { fillColor: [252, 248, 240] },
  });

  doc.save("karigar_job_records.pdf");
}

// ─── STOCK RECORDS ────────────────────────────────────────────────────────────

function stockEntryToRow(e: StockEntry): Record<string, string | number> {
  const base = {
    Date: formatDate(e.date),
    Type:
      e.type === "buyback"
        ? "Buyback"
        : e.type === "raw_stock"
          ? "Raw Stock"
          : "Stock Out",
    Material: e.material.charAt(0).toUpperCase() + e.material.slice(1),
  };

  if (e.type === "buyback") {
    const b = e as BuybackEntry;
    return {
      ...base,
      "Total Scrap Weight (g)": b.totalScrapWeight,
      "Given Pure Weight (g)": b.givenPureWeight,
      "Current Rate": b.currentRate,
      "Given Rate": b.givenRate,
      Amount: b.amount,
      Item: b.item.charAt(0).toUpperCase() + b.item.slice(1),
      "Given To / Remarks": b.remarks,
      "Weight (g)": "",
    };
  }
  if (e.type === "raw_stock") {
    const r = e as RawStockEntry;
    return {
      ...base,
      "Total Scrap Weight (g)": "",
      "Given Pure Weight (g)": "",
      "Current Rate": r.currentRate,
      "Given Rate": "",
      Amount: r.amount,
      Item: "",
      "Given To / Remarks": "",
      "Weight (g)": r.weight,
    };
  }
  // stock_out
  const o = e as StockOutEntry;
  return {
    ...base,
    "Total Scrap Weight (g)": "",
    "Given Pure Weight (g)": "",
    "Current Rate": "",
    "Given Rate": "",
    Amount: "",
    Item: "",
    "Given To / Remarks": o.givenTo,
    "Weight (g)": o.weight,
  };
}

export function exportStockRecordsExcel(entries: StockEntry[]) {
  const rows = entries.map(stockEntryToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Stock Records");
  XLSX.writeFile(wb, "karigar_stock_records.xlsx");
}

export function exportStockRecordsPDF(entries: StockEntry[]) {
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14);
  doc.text("MKJ Shop Manager - Stock Records", 14, 14);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 21);

  const rows = entries.map(stockEntryToRow);
  const head = [Object.keys(rows[0] ?? {})];
  const body = rows.map((r) => Object.values(r).map(String));

  autoTable(doc, {
    head,
    body,
    startY: 26,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [184, 144, 50] },
    alternateRowStyles: { fillColor: [252, 248, 240] },
  });

  doc.save("karigar_stock_records.pdf");
}

// ─── EXPENSE RECORDS ──────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  tea_snacks: "Tea & Snacks",
  gas_equipment: "Gas & Equipment",
  daily_wear: "Daily Wear",
  electricity: "Electricity",
  house_expenses: "House Expenses",
  rent: "Rent",
  personal: "Personal",
  other: "Other",
};

function expenseRecordToRow(e: ExpenseRecord): Record<string, string> {
  return {
    Date: formatDate(e.date),
    "Amount (₹)": e.amount,
    For: CATEGORY_LABELS[e.category] ?? e.category,
    Description: e.category === "other" ? e.description : "",
    Remarks: e.remarks,
  };
}

export function exportExpenseRecordsExcel(expenses: ExpenseRecord[]) {
  const rows = expenses.map(expenseRecordToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Expense Records");
  XLSX.writeFile(wb, "karigar_expense_records.xlsx");
}

export function exportExpenseRecordsPDF(expenses: ExpenseRecord[]) {
  const doc = new jsPDF({ orientation: "portrait" });
  doc.setFontSize(14);
  doc.text("MKJ Shop Manager - Expense Records", 14, 14);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 21);

  const rows = expenses.map(expenseRecordToRow);
  const head = [Object.keys(rows[0] ?? {})];
  const body = rows.map((r) => Object.values(r).map(String));

  autoTable(doc, {
    head,
    body,
    startY: 26,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [184, 144, 50] },
    alternateRowStyles: { fillColor: [252, 248, 240] },
  });

  doc.save("karigar_expense_records.pdf");
}
