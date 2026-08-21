// @ts-nocheck
// src/pages/ComprarDolares.jsx
import React, { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, DollarSign, TrendingUp, ArrowRightLeft, CheckCircle2, Loader2, Wallet } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";
import BiometricModal from "@/components/banking/BiometricModal";
import { useBiometric } from "@/lib/useBiometric";
import { useBCVRate } from "@/lib/useBCVRate";
import { formatMoneyInput as formatMoneyInputUtils, parseMoneyValue } from "@/lib/utils";

export default function ComprarDolares() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const bio = useBiometric();
  const [vesAccount, setVesAccount] = useState(/** @type {any} */ (null));
  const [usdAccount, setUsdAccount] = useState(/** @type {any} */ (null));
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [mode, setMode] = useState("buy");
  const [baseAmount, setBaseAmount] = useState("");
  const [quoteAmount, setQuoteAmount] = useState("");
  const { usdRate: rate, loading: rateLoading } = useBCVRate();

  const parseLocalizedNumber = (value) => parseMoneyValue(value);
  const formatMoneyInput = (value) => formatMoneyInputUtils(value);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        await localDB.auth.me();
        const accounts = await localDB.entities.BankAccount.list();
        const ves = accounts.find((acc) => acc.currency === "VES" && acc.account_type !== "credito") || accounts.find((acc) => acc.currency === "VES");
        const usd = accounts.find((acc) => acc.currency === "USD");
        setVesAccount(ves || null);
        setUsdAccount(usd || null);
      } catch (error) {
        // Si la autenticación falla (ej. token expirado), redirigir al login.
        toast({
          title: "Sesión no válida",
          description: "Por favor, inicia sesión de nuevo.",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    loadAccounts();
  }, [navigate, toast]);

  /** @param {string} value */
  const handleBaseAmountChange = (value) => {
    setBaseAmount(value);

    if (!rate) return;
    const number = parseLocalizedNumber(value);
    const converted = mode === "buy" ? number / rate : number * rate;
    setQuoteAmount(number ? converted.toFixed(2) : "");
  };

  /** @param {string} value */
  const handleQuoteAmountChange = (value) => {
    setQuoteAmount(value);

    if (!rate) return;
    const number = parseLocalizedNumber(value);
    const converted = mode === "buy" ? number * rate : number / rate;
    setBaseAmount(number ? converted.toFixed(2) : "");
  };

  /** @param {React.FormEvent<HTMLFormElement>} e */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rate || !vesAccount || !usdAccount) {
      toast({ title: "No hay cuentas disponibles", variant: "destructive" });
      return;
    }

    const base = parseLocalizedNumber(baseAmount);
    const quote = parseLocalizedNumber(quoteAmount);
    if (!base || !quote || base <= 0 || quote <= 0) {
      toast({ title: "Monto invalido", variant: "destructive" });
      return;
    }

    if (mode === "buy") {
      if (base > vesAccount.balance) {
        toast({ title: "Saldo insuficiente", description: "No tienes suficiente saldo en bolívares para comprar dólares.", variant: "destructive" });
        return;
      }
    } else if (base > usdAccount.balance) {
      toast({ title: "Saldo insuficiente", description: "No tienes suficiente saldo en dólares para vender.", variant: "destructive" });
      return;
    }

    const biometricOk = await bio.confirm();
    if (!biometricOk) return;

    setSubmitting(true);

    try {
      const ref = `${mode === "buy" ? "BUY" : "SELL"}${Date.now().toString().slice(-8)}`;

      if (mode === "buy") {
        await localDB.entities.Transaction.create({
          type: "compra_dolares",
          amount: base,
          currency: "VES",
          direction: "salida",
          description: `Compra de $${quote.toFixed(2)} a tasa BCV`,
          status: "completada",
          reference_number: ref,
          exchange_rate: rate,
          usd_amount: quote,
          account_id: vesAccount.id,
        });

        await localDB.entities.BankAccount.update(vesAccount.id, { balance: vesAccount.balance - base });
        await localDB.entities.BankAccount.update(usdAccount.id, { balance: usdAccount.balance + quote });
      } else {
        await localDB.entities.Transaction.create({
          type: "venta_dolares",
          amount: base,
          currency: "USD",
          direction: "salida",
          description: `Venta de $${base.toFixed(2)} a tasa BCV`,
          status: "completada",
          reference_number: ref,
          exchange_rate: rate,
          ves_amount: quote,
          account_id: usdAccount.id,
        });

        await localDB.entities.BankAccount.update(usdAccount.id, { balance: usdAccount.balance - base });
        await localDB.entities.BankAccount.update(vesAccount.id, { balance: vesAccount.balance + quote });
      }

      setReference(ref);
      setSuccess(true);
    } catch (err) {
      toast({ title: "Error", description: "No se pudo completar la operación.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 pb-24 lg:pb-8 lg:pl-64">
        <DesktopSidebar />
        <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-sm border border-border">
          <div className="w-16 h-16 rounded-full bg-[hsl(127_73%_33%)]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-[hsl(127_73%_33%)]" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">¡Operación Exitosa!</h2>
          <p className="text-muted-foreground text-sm mb-4">Tu cambio de divisas se ha procesado correctamente.</p>
          <div className="space-y-2 text-left bg-muted rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Modo</span>
              <span className="font-semibold">{mode === "buy" ? "Compra" : "Venta"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto</span>
              <span className="font-semibold">{mode === "buy" ? `Bs. ${parseLocalizedNumber(baseAmount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}` : `$ ${parseLocalizedNumber(baseAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tasa BCV</span>
              <span className="font-semibold">Bs. {rate?.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Referencia</span>
              <span className="font-mono font-semibold text-primary">{reference}</span>
            </div>
          </div>
          <button onClick={() => navigate("/")} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold">
            Volver al Inicio
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 lg:pl-64 overflow-x-hidden">
      <DesktopSidebar />
      <div className="max-w-lg lg:max-w-2xl mx-auto px-5 pt-12 space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Mesa de Cambio</h1>
            <p className="text-sm text-muted-foreground">Compra y vende dólares con la tasa BCV</p>
          </div>
        </div>

        <div className="bg-[hsl(127_73%_33%)] text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2 opacity-80">
            <TrendingUp size={16} />
            <p className="text-xs uppercase font-bold">Tasa Oficial BCV</p>
          </div>
          <p className="text-3xl font-bold">Bs. {rate?.toFixed(2) || "0.00"}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setMode("buy");
              setBaseAmount("");
              setQuoteAmount("");
            }}
            className={`py-2 rounded-lg font-bold text-sm transition-all ${mode === "buy" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Comprar $
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("sell");
              setBaseAmount("");
              setQuoteAmount("");
            }}
            className={`py-2 rounded-lg font-bold text-sm transition-all ${mode === "sell" ? "bg-card shadow-sm text-primary" : "text-muted-foreground"}`}
          >
            Vender $
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">
              {mode === "buy" ? "Monto en Bolívares" : "Monto en Dólares"}
            </label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={baseAmount}
              onChange={(e) => handleBaseAmountChange(e.target.value)}
              className="h-12 font-bold bg-card"
            />
          </div>

          <div>
            <label className={`text-xs font-bold uppercase tracking-wider mb-1.5 block ${mode === "buy" ? "text-emerald-600" : "text-[hsl(223_82%_30%)] dark:text-[hsl(223_82%_75%)]"}`}>
              {mode === "buy" ? "Monto en Dólares" : "Monto en Bolívares"}
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 font-bold ${mode === "buy" ? "text-emerald-600" : "text-[hsl(223_82%_30%)] dark:text-[hsl(223_82%_75%)]"}`}>{mode === 'buy' ? '$' : 'Bs.'}</span>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={quoteAmount}
                onChange={(e) => handleQuoteAmountChange(e.target.value)}
                className={`h-12 font-bold pl-10 ${mode === "buy" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500 placeholder:text-emerald-600/50" : "bg-blue-500/10 border-blue-500/50 text-[hsl(223_82%_30%)] dark:text-[hsl(223_82%_75%)] placeholder:text-blue-700/50"}`}
              />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Wallet size={16} />
              Disponibles
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Cuenta USD</p>
                <p className="font-bold text-emerald-600 mt-1">
                  $ {usdAccount?.balance?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "0.00"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/50 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Cuenta VES</p>
                <p className="font-bold text-foreground mt-1">
                  Bs. {vesAccount?.balance?.toLocaleString("es-VE", { minimumFractionDigits: 2 }) || "0.00"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !vesAccount || !usdAccount || rateLoading}
            className="w-full h-12 bg-[hsl(127_73%_33%)] hover:bg-[hsl(127_73%_28%)] font-bold rounded-xl text-white disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <span className="flex items-center justify-center gap-2">
                <ArrowRightLeft size={16} />
                {mode === "buy" ? "Confirmar Compra" : "Confirmar Venta"}
              </span>
            )}
          </button>
        </form>
      </div>

      <BiometricModal open={bio.modalOpen} onSuccess={bio.handleSuccess} onCancel={bio.handleCancel} />
      <BottomNav />
    </div>
  );
}