import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowLeftRight,
  CalendarDays,
  DollarSign,
  FileText,
  Gem,
  List,
  Package,
  Plus,
  RefreshCw,
  User,
  Weight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useEmployees } from "../hooks/useEmployees";
import {
  type BuybackEntry,
  type ExchangeNewOrderEntry,
  type RawStockEntry,
  type StockEntry,
  type StockInType,
  type StockItem,
  type StockMaterial,
  type StockOutEntry,
  useStock,
} from "../hooks/useStock";
import StockRecordsList from "./StockRecordsList";
import {
  FormCard,
  FormField,
  RadioGroup,
  SectionHeading,
} from "./form-steps/FormHelpers";

interface Props {
  onBack: () => void;
}

type StockDirection = "in" | "out";

const emptyBuyback = {
  date: new Date().toISOString().split("T")[0],
  material: "gold" as StockMaterial,
  totalScrapWeight: "",
  givenPureWeight: "",
  currentRate: "",
  givenRate: "",
  amount: "",
  item: "resale" as StockItem,
  remarks: "",
};

const emptyRawStock = {
  date: new Date().toISOString().split("T")[0],
  material: "gold" as StockMaterial,
  weight: "",
  currentRate: "",
  amount: "",
  remarks: "",
};

const emptyStockOut = {
  date: new Date().toISOString().split("T")[0],
  material: "gold" as StockMaterial,
  weight: "",
  givenTo: "",
  remarks: "",
};

const emptyExchangeNewOrder = {
  date: new Date().toISOString().split("T")[0],
  billNo: "",
  material: "gold" as StockMaterial,
  scrapWeight: "",
  givenPureWeight: "",
  marketRate: "",
  remarks: "",
};

type StockTab = "entry" | "records";

export default function StockForm({ onBack }: Props) {
  const [tab, setTab] = useState<StockTab>("entry");
  const [direction, setDirection] = useState<StockDirection>("in");
  const [stockInType, setStockInType] = useState<StockInType>("raw_stock");

  const [buyback, setBuyback] = useState({ ...emptyBuyback });
  const [rawStock, setRawStock] = useState({ ...emptyRawStock });
  const [stockOut, setStockOut] = useState({ ...emptyStockOut });
  const [exchangeNewOrder, setExchangeNewOrder] = useState({
    ...emptyExchangeNewOrder,
  });

  const { addEntry } = useStock();
  const { employees } = useEmployees();
  const [saving, setSaving] = useState(false);

  function handleSave() {
    setSaving(true);
    try {
      if (direction === "in") {
        if (stockInType === "buyback") {
          const entry: Omit<BuybackEntry, "id" | "createdAt"> = {
            type: "buyback",
            ...buyback,
          };
          addEntry(entry as Omit<StockEntry, "id" | "createdAt">);
          setBuyback({ ...emptyBuyback });
        } else if (stockInType === "raw_stock") {
          const entry: Omit<RawStockEntry, "id" | "createdAt"> = {
            type: "raw_stock",
            ...rawStock,
          };
          addEntry(entry as Omit<StockEntry, "id" | "createdAt">);
          setRawStock({ ...emptyRawStock });
        } else {
          // exchange_new_order
          const entry: Omit<ExchangeNewOrderEntry, "id" | "createdAt"> = {
            type: "exchange_new_order",
            ...exchangeNewOrder,
          };
          addEntry(entry as Omit<StockEntry, "id" | "createdAt">);
          setExchangeNewOrder({ ...emptyExchangeNewOrder });
        }
      } else {
        const entry: Omit<StockOutEntry, "id" | "createdAt"> = {
          type: "stock_out",
          ...stockOut,
        };
        addEntry(entry as Omit<StockEntry, "id" | "createdAt">);
        setStockOut({ ...emptyStockOut });
      }
      toast.success("Stock entry saved successfully");
    } catch {
      toast.error("Failed to save stock entry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0.5 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-warm">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="shrink-0 hover:bg-accent/50"
            aria-label="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.72 0.148 60), oklch(0.62 0.14 50))",
              }}
            >
              <Package className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1
                className="font-display text-lg font-bold leading-tight"
                style={{ color: "oklch(0.22 0.04 50)" }}
              >
                Stock
              </h1>
              <p className="text-xs text-muted-foreground">
                Manage stock entries and records
              </p>
            </div>
          </div>
          {/* Tab toggle */}
          <div className="flex items-center gap-1 bg-muted/60 rounded-lg p-1">
            <button
              type="button"
              data-ocid="stock.entry_tab"
              onClick={() => setTab("entry")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
                tab === "entry"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              New Entry
            </button>
            <button
              type="button"
              data-ocid="stock.records_tab"
              onClick={() => setTab("records")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors duration-150 ${
                tab === "records"
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Records
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Stock Records tab */}
        {tab === "records" && <StockRecordsList />}

        {/* New Entry tab */}
        {tab === "entry" && (
          <>
            {/* Direction toggle */}
            <FormCard>
              <FormField label="Stock Direction">
                <RadioGroup
                  options={[
                    { value: "in", label: "Stock In" },
                    { value: "out", label: "Stock Out" },
                  ]}
                  value={direction}
                  onChange={(v) => setDirection(v as StockDirection)}
                />
              </FormField>

              {direction === "in" && (
                <div className="mt-5">
                  <FormField label="Type">
                    <RadioGroup
                      options={[
                        { value: "raw_stock", label: "Raw Stock Bought" },
                        {
                          value: "exchange_new_order",
                          label: "Exchange for New Order",
                        },
                        { value: "buyback", label: "Buy from Customer" },
                      ]}
                      value={stockInType}
                      onChange={(v) => setStockInType(v as StockInType)}
                    />
                  </FormField>
                </div>
              )}
            </FormCard>

            {/* Raw Stock Bought form */}
            {direction === "in" && stockInType === "raw_stock" && (
              <FormCard>
                <SectionHeading
                  icon={<Gem />}
                  title="Raw Stock Bought"
                  subtitle="Enter raw stock purchased information"
                />
                <div className="space-y-5">
                  <FormField label="Date">
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        value={rawStock.date}
                        onChange={(e) =>
                          setRawStock((p) => ({ ...p, date: e.target.value }))
                        }
                        className="pl-9"
                        data-ocid="stock.rawstock.date_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Material">
                    <Select
                      value={rawStock.material}
                      onValueChange={(v) =>
                        setRawStock((p) => ({
                          ...p,
                          material: v as StockMaterial,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-ocid="stock.rawstock.material_select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.148 65)" }}
                            />
                            Gold
                          </div>
                        </SelectItem>
                        <SelectItem value="silver">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.02 240)" }}
                            />
                            Silver
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={rawStock.weight}
                        onChange={(e) =>
                          setRawStock((p) => ({
                            ...p,
                            weight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="stock.rawstock.weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Market Rate (per gram)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={rawStock.currentRate}
                        onChange={(e) =>
                          setRawStock((p) => ({
                            ...p,
                            currentRate: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-7"
                        data-ocid="stock.rawstock.rate_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Amount (₹)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={rawStock.amount}
                        onChange={(e) =>
                          setRawStock((p) => ({
                            ...p,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-7"
                        data-ocid="stock.rawstock.amount_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Remarks">
                    <Textarea
                      value={rawStock.remarks}
                      onChange={(e) =>
                        setRawStock((p) => ({ ...p, remarks: e.target.value }))
                      }
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={3}
                      data-ocid="stock.rawstock.remarks_textarea"
                    />
                  </FormField>
                </div>
              </FormCard>
            )}

            {/* Exchange for New Order form */}
            {direction === "in" && stockInType === "exchange_new_order" && (
              <FormCard>
                <SectionHeading
                  icon={<RefreshCw />}
                  title="Exchange for New Order"
                  subtitle="Enter exchange details for a new order"
                />
                <div className="space-y-5">
                  <FormField label="Date">
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        value={exchangeNewOrder.date}
                        onChange={(e) =>
                          setExchangeNewOrder((p) => ({
                            ...p,
                            date: e.target.value,
                          }))
                        }
                        className="pl-9"
                        data-ocid="stock.exchange.date_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Bill No.">
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="text"
                        value={exchangeNewOrder.billNo}
                        onChange={(e) =>
                          setExchangeNewOrder((p) => ({
                            ...p,
                            billNo: e.target.value,
                          }))
                        }
                        placeholder="Enter bill number"
                        className="pl-9"
                        data-ocid="stock.exchange.billno_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Material">
                    <Select
                      value={exchangeNewOrder.material}
                      onValueChange={(v) =>
                        setExchangeNewOrder((p) => ({
                          ...p,
                          material: v as StockMaterial,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-ocid="stock.exchange.material_select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.148 65)" }}
                            />
                            Gold
                          </div>
                        </SelectItem>
                        <SelectItem value="silver">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.02 240)" }}
                            />
                            Silver
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Scrap Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={exchangeNewOrder.scrapWeight}
                        onChange={(e) =>
                          setExchangeNewOrder((p) => ({
                            ...p,
                            scrapWeight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="stock.exchange.scrap_weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Given Pure Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={exchangeNewOrder.givenPureWeight}
                        onChange={(e) =>
                          setExchangeNewOrder((p) => ({
                            ...p,
                            givenPureWeight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="stock.exchange.pure_weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Market Rate (per gram)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={exchangeNewOrder.marketRate}
                        onChange={(e) =>
                          setExchangeNewOrder((p) => ({
                            ...p,
                            marketRate: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-7"
                        data-ocid="stock.exchange.market_rate_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Remarks">
                    <Textarea
                      value={exchangeNewOrder.remarks}
                      onChange={(e) =>
                        setExchangeNewOrder((p) => ({
                          ...p,
                          remarks: e.target.value,
                        }))
                      }
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={3}
                      data-ocid="stock.exchange.remarks_textarea"
                    />
                  </FormField>
                </div>
              </FormCard>
            )}

            {/* Buy from Customer (Buyback) form */}
            {direction === "in" && stockInType === "buyback" && (
              <FormCard>
                <SectionHeading
                  icon={<ArrowLeftRight />}
                  title="Buy from Customer"
                  subtitle="Enter customer buyback stock information"
                />
                <div className="space-y-5">
                  <FormField label="Date">
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        value={buyback.date}
                        onChange={(e) =>
                          setBuyback((p) => ({ ...p, date: e.target.value }))
                        }
                        className="pl-9"
                        data-ocid="stock.buyback.date_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Material">
                    <Select
                      value={buyback.material}
                      onValueChange={(v) =>
                        setBuyback((p) => ({
                          ...p,
                          material: v as StockMaterial,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-ocid="stock.buyback.material_select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.148 65)" }}
                            />
                            Gold
                          </div>
                        </SelectItem>
                        <SelectItem value="silver">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.02 240)" }}
                            />
                            Silver
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Scrap Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={buyback.totalScrapWeight}
                        onChange={(e) =>
                          setBuyback((p) => ({
                            ...p,
                            totalScrapWeight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="stock.buyback.scrap_weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Given Pure Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={buyback.givenPureWeight}
                        onChange={(e) =>
                          setBuyback((p) => ({
                            ...p,
                            givenPureWeight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="stock.buyback.pure_weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Market Rate (₹ per gram)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={buyback.currentRate}
                        onChange={(e) =>
                          setBuyback((p) => ({
                            ...p,
                            currentRate: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-7"
                        data-ocid="stock.buyback.market_rate_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Given Rate (per gram)">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={buyback.givenRate}
                        onChange={(e) =>
                          setBuyback((p) => ({
                            ...p,
                            givenRate: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-7"
                        data-ocid="stock.buyback.given_rate_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Amount">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground pointer-events-none">
                        ₹
                      </span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={buyback.amount}
                        onChange={(e) =>
                          setBuyback((p) => ({
                            ...p,
                            amount: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-7"
                        data-ocid="stock.buyback.amount_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Item">
                    <RadioGroup
                      options={[
                        { value: "resale", label: "Resale" },
                        { value: "refine", label: "Refine" },
                      ]}
                      value={buyback.item}
                      onChange={(v) =>
                        setBuyback((p) => ({ ...p, item: v as StockItem }))
                      }
                    />
                  </FormField>

                  <FormField label="Remarks">
                    <Textarea
                      value={buyback.remarks}
                      onChange={(e) =>
                        setBuyback((p) => ({ ...p, remarks: e.target.value }))
                      }
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={3}
                      data-ocid="stock.buyback.remarks_textarea"
                    />
                  </FormField>
                </div>
              </FormCard>
            )}

            {/* Stock Out form */}
            {direction === "out" && (
              <FormCard>
                <SectionHeading
                  icon={<Package />}
                  title="Stock Out Details"
                  subtitle="Enter stock out information"
                />
                <div className="space-y-5">
                  <FormField label="Date">
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="date"
                        value={stockOut.date}
                        onChange={(e) =>
                          setStockOut((p) => ({ ...p, date: e.target.value }))
                        }
                        className="pl-9"
                        data-ocid="stock.out.date_input"
                      />
                    </div>
                  </FormField>

                  <FormField label="Material">
                    <Select
                      value={stockOut.material}
                      onValueChange={(v) =>
                        setStockOut((p) => ({
                          ...p,
                          material: v as StockMaterial,
                        }))
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        data-ocid="stock.out.material_select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gold">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.148 65)" }}
                            />
                            Gold
                          </div>
                        </SelectItem>
                        <SelectItem value="silver">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ background: "oklch(0.75 0.02 240)" }}
                            />
                            Silver
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField label="Given To">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Select
                        value={stockOut.givenTo || "__none__"}
                        onValueChange={(v) =>
                          setStockOut((p) => ({
                            ...p,
                            givenTo: v === "__none__" ? "" : v,
                          }))
                        }
                      >
                        <SelectTrigger
                          className="w-full"
                          data-ocid="stock.out.given_to_select"
                        >
                          <SelectValue placeholder="Select employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none__">
                            <span className="text-muted-foreground">
                              Not specified
                            </span>
                          </SelectItem>
                          {employees.length === 0 ? (
                            <div className="px-3 py-2 text-xs text-muted-foreground italic">
                              No employees added yet
                            </div>
                          ) : (
                            employees.map((emp) => (
                              <SelectItem key={emp.id} value={emp.name}>
                                <div className="flex items-center gap-2">
                                  <User className="w-3 h-3 text-muted-foreground" />
                                  {emp.name}
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormField>

                  <FormField label="Given Weight">
                    <div className="relative">
                      <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={stockOut.weight}
                        onChange={(e) =>
                          setStockOut((p) => ({
                            ...p,
                            weight: e.target.value,
                          }))
                        }
                        placeholder="0.00"
                        className="pl-9 pr-10"
                        data-ocid="stock.out.weight_input"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground">
                        g
                      </span>
                    </div>
                  </FormField>

                  <FormField label="Remarks">
                    <Textarea
                      value={stockOut.remarks}
                      onChange={(e) =>
                        setStockOut((p) => ({ ...p, remarks: e.target.value }))
                      }
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={3}
                      data-ocid="stock.out.remarks_textarea"
                    />
                  </FormField>
                </div>
              </FormCard>
            )}

            {/* Save button */}
            <div className="flex justify-end pb-8">
              <Button
                onClick={handleSave}
                disabled={saving}
                data-ocid="stock.save_button"
                className="gap-2 min-w-36 font-medium shadow-gold-sm"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.75 0.148 65), oklch(0.65 0.14 52))",
                  color: "oklch(0.12 0.025 45)",
                  border: "1px solid oklch(0.68 0.14 58)",
                }}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Package className="w-4 h-4" />
                    Save Stock Entry
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
