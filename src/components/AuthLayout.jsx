import React from "react";
import { BNCLogo } from "@/components/banking/SunburstLogo";

// Layout de autenticacion con marca BNC
// Autor: SkayJ
export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <>
      {/* Movil */}
      <div
        className="min-h-screen flex items-center justify-center px-4 py-8 lg:hidden"
        style={{ background: "linear-gradient(160deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-block bg-white rounded-3xl px-8 py-5 shadow-2xl mb-5">
              <BNCLogo size={44} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
            {subtitle && <p className="text-white/60 text-sm mt-1.5">{subtitle}</p>}
          </div>
          <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
            {children}
          </div>
          {footer && <p className="text-center text-sm text-white/60 mt-6">{footer}</p>}
        </div>
      </div>

      {/* Desktop - pantalla dividida */}
      <div className="hidden lg:flex min-h-screen">
        <div
          className="w-1/2 flex flex-col justify-center items-center p-12 relative overflow-hidden"
          style={{ background: "linear-gradient(160deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}
        >
          <div className="relative z-10 max-w-md text-center">
            <div className="inline-block bg-white rounded-3xl px-10 py-6 shadow-2xl mb-8">
              <BNCLogo size={56} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Banco Nacional del  Credito</h2>
            <p className="text-white/60 text-base leading-relaxed">
              Tu banco, siempre contigo. Transferencias, pagos moviles y mas, desde cualquier lugar.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full -translate-y-20 translate-x-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/[0.03] rounded-full translate-y-16 -translate-x-12" />
        </div>
        <div className="w-1/2 flex items-center justify-center px-12 py-8 bg-background">
          <div className="w-full max-w-md">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">{title}</h1>
            {subtitle && <p className="text-muted-foreground text-base mb-8">{subtitle}</p>}
            <div className="bg-card rounded-2xl shadow-xl border border-border p-8">
              {children}
            </div>
            {footer && <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>}
          </div>
        </div>
      </div>
    </>
  );
}