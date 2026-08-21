// @ts-nocheck
import React, { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { ArrowLeft, Search, Filter, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import TransactionItem from "@/components/banking/TransactionItem";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";

// Historial de movimientos BNC
// Autor: SkayJ
const FILTERS = [
  { label: "Todas", value: "all" },
  { label: "Transferencias", value: "transferencia" },
  { label: "Pago Movil", value: "pago_movil" },
  { label: "Depositos", value: "deposito" },
  { label: "Dolares", value: "compra_dolares" },
  { label: "Venta Dolares", value: "venta_dolares" },
  { label: "Servicios", value: "pago_servicio" },
];

export default function Transactions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        await localDB.auth.me();
        const accounts = await localDB.entities.BankAccount.list();
        const accountIds = accounts.map((account) => account.id);
        const txns = await localDB.entities.Transaction.list("-created_date");
        const filteredByUser = txns.filter((tx) => accountIds.includes(tx.account_id));
        setTransactions(filteredByUser);
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
    load();
  }, [navigate, toast]);

  const filtered = transactions.filter((tx) => {
    const matchFilter = activeFilter === "all" || tx.type === activeFilter;
    const matchSearch = !search ||
      tx.destination_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.description?.toLowerCase().includes(search.toLowerCase()) ||
      tx.reference_number?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 lg:pl-64 overflow-x-hidden">
      <DesktopSidebar />
      <div className="bg-card border-b border-border px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
              <ArrowLeft size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">Movimientos</h1>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, concepto o referencia..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 rounded-xl pl-9 bg-muted border-none"
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-4">
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeFilter === f.value
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-card text-muted-foreground border border-border hover:border-primary/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Filter size={40} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No se encontraron movimientos</p>
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border px-4 divide-y divide-border/50">
            {filtered.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}