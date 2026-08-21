// src/components/banking/CurrencyCalculator.jsx
import { useState, useEffect } from "react";
import { Calculator, DollarSign, Euro } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBCVRate } from "@/lib/useBCVRate";
import { formatMoneyInput, parseMoneyValue } from "@/lib/utils";

// Calculadora de divisas a BCV para montos en bolivares
// Autor: SkayJ
export default function CurrencyCalculator({ onCalculate }) {
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [foreignAmount, setForeignAmount] = useState("");
  const { usdRate, eurRate, loading, error } = useBCVRate();

  const rate = currency === "USD" ? usdRate : eurRate;

  useEffect(() => {
    if (!foreignAmount || !rate) return;
    const numeric = parseMoneyValue(foreignAmount);
    if (numeric > 0) {
      onCalculate((numeric * rate).toFixed(2));
    }
  }, [rate, foreignAmount, onCalculate]);

  const handleAmountChange = (val) => {
    setForeignAmount(val);

    if (!val || !rate) {
      onCalculate("");
      return;
    }

    const numeric = parseMoneyValue(val);
    onCalculate(numeric > 0 ? (numeric * rate).toFixed(2) : "");
  };

  const switchCurrency = (c) => {
    setCurrency(c);
    setForeignAmount("");
    onCalculate("");
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2">
          <Calculator size={16} className="text-[hsl(25_100%_50%)] dark:text-[hsl(25_100%_60%)]" />
          <span className="text-sm font-medium text-foreground">Calcular desde USD/EUR</span>
        </div>
        <span className="text-xs font-mono text-muted-foreground">
          {loading ? "Sincronizando BCV..." : `BCV: Bs. ${usdRate?.toFixed(2)}`}
        </span>
      </button>

      {open && (
        <div className="p-4 space-y-3 border-t border-border/50">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchCurrency("USD")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currency === "USD"
                  ? "bg-[hsl(127_73%_33%)] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <DollarSign size={16} /> USD
            </button>
            <button
              type="button"
              onClick={() => switchCurrency("EUR")}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currency === "EUR"
                  ? "bg-[hsl(223_82%_15%)] text-white dark:bg-[hsl(228_55%_28%)]"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <Euro size={16} /> EUR
            </button>
          </div>

          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
              Monto en {currency}
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={foreignAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="h-12 rounded-xl text-lg font-bold text-center mt-1 focus-visible:ring-[hsl(25_100%_50%)]"
            />
          </div>

          {foreignAmount && rate && !isNaN(parseMoneyValue(foreignAmount)) && (
            <div className="text-center text-sm bg-[hsl(25_100%_50%)]/10 rounded-lg py-2 border border-[hsl(25_100%_50%)]/20">
              <span className="text-muted-foreground">Equivale a: </span>
              <span className="font-bold text-[hsl(25_100%_45%)] dark:text-[hsl(25_100%_60%)]">
                Bs. {(parseMoneyValue(foreignAmount) * rate).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center font-medium">
            Tasa oficial BCV: Bs. {rate?.toFixed(2)} por 1 {currency}
          </p>
          
          {error && (
            <p className="text-[10px] text-amber-500 text-center font-medium italic">
              * {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}