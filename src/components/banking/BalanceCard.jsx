import React, { useState } from "react";
import { Eye, EyeOff, Copy, Check, Wifi } from "lucide-react";
import { SunburstIcon } from "@/components/banking/SunburstLogo";
import { BNCLogoWhite } from "@/components/banking/SunburstLogo";

// Tarjeta de cuenta estilo tarjeta de debito BNC
// Autor: SkayJ

const VARIANTS = {
  blue: {
    bg: "hsl(219, 100%, 21%)",
    shadow: "shadow-[hsl(228_55%_15%/0.4)]",
    label: "debito",
  },
  green: {
    bg: "hsl(123, 98%, 24%)",
    shadow: "shadow-[hsl(152_50%_15%/0.4)]",
    label: "ahorro",
  },
  gold: {
    bg: "hsl(42, 95%, 32%)",
    shadow: "shadow-[hsl(42_50%_20%/0.4)]",
    label: "credito",
  },
};

export function getAccountVariant(account) {
  if (account?.account_type === "credito") return "gold";
  if (account?.currency === "USD") return "green";
  return "blue";
}

export default function BalanceCard({ account, variant }) {
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState(false);

  const v = VARIANTS[variant || getAccountVariant(account)];

  const formatCurrency = (amount, currency) => {
    if (currency === "USD") return `$ ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
    return `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(account?.account_number || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cedulaLabel = account?.cedula_type && account?.cedula_number
    ? `${account.cedula_type}-${account.cedula_number}`
    : "";

  const accountTypeLabel =
    account?.account_type === "ahorro"
      ? "Cuenta de Ahorro"
      : account?.account_type === "credito"
      ? "Tarjeta de Credito"
      : "Cuenta Corriente";

  return (
    <div className={`relative overflow-hidden w-full max-w-full rounded-3xl p-4 sm:p-5 shadow-2xl ${v.shadow}`}
      style={{ background: v.bg }}
    >


      <div className="relative z-10 text-white">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div>
            <p className="text-white/50 text-[10px] uppercase tracking-widest font-medium">
              {accountTypeLabel}
            </p>
            <p className="text-white/30 text-[9px] mt-0.5">
              {account?.holder_type === "juridica" ? "Persona Juridica" : "Persona Natural"} · {cedulaLabel}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Wifi size={16} className="text-white/60 rotate-90" />
            <div className="flex items-center bg-white/10 rounded-full px-2.5 py-1">
              <span className="text-[10px] font-bold text-[hsl(46_63%_60%)]">{account?.currency || "VES"}</span>
            </div>
          </div>
        </div>

        {/* Chip dorado + Logo BNC */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-7 rounded-md flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, hsl(46 63% 50%), hsl(46 63% 60%))" }}
          >
            <div className="w-7 h-5 rounded-sm border border-yellow-600/30 grid grid-cols-3 gap-[1px] p-[1px]">
              <div className="bg-yellow-700/20 rounded-sm" />
              <div className="bg-yellow-700/20 rounded-sm" />
              <div className="bg-yellow-700/20 rounded-sm" />
              <div className="bg-yellow-700/20 rounded-sm" />
              <div className="bg-yellow-700/20 rounded-sm" />
              <div className="bg-yellow-700/20 rounded-sm" />
            </div>
          </div>
          {/* Logo BNC */}
          <div className="flex items-center gap-1.5">
            <BNCLogoWhite size={32}/>
            <span className="font-black italic text-white text-lg tracking-tight">
              <span className="text-white">B</span>
              <span className="text-white">N</span>
              <span className="text-white">C</span>
            </span>
          </div>
        </div>

        {/* Saldo */}
        <div className="mb-4">
          <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Saldo Disponible</p>
          <div className="flex items-center gap-2 min-w-0">
            <p className="text-xl sm:text-2xl font-bold tracking-tight break-all">
              {showBalance ? formatCurrency(account?.balance || 0, account?.currency) : "••••••••••"}
            </p>
            <button onClick={() => setShowBalance(!showBalance)} className="text-white/40 hover:text-white transition-colors">
              {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-white/30 text-[9px] uppercase tracking-widest mb-0.5">Nº de Cuenta</p>
            <div className="flex items-center gap-1.5 min-w-0">
              <p className="text-[10px] sm:text-xs font-mono tracking-wider break-all">
                {account?.account_number?.replace(/(\d{4})/g, "$1 ").trim() || "0000 0000 0000 0000 0000"}
              </p>
              <button onClick={handleCopy} className="text-white/30 hover:text-white transition-colors">
                {copied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
            <p className="text-white/60 text-[11px] font-medium mt-1.5 break-words">{account?.holder_name || "—"}</p>
          </div>
          <span className="text-white/40 text-[10px] font-medium lowercase tracking-wide flex-shrink-0">{v.label}</span>
        </div>
      </div>
    </div>
  );
}