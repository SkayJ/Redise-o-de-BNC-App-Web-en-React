import React, { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Smartphone, CheckCircle2, Loader2, QrCode, Share2 } from "lucide-react";
import { formatMoneyDisplay, formatMoneyInput, parseMoneyValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";
import BiometricModal from "@/components/banking/BiometricModal";
import { useBiometric } from "@/lib/useBiometric";
import VENEZUELAN_BANKS from "@/lib/venezuelanBanks";
import QRScannerModal from "@/components/banking/QRScannerModal";
import QRShareModal from "@/components/banking/QRShareModal";
import CurrencyCalculator from "@/components/banking/CurrencyCalculator";

/**
 * Página para realizar Pagos Móviles.
 * Utiliza useReducer para un manejo de estado del formulario más robusto.
 * @returns {JSX.Element} El componente de la página de Pago Móvil.
 */

const initialState = {
  cedula_type: "V",
  destination_phone: "",
  destination_cedula_number: "",
  destination_bank: "",
  amount: "",
  description: "",
};

/**
 * Reducer para manejar el estado del formulario de Pago Móvil.
 * @param {typeof initialState} state - El estado actual.
 * @param {{type: string, payload: any}} action - La acción a realizar.
 * @returns {typeof initialState} El nuevo estado.
 */
function pagoMovilReducer(state, action) {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.payload.field]: action.payload.value };
    case "LOAD_FROM_QR":
      return { ...state, ...action.payload };
    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export default function PagoMovil() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const bio = useBiometric();

  // --- ESTADOS DEL COMPONENTE ---

  // Estado para el formulario, manejado por el reducer.
  const [form, dispatch] = React.useReducer(pagoMovilReducer, initialState);

  // Estado para la cuenta de origen del usuario.
  /** @type {[import("./Transfer").BankAccount | null, React.Dispatch<React.SetStateAction<import("./Transfer").BankAccount | null>>]} */
  const [account, setAccount] = useState(null);

  // Estados para controlar el ciclo de vida de la página.
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reference, setReference] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const handleQRScan = (data) => {
    dispatch({
      type: "LOAD_FROM_QR",
      payload: {
        destination_bank: data.bank || "",
        destination_phone: data.phone || "",
        destination_cedula_number: data.cedula_number || "",
        cedula_type: data.cedula_type || "V",
      },
    });
    toast({ title: "QR Escaneado", description: "Datos cargados correctamente." });
  };

  const shareData = {
    type: "pago_movil",
    bank: form.destination_bank,
    phone: form.destination_phone,
    cedula_type: form.cedula_type,
    cedula_number: form.destination_cedula_number,
  };

  useEffect(() => {
    const load = async () => {
      try {
        await localDB.auth.me();
        const accounts = await localDB.entities.BankAccount.list();
        if (accounts.length > 0) setAccount(accounts[0]);
      } catch (error) {
        // Si la autenticación falla (ej. token expirado), redirigir al login.
        toast({
          title: "Sesión no válida",
          description: "Por favor, inicia sesión de nuevo.",
          variant: "destructive",
        });
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!account) return;
    const amount = parseMoneyValue(form.amount);
    if (!amount || amount <= 0) {
      toast({ title: "Monto invalido", variant: "destructive" });
      return;
    }
    if (amount > account.balance) {
      toast({ title: "Saldo insuficiente", variant: "destructive" });
      return;
    }

    const biometricOk = await bio.confirm();
    if (!biometricOk) return;

    setSubmitting(true);
    try {
      const ref = "PM" + Date.now().toString().slice(-8);
      await localDB.entities.Transaction.create({
        type: "pago_movil",
        amount,
        currency: account.currency,
        description: form.description || `Pago Movil a ${form.destination_phone}`,
        status: "completada",
        direction: "salida",
        destination_bank: form.destination_bank,
        destination_phone: form.destination_phone,
        destination_cedula_type: form.cedula_type,
        destination_cedula_number: form.destination_cedula_number,
        destination_holder_type: "natural",
        reference_number: ref,
        account_id: account.id,
      });
      await localDB.entities.BankAccount.update(account.id, { balance: account.balance - amount });
      setReference(ref);
      setSuccess(true);
    } catch (err) {
      toast({ title: "Error", description: "No se pudo completar el pago.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 pb-24">
        <div className="bg-card rounded-3xl p-8 max-w-sm w-full text-center shadow-sm border border-border">
          <div className="w-16 h-16 rounded-full bg-[hsl(127_73%_33%)]/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-[hsl(127_73%_33%)]" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-1">¡Pago Movil Exitoso!</h2>
          <p className="text-muted-foreground text-sm mb-4">Tu pago ha sido procesado correctamente.</p>
          <div className="space-y-2 text-left bg-muted rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monto</span>
              <span className="font-semibold">Bs. {formatMoneyDisplay(form.amount, "VES")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Telefono</span>
              <span className="font-semibold">{form.destination_phone}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Cedula</span>
              <span className="font-semibold">{form.cedula_type}-{form.destination_cedula_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Referencia</span>
              <span className="font-mono font-semibold text-primary">{reference}</span>
            </div>
          </div>
          <Button onClick={() => navigate("/")} className="w-full h-12 rounded-xl">
            Volver al Inicio
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 lg:pl-64 overflow-x-hidden">
      <DesktopSidebar />
      <div className="bg-card border-b border-border px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Pago Movil</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {account && (
          <div className="bg-[hsl(25_100%_50%)]/5 rounded-xl p-3 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Saldo disponible</p>
              <p className="text-lg font-bold text-[hsl(25_100%_45%)]">
                Bs. {account.balance.toLocaleString("es-VE", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Smartphone size={20} className="text-[hsl(25_100%_50%)]/40" />
          </div>
        )}

        {/* Acciones QR */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            type="button"
            onClick={() => setScannerOpen(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[hsl(25_100%_50%)]/30 bg-[hsl(25_100%_95%)] dark:bg-[hsl(25_80%_15%)] text-[hsl(25_100%_45%)] dark:text-[hsl(25_100%_60%)] font-semibold text-sm hover:border-[hsl(25_100%_50%)] transition-all"
          >
            <QrCode size={18} /> Escanear QR
          </button>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-[hsl(223_82%_15%)]/30 bg-[hsl(223_82%_95%)] dark:bg-[hsl(228_55%_15%)] text-[hsl(223_82%_30%)] dark:text-[hsl(228_55%_65%)] font-semibold text-sm hover:border-[hsl(223_82%_15%)] dark:hover:border-[hsl(228_55%_28%)] transition-all"
          >
            <Share2 size={18} /> Compartir QR
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Telefono Destino</Label>
            <Input
              placeholder="0412-1234567"
              value={form.destination_phone}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", payload: { field: "destination_phone", value: e.target.value } })
              }
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Cedula</Label>
              <Select
                value={form.cedula_type}
                onValueChange={(value) =>
                  dispatch({ type: "SET_FIELD", payload: { field: "cedula_type", value } })
                }
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="V">V</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="J">J</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Numero</Label>
              <Input
                placeholder="12345678"
                value={form.destination_cedula_number}
                onChange={(e) =>
                  dispatch({ type: "SET_FIELD", payload: { field: "destination_cedula_number", value: e.target.value } })
                }
                className="h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Banco Destino</Label>
            <Select
              value={form.destination_bank}
              onValueChange={(value) =>
                dispatch({ type: "SET_FIELD", payload: { field: "destination_bank", value } })
              }
            >
              <SelectTrigger className="h-12 rounded-xl bg-card">
                <SelectValue placeholder="Selecciona un banco" />
              </SelectTrigger>
              <SelectContent>
                {VENEZUELAN_BANKS.map((bank) => (
                  <SelectItem key={bank.code} value={bank.name}>{bank.code} - {bank.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Monto (Bs.)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0,00"
              value={form.amount}
              onChange={(e) => dispatch({ type: "SET_FIELD", payload: { field: "amount", value: e.target.value } })}
              className="h-14 rounded-xl text-xl font-bold text-center"
              required
            />
          </div>

          <CurrencyCalculator
            onCalculate={(value) => dispatch({ type: "SET_FIELD", payload: { field: "amount", value } })}
          />

          <div>
            <Label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">Concepto (opcional)</Label>
            <Input
              placeholder="Ej: Pago de comida"
              value={form.description}
              onChange={(e) =>
                dispatch({ type: "SET_FIELD", payload: { field: "description", value: e.target.value } })
              }
              className="h-12 rounded-xl"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !account}
            className="w-full h-14 rounded-xl text-base font-semibold mt-4 gap-2"
            style={{ background: "hsl(25 100% 50%)", color: "white" }}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {bio.enabled && <Smartphone size={18} />}
                {bio.enabled ? "Confirmar con Huella" : "Enviar Pago Movil"}
              </>
            )}
          </Button>
        </form>
      </div>

      <QRScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onScan={handleQRScan} />
      <QRShareModal open={shareOpen} onClose={() => setShareOpen(false)} data={shareData} />
      <BiometricModal open={bio.modalOpen} onSuccess={bio.handleSuccess} onCancel={bio.handleCancel} />
      <BottomNav />
    </div>
  );
}