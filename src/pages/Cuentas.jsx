import React, { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Wallet } from "lucide-react";
import BalanceCard, { getAccountVariant } from "@/components/banking/BalanceCard";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";
import { useToast } from "@/components/ui/use-toast";

// Pagina de cuentas BNC
// Autor: SkayJ
export default function Cuentas() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        await localDB.auth.me();
        const userAccounts = await localDB.entities.BankAccount.list();
        setAccounts(userAccounts);
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

  const sortedAccounts = [...accounts].sort((a, b) => {
    const ORDER = { blue: 0, green: 1, gold: 2 };
    return (ORDER[getAccountVariant(a)] ?? 99) - (ORDER[getAccountVariant(b)] ?? 99);
  });

  const totalVES = accounts
    .filter((a) => a.currency === "VES")
    .reduce((sum, a) => sum + (a.balance || 0), 0);
  const totalUSD = accounts
    .filter((a) => a.currency === "USD")
    .reduce((sum, a) => sum + (a.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 lg:pl-64 overflow-x-hidden">
      <DesktopSidebar />
      {/* Header */}
      <div
        className="px-5 pt-12 pb-8 rounded-b-[2rem]"
        style={{ background: "linear-gradient(135deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}
      >
        <div className="max-w-lg lg:max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowLeft size={18} className="text-white" />
            </Link>
            <h1 className="text-white text-lg font-bold">Mis Cuentas</h1>
          </div>

          {/* Resumen total */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Total Bolivares</p>
              <p className="text-white text-lg font-bold mt-1">
                Bs. {totalVES.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-white/10 rounded-2xl p-3">
              <p className="text-white/50 text-[10px] uppercase tracking-wider">Total Dolares</p>
              <p className="text-white text-lg font-bold mt-1">
                $ {totalUSD.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-5xl mx-auto px-5 mt-6 space-y-4">
        {accounts.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-8 text-center">
            <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">No tienes cuentas registradas.</p>
          </div>
        ) : (
          sortedAccounts.map((account) => (
            <BalanceCard key={account.id} account={account} variant={getAccountVariant(account)} />
          ))
        )}
      </div>

      <BottomNav />
    </div>
  );
}