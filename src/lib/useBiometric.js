import { useState, useCallback, useRef } from "react";

// Hook para autenticacion biometrica (huella)
// Autor: SkayJ
export function useBiometric() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("bnc_biometric") === "true";
  });

  const [modalOpen, setModalOpen] = useState(false);
  const resolverRef = useRef(null);

  const enable = useCallback(() => {
    localStorage.setItem("bnc_biometric", "true");
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    localStorage.removeItem("bnc_biometric");
    setEnabled(false);
  }, []);

  const toggle = useCallback(() => {
    if (enabled) {
      disable();
    } else {
      enable();
    }
  }, [enabled, enable, disable]);

  const confirm = useCallback(() => {
    return new Promise((resolve) => {
      if (!enabled) {
        resolve(true);
        return;
      }
      resolverRef.current = resolve;
      setModalOpen(true);
    });
  }, [enabled]);

  const handleSuccess = useCallback(() => {
    setModalOpen(false);
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setModalOpen(false);
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
  }, []);

  return {
    enabled,
    enable,
    disable,
    toggle,
    modalOpen,
    handleSuccess,
    handleCancel,
    confirm,
  };
}