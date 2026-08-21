// src/components/banking/SunburstLogo.jsx
import React from "react";
import RealBNCLogo from "@/img/logo.svg";

// 1. ICONO BASE (Se adapta al modo oscuro general)
export function SunburstIcon({ size = 40, className = "" }) {
  return (
    <div className={`inline-block ${className}`} style={{ width: size, height: "auto" }}>
      <img 
        src={RealBNCLogo} 
        alt="BNC Icon" 
        className="w-full h-auto dark:brightness-0 dark:invert" 
      />
    </div>
  );
}

// 2. LOGO ESTÁNDAR (Para Login y barras laterales)
export function BNCLogo({ size = 48, showText = true, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img src={RealBNCLogo} alt="BNC Logo" style={{ width: size, height: "auto" }} />
      {showText && (
        <div className="flex items-baseline gap-0.5 font-black italic tracking-tight" style={{ fontSize: size * 0.42 }}>
          <span style={{ color: "hsl(var(--bnc-orange))" }}>B</span>
          <span style={{ color: "hsl(var(--bnc-blue))" }} className="dark:text-white">N</span>
          <span style={{ color: "hsl(var(--bnc-green))" }}>C</span>
        </div>
      )}
    </div>
  );
}

// 3. LOGO BLANCO (Para las tarjetas - Siempre blanco)
export function BNCLogoWhite({ size = 48, showText = true, className = "" }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <img 
        src={RealBNCLogo} 
        alt="BNC Logo Blanco" 
        style={{ width: size, height: "auto" }} 
        className="brightness-0 invert" 
      />
    </div>
  );
}