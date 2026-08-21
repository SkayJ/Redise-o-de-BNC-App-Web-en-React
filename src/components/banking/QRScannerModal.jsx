import { useState } from "react";
import { X, ScanLine, Loader2, Image as ImageIcon } from "lucide-react";

// Modal de escaneo QR para transferencias y pago movil
// Autor: SkayJ
export default function QRScannerModal({ open, onClose, onScan }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") {
          setError("No se pudo leer la imagen del codigo QR.");
          return;
        }

        const parsed = { data: dataUrl };
        onScan(parsed);
        onClose();
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("No se pudo leer el codigo QR. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-card rounded-3xl p-6 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Escanear QR</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Leyendo codigo QR...</p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ScanLine size={36} className="text-primary" />
            </div>
            <p className="text-sm text-muted-foreground px-2">
              Toma una foto o sube una imagen del codigo QR para cargar los datos automaticamente
            </p>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 w-full">{error}</p>
            )}
            <label className="w-full cursor-pointer">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
              />
              <div className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
                <ImageIcon size={18} /> Seleccionar Imagen
              </div>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}