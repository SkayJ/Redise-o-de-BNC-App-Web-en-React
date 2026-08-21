import { X, Download } from "lucide-react";
import { SunburstIcon } from "@/components/banking/SunburstLogo"; 

// Modal para compartir datos de cuenta via QR
// Autor SkayJ
export default function QRShareModal({ open, onClose, data }) {
  if (!open || !data) return null;

  const qrData = JSON.stringify(data);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrData)}`;

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = "bnc-qr.png";
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-card rounded-3xl p-6 max-w-xs w-full text-center" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Compartir vía QR</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <X size={16} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-center gap-1.5 mb-4">
          <SunburstIcon size={24} className="text-[hsl(223_82%_15%)] dark:text-white" />
          <span className="font-black italic text-lg tracking-tight">
            <span style={{ color: "hsl(25 100% 50%)" }}>B</span>
            <span className="text-[hsl(223_82%_15%)] dark:text-white">N</span>
            <span style={{ color: "hsl(127 73% 33%)" }}>C</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl mb-4 inline-block">
          <img src={qrUrl} alt="Código QR BNC" className="w-52 h-52" />
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Escanea este código para cargar los datos automáticamente
        </p>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Download size={18} /> Descargar QR
        </button>
      </div>
    </div>
  );
}