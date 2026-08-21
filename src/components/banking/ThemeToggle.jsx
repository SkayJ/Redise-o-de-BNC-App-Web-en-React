import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/lib/ThemeContext";

// Boton para alternar modo claro/oscuro
// Autor: SkayJ
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${className}`}
      aria-label="Cambiar tema"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-white/80" />
      ) : (
        <Moon size={18} className="text-white/80" />
      )}
    </button>
  );
}