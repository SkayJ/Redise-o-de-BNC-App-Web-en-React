import React from "react";
import { Send, Smartphone, ArrowDownToLine, CreditCard, Receipt, DollarSign } from "lucide-react";
import moment from "moment";

// Item de transaccion con colores BNC
// Autor: SkayJ
const typeConfig = {
  transferencia: { icon: Send, label: "Transferencia", color: "bg-blue-50 text-[hsl(223_82%_40%)] dark:bg-blue-950/50 dark:text-blue-400" },
  pago_movil: { icon: Smartphone, label: "Pago Movil", color: "bg-orange-50 text-[hsl(25_100%_45%)] dark:bg-orange-950/50 dark:text-orange-400" },
  deposito: { icon: ArrowDownToLine, label: "Deposito", color: "bg-green-50 text-[hsl(127_73%_38%)] dark:bg-green-950/50 dark:text-green-400" },
  retiro: { icon: CreditCard, label: "Retiro", color: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400" },
  pago_servicio: { icon: Receipt, label: "Pago Servicio", color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" },
  compra_dolares: { icon: DollarSign, label: "Compra de Dolares", color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
  venta_dolares: { icon: DollarSign, label: "Venta de Dolares", color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
};

export default function TransactionItem({ transaction }) {
  const config = typeConfig[transaction.type] || typeConfig.transferencia;
  const Icon = config.icon;
  const isIncome = transaction.direction === "entrada";

  const formatAmount = (amount, currency) => {
    const prefix = isIncome ? "+" : "-";
    if (currency === "USD") return `${prefix} $${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    return `${prefix} Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex items-center gap-3 py-3">
      <div className={`w-10 h-10 rounded-xl ${config.color} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {transaction.destination_name || transaction.description || config.label}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {moment(transaction.created_date).format("DD MMM, hh:mm a")} · {config.label}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold ${isIncome ? "text-[hsl(127_73%_33%)] dark:text-[hsl(127_73%_45%)]" : "text-foreground"}`}>
          {formatAmount(transaction.amount, transaction.currency)}
        </p>
        <p className={`text-[10px] font-medium mt-0.5 ${
          transaction.status === "completada" ? "text-[hsl(127_73%_38%)] dark:text-[hsl(127_73%_45%)]" :
          transaction.status === "pendiente" ? "text-[hsl(25_100%_50%)]" : "text-red-500"
        }`}>
          {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
        </p>
      </div>
    </div>
  );
}