import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import type { ExchangeScrapEntry } from "../hooks/useExchangeScrap";
import type { ExpenseRecord } from "../hooks/useExpenses";
import type { LocalJobRecord } from "../hooks/useQueries";
import { Material } from "../hooks/useQueries";
import type {
  BuybackEntry,
  ExchangeNewOrderEntry,
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

function typeDisplayLabel(type: StockEntry["type"]): string {
  switch (type) {
    case "buyback":
      return "Buy from Customer";
    case "raw_stock":
      return "Raw Stock Bought";
    case "stock_out":
      return "Stock Out";
    case "exchange_new_order":
      return "Exchange Order";
  }
}

function stockEntryToRow(e: StockEntry): Record<string, string | number> {
  const base = {
    Date: formatDate(e.date),
    Type: typeDisplayLabel(e.type),
    Material: e.material.charAt(0).toUpperCase() + e.material.slice(1),
  };

  if (e.type === "buyback") {
    const b = e as BuybackEntry;
    return {
      ...base,
      "Bill No": "",
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
      "Bill No": "",
      "Total Scrap Weight (g)": "",
      "Given Pure Weight (g)": "",
      "Current Rate": r.currentRate,
      "Given Rate": "",
      Amount: r.amount,
      Item: "",
      "Given To / Remarks": r.remarks ?? "",
      "Weight (g)": r.weight,
    };
  }
  if (e.type === "exchange_new_order") {
    const ex = e as ExchangeNewOrderEntry;
    return {
      ...base,
      "Bill No": ex.billNo,
      "Total Scrap Weight (g)": ex.scrapWeight,
      "Given Pure Weight (g)": ex.givenPureWeight,
      "Current Rate": ex.marketRate,
      "Given Rate": "",
      Amount: "",
      Item: "",
      "Given To / Remarks": ex.remarks,
      "Weight (g)": "",
    };
  }
  // stock_out
  const o = e as StockOutEntry;
  return {
    ...base,
    "Bill No": "",
    "Total Scrap Weight (g)": "",
    "Given Pure Weight (g)": "",
    "Current Rate": "",
    "Given Rate": "",
    Amount: "",
    Item: "",
    "Given To / Remarks": `${o.givenTo}${o.remarks ? ` | ${o.remarks}` : ""}`,
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

// ─── EXCHANGE SCRAP RECORDS ───────────────────────────────────────────────────

function exchangeScrapToRow(e: ExchangeScrapEntry): Record<string, string> {
  return {
    Date: formatDate(e.date),
    "Exchange Scrap Weight (g)": e.exchangeScrapWeight,
    "Given Pure Weight (g)": e.givenPureWeight,
    "Old Scrap": e.oldScrap.charAt(0).toUpperCase() + e.oldScrap.slice(1),
    Remarks: e.remarks,
  };
}

export function exportExchangeScrapExcel(entries: ExchangeScrapEntry[]) {
  const rows = entries.map(exchangeScrapToRow);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Exchange Scrap");
  XLSX.writeFile(wb, "mkj_exchange_scrap.xlsx");
}

export function exportExchangeScrapPDF(entries: ExchangeScrapEntry[]) {
  const doc = new jsPDF({ orientation: "portrait" });
  doc.setFontSize(14);
  doc.text("MKJ Shop Manager - Exchange Scrap Records", 14, 14);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString("en-IN")}`, 14, 21);

  const rows = entries.map(exchangeScrapToRow);
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

  doc.save("mkj_exchange_scrap.pdf");
}

// ─── EXPORT ALL ───────────────────────────────────────────────────────────────

export interface ExportAllData {
  jobs: LocalJobRecord[];
  stockEntries: StockEntry[];
  expenses: ExpenseRecord[];
  exchangeScrap: ExchangeScrapEntry[];
}

export function exportAllDataExcel(data: ExportAllData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Job Records
  const jobRows = data.jobs.map((r) => jobRecordsToRows([r])[0]);
  if (jobRows.length > 0) {
    const ws1 = XLSX.utils.json_to_sheet(jobRows);
    XLSX.utils.book_append_sheet(wb, ws1, "Job Records");
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: "No job records" }]),
      "Job Records",
    );
  }

  // Sheet 2: Stock Records
  const stockRows = data.stockEntries.map(stockEntryToRow);
  if (stockRows.length > 0) {
    const ws2 = XLSX.utils.json_to_sheet(stockRows);
    XLSX.utils.book_append_sheet(wb, ws2, "Stock Records");
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: "No stock records" }]),
      "Stock Records",
    );
  }

  // Sheet 3: Stock Overview & Material Breakdown (summary)
  const goldIn = data.stockEntries.filter(
    (e) =>
      (e.type === "buyback" ||
        e.type === "raw_stock" ||
        e.type === "exchange_new_order") &&
      e.material === "gold",
  );
  const goldOut = data.stockEntries.filter(
    (e): e is StockOutEntry => e.type === "stock_out" && e.material === "gold",
  );
  const silverIn = data.stockEntries.filter(
    (e) =>
      (e.type === "buyback" ||
        e.type === "raw_stock" ||
        e.type === "exchange_new_order") &&
      e.material === "silver",
  );
  const silverOut = data.stockEntries.filter(
    (e): e is StockOutEntry =>
      e.type === "stock_out" && e.material === "silver",
  );

  const goldInWt = goldIn.reduce((s, e) => {
    if (e.type === "buyback")
      return s + (Number.parseFloat((e as BuybackEntry).givenPureWeight) || 0);
    if (e.type === "exchange_new_order")
      return (
        s +
        (Number.parseFloat((e as ExchangeNewOrderEntry).givenPureWeight) || 0)
      );
    return s + (Number.parseFloat((e as RawStockEntry).weight) || 0);
  }, 0);
  const goldOutWt = goldOut.reduce(
    (s, e) => s + (Number.parseFloat(e.weight) || 0),
    0,
  );
  const goldScrap = data.stockEntries
    .filter((e) => e.type === "buyback" && e.material === "gold")
    .reduce(
      (s, e) =>
        s + (Number.parseFloat((e as BuybackEntry).totalScrapWeight) || 0),
      0,
    );

  const silverInWt = silverIn.reduce((s, e) => {
    if (e.type === "buyback")
      return s + (Number.parseFloat((e as BuybackEntry).givenPureWeight) || 0);
    if (e.type === "exchange_new_order")
      return (
        s +
        (Number.parseFloat((e as ExchangeNewOrderEntry).givenPureWeight) || 0)
      );
    return s + (Number.parseFloat((e as RawStockEntry).weight) || 0);
  }, 0);
  const silverOutWt = silverOut.reduce(
    (s, e) => s + (Number.parseFloat(e.weight) || 0),
    0,
  );
  const silverScrap = data.stockEntries
    .filter((e) => e.type === "buyback" && e.material === "silver")
    .reduce(
      (s, e) =>
        s + (Number.parseFloat((e as BuybackEntry).totalScrapWeight) || 0),
      0,
    );

  const stockSummaryRows = [
    {
      Section: "Stock Overview",
      Metric: "Total Stock In (Buyback + Raw + Exchange)",
      Value: data.stockEntries
        .filter(
          (e) =>
            e.type === "buyback" ||
            e.type === "raw_stock" ||
            e.type === "exchange_new_order",
        )
        .length.toString(),
      Unit: "entries",
    },
    {
      Section: "Stock Overview",
      Metric: "Total Buy from Customer",
      Value: data.stockEntries
        .filter((e) => e.type === "buyback")
        .length.toString(),
      Unit: "entries",
    },
    {
      Section: "Stock Overview",
      Metric: "Total Stock Out",
      Value: data.stockEntries
        .filter((e) => e.type === "stock_out")
        .length.toString(),
      Unit: "entries",
    },
    { Section: "", Metric: "", Value: "", Unit: "" },
    {
      Section: "Material Breakdown - Gold",
      Metric: "Stock In Count",
      Value: goldIn.length.toString(),
      Unit: "entries",
    },
    {
      Section: "Material Breakdown - Gold",
      Metric: "Stock In Weight",
      Value: goldInWt.toFixed(2),
      Unit: "grams",
    },
    {
      Section: "Material Breakdown - Gold",
      Metric: "Stock Out Count",
      Value: goldOut.length.toString(),
      Unit: "entries",
    },
    {
      Section: "Material Breakdown - Gold",
      Metric: "Stock Out Weight",
      Value: goldOutWt.toFixed(2),
      Unit: "grams",
    },
    {
      Section: "Material Breakdown - Gold",
      Metric: "Scrap Weight",
      Value: goldScrap.toFixed(2),
      Unit: "grams",
    },
    {
      Section: "Material Breakdown - Gold",
      Metric: "Net Weight (In - Out)",
      Value: (goldInWt - goldOutWt).toFixed(2),
      Unit: "grams",
    },
    { Section: "", Metric: "", Value: "", Unit: "" },
    {
      Section: "Material Breakdown - Silver",
      Metric: "Stock In Count",
      Value: silverIn.length.toString(),
      Unit: "entries",
    },
    {
      Section: "Material Breakdown - Silver",
      Metric: "Stock In Weight",
      Value: silverInWt.toFixed(2),
      Unit: "grams",
    },
    {
      Section: "Material Breakdown - Silver",
      Metric: "Stock Out Count",
      Value: silverOut.length.toString(),
      Unit: "entries",
    },
    {
      Section: "Material Breakdown - Silver",
      Metric: "Stock Out Weight",
      Value: silverOutWt.toFixed(2),
      Unit: "grams",
    },
    {
      Section: "Material Breakdown - Silver",
      Metric: "Scrap Weight",
      Value: silverScrap.toFixed(2),
      Unit: "grams",
    },
    {
      Section: "Material Breakdown - Silver",
      Metric: "Net Weight (In - Out)",
      Value: (silverInWt - silverOutWt).toFixed(2),
      Unit: "grams",
    },
  ];
  const ws3 = XLSX.utils.json_to_sheet(stockSummaryRows);
  XLSX.utils.book_append_sheet(wb, ws3, "Stock Summary");

  // Sheet 4: Expense Records
  const expenseRows = data.expenses.map(expenseRecordToRow);
  if (expenseRows.length > 0) {
    const ws4 = XLSX.utils.json_to_sheet(expenseRows);
    XLSX.utils.book_append_sheet(wb, ws4, "Expense Records");
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: "No expense records" }]),
      "Expense Records",
    );
  }

  // Sheet 5: Expense Summary
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - diffToMonday);
  const weekStartStr = weekStart.toISOString().split("T")[0];
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;

  function sumAmt(list: ExpenseRecord[]) {
    return list.reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0);
  }
  const expSummaryRows = [
    {
      Period: "Today",
      "Total (₹)": sumAmt(
        data.expenses.filter((e) => e.date === todayStr),
      ).toFixed(2),
    },
    {
      Period: "This Week",
      "Total (₹)": sumAmt(
        data.expenses.filter(
          (e) => e.date >= weekStartStr && e.date <= todayStr,
        ),
      ).toFixed(2),
    },
    {
      Period: `This Month (${thisMonthStr})`,
      "Total (₹)": sumAmt(
        data.expenses.filter((e) => e.date.startsWith(thisMonthStr)),
      ).toFixed(2),
    },
    {
      Period: `Previous Month (${prevMonthStr})`,
      "Total (₹)": sumAmt(
        data.expenses.filter((e) => e.date.startsWith(prevMonthStr)),
      ).toFixed(2),
    },
    { Period: "All Time", "Total (₹)": sumAmt(data.expenses).toFixed(2) },
  ];
  const ws5 = XLSX.utils.json_to_sheet(expSummaryRows);
  XLSX.utils.book_append_sheet(wb, ws5, "Expense Summary");

  // Sheet 6: Exchange Scrap Records
  const exchRows = data.exchangeScrap.map(exchangeScrapToRow);
  if (exchRows.length > 0) {
    const ws6 = XLSX.utils.json_to_sheet(exchRows);
    XLSX.utils.book_append_sheet(wb, ws6, "Exchange Scrap");
  } else {
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet([{ Note: "No exchange scrap records" }]),
      "Exchange Scrap",
    );
  }

  // Sheet 7: Old Scrap Breakdown
  const resaleEntries = data.exchangeScrap.filter(
    (e) => e.oldScrap === "resale",
  );
  const refineEntries = data.exchangeScrap.filter(
    (e) => e.oldScrap === "refine",
  );
  const oldScrapRows = [
    {
      Category: "Resale",
      Entries: resaleEntries.length.toString(),
      "Total Scrap Weight (g)": resaleEntries
        .reduce(
          (s, e) => s + (Number.parseFloat(e.exchangeScrapWeight) || 0),
          0,
        )
        .toFixed(2),
      "Total Given Pure Weight (g)": resaleEntries
        .reduce((s, e) => s + (Number.parseFloat(e.givenPureWeight) || 0), 0)
        .toFixed(2),
    },
    {
      Category: "Refine",
      Entries: refineEntries.length.toString(),
      "Total Scrap Weight (g)": refineEntries
        .reduce(
          (s, e) => s + (Number.parseFloat(e.exchangeScrapWeight) || 0),
          0,
        )
        .toFixed(2),
      "Total Given Pure Weight (g)": refineEntries
        .reduce((s, e) => s + (Number.parseFloat(e.givenPureWeight) || 0), 0)
        .toFixed(2),
    },
    {
      Category: "TOTAL",
      Entries: data.exchangeScrap.length.toString(),
      "Total Scrap Weight (g)": data.exchangeScrap
        .reduce(
          (s, e) => s + (Number.parseFloat(e.exchangeScrapWeight) || 0),
          0,
        )
        .toFixed(2),
      "Total Given Pure Weight (g)": data.exchangeScrap
        .reduce((s, e) => s + (Number.parseFloat(e.givenPureWeight) || 0), 0)
        .toFixed(2),
    },
  ];
  const ws7 = XLSX.utils.json_to_sheet(oldScrapRows);
  XLSX.utils.book_append_sheet(wb, ws7, "Old Scrap Breakdown");

  const today = now.toISOString().split("T")[0];
  XLSX.writeFile(wb, `mkj_full_export_${today}.xlsx`);
}

export function exportAllDataPDF(data: ExportAllData) {
  const doc = new jsPDF({ orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const generated = new Date().toLocaleDateString("en-IN");
  const goldColor: [number, number, number] = [184, 144, 50];
  const altRow: [number, number, number] = [252, 248, 240];

  function sectionHeader(title: string, y: number): number {
    doc.setFillColor(184, 144, 50);
    doc.rect(14, y, pageWidth - 28, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 17, y + 5.5);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    return y + 10;
  }

  // Cover / title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("MKJ Shop Manager - Full Data Export", 14, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${generated}`, 14, 23);

  let curY = 30;

  // ── 1. Stock Overview ──────────────────────────────────────────────────────
  curY = sectionHeader("1. Stock Overview", curY);
  const goldIn = data.stockEntries.filter(
    (e) =>
      (e.type === "buyback" ||
        e.type === "raw_stock" ||
        e.type === "exchange_new_order") &&
      e.material === "gold",
  );
  const goldOut = data.stockEntries.filter(
    (e): e is StockOutEntry => e.type === "stock_out" && e.material === "gold",
  );
  const silverIn = data.stockEntries.filter(
    (e) =>
      (e.type === "buyback" ||
        e.type === "raw_stock" ||
        e.type === "exchange_new_order") &&
      e.material === "silver",
  );
  const silverOut = data.stockEntries.filter(
    (e): e is StockOutEntry =>
      e.type === "stock_out" && e.material === "silver",
  );
  const goldInWt = goldIn.reduce((s, e) => {
    if (e.type === "buyback")
      return s + (Number.parseFloat((e as BuybackEntry).givenPureWeight) || 0);
    if (e.type === "exchange_new_order")
      return (
        s +
        (Number.parseFloat((e as ExchangeNewOrderEntry).givenPureWeight) || 0)
      );
    return s + (Number.parseFloat((e as RawStockEntry).weight) || 0);
  }, 0);
  const goldOutWt = goldOut.reduce(
    (s, e) => s + (Number.parseFloat(e.weight) || 0),
    0,
  );
  const goldScrap = data.stockEntries
    .filter((e) => e.type === "buyback" && e.material === "gold")
    .reduce(
      (s, e) =>
        s + (Number.parseFloat((e as BuybackEntry).totalScrapWeight) || 0),
      0,
    );
  const silverInWt = silverIn.reduce((s, e) => {
    if (e.type === "buyback")
      return s + (Number.parseFloat((e as BuybackEntry).givenPureWeight) || 0);
    if (e.type === "exchange_new_order")
      return (
        s +
        (Number.parseFloat((e as ExchangeNewOrderEntry).givenPureWeight) || 0)
      );
    return s + (Number.parseFloat((e as RawStockEntry).weight) || 0);
  }, 0);
  const silverOutWt = silverOut.reduce(
    (s, e) => s + (Number.parseFloat(e.weight) || 0),
    0,
  );
  const silverScrap = data.stockEntries
    .filter((e) => e.type === "buyback" && e.material === "silver")
    .reduce(
      (s, e) =>
        s + (Number.parseFloat((e as BuybackEntry).totalScrapWeight) || 0),
      0,
    );

  autoTable(doc, {
    head: [["Metric", "Gold", "Silver"]],
    body: [
      ["Stock In Count", goldIn.length.toString(), silverIn.length.toString()],
      ["Stock In Weight (g)", goldInWt.toFixed(2), silverInWt.toFixed(2)],
      [
        "Stock Out Count",
        goldOut.length.toString(),
        silverOut.length.toString(),
      ],
      ["Stock Out Weight (g)", goldOutWt.toFixed(2), silverOutWt.toFixed(2)],
      ["Scrap Weight (g)", goldScrap.toFixed(2), silverScrap.toFixed(2)],
      [
        "Net Weight (g)",
        (goldInWt - goldOutWt).toFixed(2),
        (silverInWt - silverOutWt).toFixed(2),
      ],
    ],
    startY: curY,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: goldColor },
    alternateRowStyles: { fillColor: altRow },
    didDrawPage: (d) => {
      curY = (d.cursor?.y ?? curY) + 8;
    },
  });
  curY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // ── 2. Expense Summary ─────────────────────────────────────────────────────
  if (curY > 170) {
    doc.addPage();
    curY = 14;
  }
  curY = sectionHeader("2. Expense Summary", curY);
  const now2 = new Date();
  const todayStr = now2.toISOString().split("T")[0];
  const dow = now2.getDay();
  const wkStart = new Date(now2);
  wkStart.setDate(now2.getDate() - ((dow + 6) % 7));
  const weekStartStr = wkStart.toISOString().split("T")[0];
  const thisMonthStr = `${now2.getFullYear()}-${String(now2.getMonth() + 1).padStart(2, "0")}`;
  const prevMonthDate = new Date(now2.getFullYear(), now2.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  function sumAmt2(list: ExpenseRecord[]) {
    return list
      .reduce((s, e) => s + (Number.parseFloat(e.amount) || 0), 0)
      .toFixed(2);
  }

  autoTable(doc, {
    head: [["Period", "Total (₹)"]],
    body: [
      [
        "Today",
        `₹${sumAmt2(data.expenses.filter((e) => e.date === todayStr))}`,
      ],
      [
        "This Week",
        `₹${sumAmt2(data.expenses.filter((e) => e.date >= weekStartStr && e.date <= todayStr))}`,
      ],
      [
        `This Month (${thisMonthStr})`,
        `₹${sumAmt2(data.expenses.filter((e) => e.date.startsWith(thisMonthStr)))}`,
      ],
      [
        `Previous Month (${prevMonthStr})`,
        `₹${sumAmt2(data.expenses.filter((e) => e.date.startsWith(prevMonthStr)))}`,
      ],
      ["All Time", `₹${sumAmt2(data.expenses)}`],
    ],
    startY: curY,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: goldColor },
    alternateRowStyles: { fillColor: altRow },
  });
  curY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // ── 3. Exchange Scrap Summary ──────────────────────────────────────────────
  if (curY > 170) {
    doc.addPage();
    curY = 14;
  }
  curY = sectionHeader("3. Exchange Scrap Summary", curY);
  const resaleEntries = data.exchangeScrap.filter(
    (e) => e.oldScrap === "resale",
  );
  const refineEntries = data.exchangeScrap.filter(
    (e) => e.oldScrap === "refine",
  );
  autoTable(doc, {
    head: [
      ["Category", "Entries", "Scrap Weight (g)", "Given Pure Weight (g)"],
    ],
    body: [
      [
        "Resale",
        resaleEntries.length.toString(),
        resaleEntries
          .reduce(
            (s, e) => s + (Number.parseFloat(e.exchangeScrapWeight) || 0),
            0,
          )
          .toFixed(2),
        resaleEntries
          .reduce((s, e) => s + (Number.parseFloat(e.givenPureWeight) || 0), 0)
          .toFixed(2),
      ],
      [
        "Refine",
        refineEntries.length.toString(),
        refineEntries
          .reduce(
            (s, e) => s + (Number.parseFloat(e.exchangeScrapWeight) || 0),
            0,
          )
          .toFixed(2),
        refineEntries
          .reduce((s, e) => s + (Number.parseFloat(e.givenPureWeight) || 0), 0)
          .toFixed(2),
      ],
      [
        "TOTAL",
        data.exchangeScrap.length.toString(),
        data.exchangeScrap
          .reduce(
            (s, e) => s + (Number.parseFloat(e.exchangeScrapWeight) || 0),
            0,
          )
          .toFixed(2),
        data.exchangeScrap
          .reduce((s, e) => s + (Number.parseFloat(e.givenPureWeight) || 0), 0)
          .toFixed(2),
      ],
    ],
    startY: curY,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: goldColor },
    alternateRowStyles: { fillColor: altRow },
  });
  curY =
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
      .finalY + 10;

  // ── 4. Job Records (detail) ────────────────────────────────────────────────
  if (data.jobs.length > 0) {
    doc.addPage();
    curY = 14;
    curY = sectionHeader("4. Job Records", curY);
    const jobRows2 = jobRecordsToRows(data.jobs);
    autoTable(doc, {
      head: [Object.keys(jobRows2[0] ?? {})],
      body: jobRows2.map((r) => Object.values(r).map(String)),
      startY: curY,
      styles: { fontSize: 6.5, cellPadding: 1.5 },
      headStyles: { fillColor: goldColor },
      alternateRowStyles: { fillColor: altRow },
    });
    curY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // ── 5. Stock Records (detail) ──────────────────────────────────────────────
  if (data.stockEntries.length > 0) {
    doc.addPage();
    curY = 14;
    curY = sectionHeader("5. Stock Records", curY);
    const stockRows2 = data.stockEntries.map(stockEntryToRow);
    autoTable(doc, {
      head: [Object.keys(stockRows2[0] ?? {})],
      body: stockRows2.map((r) => Object.values(r).map(String)),
      startY: curY,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: goldColor },
      alternateRowStyles: { fillColor: altRow },
    });
    curY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // ── 6. Expense Records (detail) ────────────────────────────────────────────
  if (data.expenses.length > 0) {
    doc.addPage();
    curY = 14;
    curY = sectionHeader("6. Expense Records", curY);
    const expRows2 = data.expenses.map(expenseRecordToRow);
    autoTable(doc, {
      head: [Object.keys(expRows2[0] ?? {})],
      body: expRows2.map((r) => Object.values(r).map(String)),
      startY: curY,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: goldColor },
      alternateRowStyles: { fillColor: altRow },
    });
    curY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // ── 7. Exchange Scrap Records (detail) ─────────────────────────────────────
  if (data.exchangeScrap.length > 0) {
    if (curY > 170) {
      doc.addPage();
      curY = 14;
    }
    curY = sectionHeader("7. Exchange Scrap Records", curY);
    const exchRows2 = data.exchangeScrap.map(exchangeScrapToRow);
    autoTable(doc, {
      head: [Object.keys(exchRows2[0] ?? {})],
      body: exchRows2.map((r) => Object.values(r).map(String)),
      startY: curY,
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: goldColor },
      alternateRowStyles: { fillColor: altRow },
    });
  }

  const today2 = new Date().toISOString().split("T")[0];
  doc.save(`mkj_full_export_${today2}.pdf`);
}
