import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ArrowLeftRight, Clock, User } from "lucide-react";

// Barra de navegacion inferior BNC
// Autor: SkayJ
const navItems = [
  { label: "Inicio", icon: Home, path: "/" },
  { label: "Transferir", icon: ArrowLeftRight, path: "/transferir" },
  { label: "Movimientos", icon: Clock, path: "/movimientos" },
  { label: "Perfil", icon: User, path: "/perfil" },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-[hsl(223_82%_15%)] dark:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all duration-200 ${
                isActive ? "bg-[hsl(223_82%_95%)] dark:bg-[hsl(228_55%_20%)]" : ""
              }`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}