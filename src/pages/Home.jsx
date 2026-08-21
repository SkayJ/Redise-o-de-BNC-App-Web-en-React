import React, { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { Link, useNavigate } from "react-router-dom";
import { Bell, ChevronRight, Loader2 } from "lucide-react";
import BalanceCardCarousel from "@/components/banking/BalanceCardCarousel";
import QuickActions from "@/components/banking/QuickActions";
import TransactionItem from "@/components/banking/TransactionItem";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";
import ThemeToggle from "@/components/banking/ThemeToggle";
import { BNCLogoWhite } from "@/components/banking/SunburstLogo";
import NotificationPanel from "@/components/banking/NotificationPanel";
import { useToast } from "@/components/ui/use-toast";

// Pagina principal BNC
// Autor: SkayJ
export default function Home() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const me = await localDB.auth.me();
        setUser(me);
        const userAccounts = await localDB.entities.BankAccount.list();
        setAccounts(userAccounts);
        localStorage.setItem("bnc_cached_accounts", JSON.stringify(userAccounts));
        localStorage.setItem("bnc_cached_user", JSON.stringify({ full_name: me.full_name, email: me.email, id: me.id }));
        const txns = await localDB.entities.Transaction.list("-created_date", 5);
        setTransactions(txns);
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
    loadData();

    const loadUnread = async () => {
      try {
        const notifs = await localDB.entities.Notification.filter({ read: false });
        setUnreadCount(notifs.length);
      } catch {}
    };
    loadUnread();
  }, []);

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
        className="px-4 sm:px-5 pt-12 pb-20 rounded-b-[2rem]"
        style={{ background: "linear-gradient(135deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}
      >
        <div className="max-w-lg lg:max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <BNCLogoWhite size={32} />
              <div>
                <p className="text-white/50 text-xs">Bienvenido</p>
                <h1 className="text-white text-base font-bold">{user?.full_name || "Usuario"}</h1>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              <button onClick={() => setNotifOpen(true)} className="relative w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Bell size={18} className="text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center text-[9px] font-bold text-white bg-[hsl(25_100%_50%)] rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg lg:max-w-5xl mx-auto px-4 sm:px-5 -mt-14 space-y-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Izquierda: Tarjetas + Accesos */}
          <div className="space-y-6 min-w-0">
            {/* Balance Card */}
            {accounts.length > 0 ? (
              <BalanceCardCarousel accounts={accounts} />
            ) : (
              <div className="rounded-2xl bg-card border border-border p-6 text-center">
                <p className="text-muted-foreground text-sm mb-3">No tienes una cuenta registrada aun.</p>
                <Link to="/perfil" className="text-primary font-semibold text-sm hover:underline">
                  Configurar mi cuenta →
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="min-w-0">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Accesos Rapidos</h2>
              <QuickActions />
            </div>
          </div>

          {/* Derecha: Movimientos */}
          <div className="lg:pt-8 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ultimos Movimientos</h2>
              <Link to="/movimientos" className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline">
                Ver todo <ChevronRight size={14} />
              </Link>
            </div>
            <div className="bg-card rounded-2xl border border-border px-4 divide-y divide-border/50">
              {transactions.length === 0 ? (
                <p className="py-8 text-center text-muted-foreground text-sm">Sin movimientos recientes</p>
              ) : (
                transactions.map((tx) => <TransactionItem key={tx.id} transaction={tx} />)
              )}
            </div>
          </div>
        </div>
      </div>

      <NotificationPanel open={notifOpen} onClose={() => { setNotifOpen(false); setUnreadCount(0); }} />
      <BottomNav />
    </div>
  );
}