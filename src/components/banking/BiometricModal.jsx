import React, { useEffect, useState } from "react";
import { Fingerprint, CheckCircle2, X } from "lucide-react";

// Modal de autenticacion biométrica (huella)
// Autor: SkayJ
export default function BiometricModal({ open, onSuccess, onCancel }) {
  const [status, setStatus] = useState("scanning");

  useEffect(() => {
    if (!open) {
      setStatus("scanning");
      return;
    }
    const timer = setTimeout(() => {
      setStatus("success");
      setTimeout(() => {
        onSuccess();
      }, 600);
    }, 1600);
    return () => clearTimeout(timer);
  }, [open, onSuccess]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-5">
      <div className="relative bg-card rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
        >
          <X size={16} className="text-muted-foreground" />
        </button>

        <div className="mb-4">
          {status === "scanning" ? (
            <>
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-[hsl(223_82%_15%)]/5 animate-ping" />
                <div className="absolute inset-2 rounded-full bg-[hsl(223_82%_15%)]/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Fingerprint
                    size={56}
                    className="text-[hsl(223_82%_15%)] dark:text-[hsl(228_55%_55%)] animate-pulse"
                  />
                </div>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Confirma con tu huella</h3>
              <p className="text-sm text-muted-foreground">Coloca tu dedo en el sensor</p>
            </>
          ) : (
            <>
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[hsl(127_73%_33%)]/10 flex items-center justify-center">
                <CheckCircle2 size={44} className="text-[hsl(127_73%_33%)]" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">Huella verificada</h3>
              <p className="text-sm text-muted-foreground">Identidad confirmada</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}