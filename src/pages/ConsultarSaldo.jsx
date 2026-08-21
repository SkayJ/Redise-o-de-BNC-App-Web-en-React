import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Wallet, TrendingUp, CreditCard } from "lucide-react";
import { BNCLogoWhite } from "@/components/banking/SunburstLogo";
import { useBCVRate } from "@/lib/useBCVRate";

// Consulta de saldo sin iniciar sesion - usa datos guardados en el dispositivo movil
// Autor: SkayJ
export default function ConsultarSaldo() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState(null);
  const [userName, setUserName] = useState("");
  const { usdRate, eurRate, loading: rateLoading } = useBCVRate();

  useEffect(() => {
    // Web: redirigir a login
    if (window.innerWidth >= 1024) {
      navigate("/login");
      return;
    }
    // Movil: leer datos guardados del dispositivo
    const cached = localStorage.getItem("bnc_cached_accounts");
    const cachedUser = localStorage.getItem("bnc_cached_user");
    if (cached) {
      try {
        setAccounts(JSON.parse(cached));
      } catch {
        setAccounts([]);
      }
    } else {
      setAccounts([]);
    }
    if (cachedUser) {
      try {
        const u = JSON.parse(cachedUser);
        setUserName(u.full_name || "");
      } catch {}
    }
  }, []);

  const formatCurrency = (amount, currency) => {
    if (currency === "USD") return `$ ${Number(amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    return `Bs. ${Number(amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  const accountLabel = (acc) => {
    if (acc.account_type === "credito") return "Tarjeta de Credito";
    if (acc.account_type === "ahorro") return "Cuenta de Ahorro";
    return "Cuenta Corriente";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-20 rounded-b-[2rem]" style={{ background: "hsl(223 82% 15%)" }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/login" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <BNCLogoWhite size={28} showText={false} />
          </div>
          <h1 className="text-white text-2xl font-bold">Consultar Saldo</h1>
          <p className="text-white/60 text-sm mt-1">
            {userName ? `Hola, ${userName.split(" ")[0]}` : "Tus cuentas guardadas"}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-10 space-y-4">
        {/* Loading */}
        {accounts === null && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Sin datos guardados */}
        {accounts !== null && accounts.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-8 text-center shadow-sm">
            <Wallet size={40} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No hay datos guardados</p>
            <p className="text-xs text-muted-foreground mb-4">
              Inicia sesion al menos una vez para guardar tus datos en este dispositivo.
            </p>
            <Link to="/login">
              <Button className="h-11">Ir a iniciar sesion</Button>
            </Link>
          </div>
        )}

        {/* Resultados */}
        {accounts !== null && accounts.length > 0 && (
          <div className="space-y-3">
            

            {accounts.map((acc, i) => {
              const isVES = acc.currency !== "USD";
              const usdEquivalent = isVES && usdRate ? (acc.balance / usdRate) : null;
              const eurEquivalent = isVES && eurRate ? (acc.balance / eurRate) : null;

              return (
                <div key={acc.id || i} className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${acc.account_type === "credito" ? "bg-[hsl(42_55%_35%)]/10 text-[hsl(42_55%_35%)]" : acc.currency === "USD" ? "bg-[hsl(152_50%_20%)]/10 text-[hsl(152_50%_20%)]" : "bg-primary/10 text-primary"}`}>
                      {acc.account_type === "credito" ? <CreditCard size={18} /> : <Wallet size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{accountLabel(acc)}</p>
                      <p className="text-xs text-muted-foreground">{acc.bank_name}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(acc.balance || 0, acc.currency)}</p>
                  {isVES && usdEquivalent !== null && (
                    <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                      <span>≈ $ {usdEquivalent.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
                      {eurEquivalent !== null && <span>≈ € {eurEquivalent.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Tasas BCV */}
            {!rateLoading && usdRate && (
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-center gap-3">
                <TrendingUp size={18} className="text-primary flex-shrink-0" />
                <div className="text-xs text-foreground">
                  Tasa BCV: <span className="font-semibold text-foreground">1$ = Bs. {usdRate.toFixed(2)}</span>
                  {eurRate && <> · <span className="font-semibold text-foreground">1€ = Bs. {eurRate.toFixed(2)}</span></>}
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center pt-2">
              Saldo al cierre de tu ultima sesion · Puede no reflejar movimientos recientes
            </p>
          </div>
        )}

        <Link to="/login">
          <Button variant="ghost" className="w-full h-11 text-sm text-muted-foreground">Volver a iniciar sesion</Button>
        </Link>
      </div>
    </div>
  );
}