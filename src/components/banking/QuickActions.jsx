import React from "react";
import { Link } from "react-router-dom";
import { Send, Smartphone, DollarSign, Receipt, CreditCard, Clock } from "lucide-react";

// Accesos rapidos del dashboard BNC
// Autor: SkayJ
const actions = [
  { label: "Transferir", icon: Send, path: "/transferir", color: "bg-[hsl(223_82%_95%)] text-[hsl(223_82%_30%)] dark:bg-[hsl(228_55%_20%)] dark:text-[hsl(228_55%_65%)]" },
  { label: "Pago Movil", icon: Smartphone, path: "/pago-movil", color: "bg-[hsl(25_100%_95%)] text-[hsl(25_100%_45%)] dark:bg-[hsl(25_80%_20%)] dark:text-[hsl(25_100%_60%)]" },
  { label: "Comprar $", icon: DollarSign, path: "/comprar-dolares", color: "bg-[hsl(127_73%_95%)] text-[hsl(127_73%_35%)] dark:bg-[hsl(127_50%_20%)] dark:text-[hsl(127_73%_55%)]" },
  { label: "Servicios", icon: Receipt, path: "/servicios", color: "bg-[hsl(223_82%_95%)] text-[hsl(223_82%_30%)] dark:bg-[hsl(228_55%_20%)] dark:text-[hsl(228_55%_65%)]" },
  { label: "Cuentas", icon: CreditCard, path: "/cuentas", color: "bg-[hsl(25_100%_95%)] text-[hsl(25_100%_45%)] dark:bg-[hsl(25_80%_20%)] dark:text-[hsl(25_100%_60%)]" },
  { label: "Historial", icon: Clock, path: "/movimientos", color: "bg-[hsl(127_73%_95%)] text-[hsl(127_73%_35%)] dark:bg-[hsl(127_50%_20%)] dark:text-[hsl(127_73%_55%)]" },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-2.5 w-full min-w-0">
      {actions.map((action) => (
        <Link
          key={action.label}
          to={action.path}
          className="flex flex-col items-center gap-1.5 p-2.5 sm:p-3 rounded-2xl bg-card border border-border hover:shadow-md hover:border-primary/20 transition-all duration-200 group min-w-0"
        >
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}>
            <action.icon size={18} />
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-foreground/80 text-center break-words">{action.label}</span>
        </Link>
      ))}
    </div>
  );
}