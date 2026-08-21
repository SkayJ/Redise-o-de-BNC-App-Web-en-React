import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeftRight, Smartphone, DollarSign, Receipt, CreditCard, Clock, User } from "lucide-react";
import { SunburstIcon } from "@/components/banking/SunburstLogo";

// Barra lateral de escritorio BNC - visible solo en pantallas grandes
// Autor: SkayJ
const navItems = [
  { label: "Inicio", icon: Home, path: "/" },
  { label: "Transferir", icon: ArrowLeftRight, path: "/transferir" },
  { label: "Pago Movil", icon: Smartphone, path: "/pago-movil" },
  { label: "Mesa de Cambio", icon: DollarSign, path: "/comprar-dolares" },
  { label: "Servicios", icon: Receipt, path: "/servicios" },
  { label: "Cuentas", icon: CreditCard, path: "/cuentas" },
  { label: "Movimientos", icon: Clock, path: "/movimientos" },
  { label: "Perfil", icon: User, path: "/perfil" },
];

const hiddenRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export default function DesktopSidebar() {
  const location = useLocation();

  if (hiddenRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <aside className="hidden lg:flex flex-col w-64 fixed left-0 top-0 bottom-0 bg-card border-r border-border z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-border">
        <div className="flex items-center gap-2">
          <SunburstIcon size={32} className="text-[hsl(223_82%_15%)] dark:text-[hls(0, 0%, 100%)]" />
          <span className="font-black italic text-2xl tracking-tight">
            <span className="text-[hsl(25_100%_50%)] dark:text-white">B</span>
            <span className="text-[hsl(223_82%_15%)] dark:text-white">N</span>
            <span className="text-[hsl(127_73%_33%)] dark:text-white">C</span>
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon size={18} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground font-medium">Banco Nacional de Credito</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">© 2026 <a href="https://github.com/SkayJ">Skay J</a> | All Rights Reserved.</p>
      </div>
    </aside>
  );
}