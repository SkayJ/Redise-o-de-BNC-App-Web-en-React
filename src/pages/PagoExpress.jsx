import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { localDB } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { formatMoneyDisplay, formatMoneyInput, parseMoneyValue } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, Smartphone, Mail, Lock, CheckCircle2, LogOut } from "lucide-react";
import { BNCLogoWhite } from "@/components/banking/SunburstLogo";
import CurrencyCalculator from "@/components/banking/CurrencyCalculator";
import BiometricModal from "@/components/banking/BiometricModal";
import { useBiometric } from "@/lib/useBiometric";
import VENEZUELAN_BANKS from "@/lib/venezuelanBanks";

// Pago Movil Express - paga sin iniciar sesion, verificando con contraseña
// Autor: SkayJ
export default function PagoExpress() {
  const navigate = useNavigate();
  const bio = useBiometric();
  const [isDesktop, setIsDesktop] = useState(false);
  const [step, setStep] = useState(1);
  const [dest, setDest] = useState({
    phone: "",
    bank_code: "",
    bank_name: "",
    cedula_type: "V",
    cedula_number: "",
    amount: "",
  });
  const [auth, setAuth] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    const desktop = window.innerWidth >= 1024;
    setIsDesktop(desktop);
    if (desktop) navigate("/login");
  }, [navigate]);

  if (isDesktop) return null;

  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    if (!dest.phone || !dest.bank_code || !dest.cedula_number || !dest.amount) {
      setError("Completa todos los campos");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // 1. Login para verificar identidad
      await localDB.auth.loginViaEmailPassword(auth.email, auth.password);
      const me = await localDB.auth.me();

      // 2. Buscar cuenta VES del usuario
      const accounts = await localDB.entities.BankAccount.filter({ created_by_id: me.id });
      const vesAccount = accounts.find((a) => a.currency === "VES") || accounts[0];
      if (!vesAccount) {
        setError("No tienes una cuenta asociada.");
        setLoading(false);
        return;
      }

      const amount = parseMoneyValue(dest.amount);
      if (vesAccount.balance < amount) {
        setError("Saldo insuficiente.");
        setLoading(false);
        return;
      }

      const biometricOk = await bio.confirm();
      if (!biometricOk) {
        setLoading(false);
        return;
      }

      // 3. Crear transaccion
      const reference = "PM" + Date.now().toString().slice(-8);
      const transaction = await localDB.entities.Transaction.create({
        type: "pago_movil",
        amount,
        currency: "VES",
        description: `Pago Movil a ${dest.phone}`,
        status: "completada",
        direction: "salida",
        destination_bank: dest.bank_name,
        destination_phone: dest.phone,
        destination_cedula_type: dest.cedula_type,
        destination_cedula_number: dest.cedula_number,
        reference_number: reference,
        account_id: vesAccount.id,
      });

      // 4. Actualizar saldo
      await localDB.entities.BankAccount.update(vesAccount.id, {
        balance: vesAccount.balance - amount,
      });

      // 5. Notificacion
      await localDB.entities.Notification.create({
        title: "Pago Movil Enviado",
        message: `Bs. ${amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })} a ${dest.phone}`,
        type: "pago",
        read: false,
        amount,
        currency: "VES",
      });

      setResult({ reference, amount, phone: dest.phone, bank: dest.bank_name });
      setStep(3);
    } catch (err) {
      setError(err.message || "Correo o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localDB.auth.logout("/login");
  };

  // Pantalla de exito
  if (step === 3 && result) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-2xl border border-border p-8 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">Pago Enviado</h2>
            <p className="text-sm text-muted-foreground mb-6">Tu pago movil se completo exitosamente</p>

            <div className="space-y-3 text-left mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Referencia</span>
                <span className="font-mono font-semibold text-foreground">{result.reference}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monto</span>
                <span className="font-bold text-foreground">Bs. {result.amount.toLocaleString("es-VE", { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Destino</span>
                <span className="font-medium text-foreground">{result.phone}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Banco</span>
                <span className="font-medium text-foreground text-right">{result.bank}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link to="/">
                <Button className="w-full h-12 font-medium">Ir a mi cuenta</Button>
              </Link>
              <Button variant="ghost" className="w-full h-11 text-sm text-muted-foreground gap-2" onClick={handleLogout}>
                <LogOut size={14} /> Salir
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-5 pt-12 pb-20 rounded-b-[2rem]" style={{ background: "hsl(223 82% 15%)" }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link to="/login" className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <ArrowLeft size={20} className="text-white" />
            </Link>
            <BNCLogoWhite size={28} showText={false} />
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Smartphone size={20} className="text-white" />
            <h1 className="text-white text-2xl font-bold">Pago Movil Express</h1>
          </div>
          <p className="text-white/60 text-sm">Paga sin iniciar sesion · Paso {step} de 2</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-10 space-y-4">
        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>1</div>
          <div className={`flex-1 h-0.5 ${step > 1 ? "bg-primary" : "bg-muted"}`} />
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>2</div>
        </div>

        {error && <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-2xl">{error}</div>}

        {/* Step 1: Payment details */}
        {step === 1 && (
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            <form onSubmit={handleStep1} className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Telefono del destinatario</Label>
                <Input placeholder="0412-1234567" value={dest.phone} onChange={(e) => setDest({ ...dest, phone: e.target.value })} className="h-12 rounded-xl mt-1" required />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Banco destinatario</Label>
                <Select value={dest.bank_code} onValueChange={(v) => {
                  const bank = VENEZUELAN_BANKS.find((b) => b.code === v);
                  setDest({ ...dest, bank_code: v, bank_name: bank?.name || "" });
                }}>
                  <SelectTrigger className="h-12 rounded-xl mt-1"><SelectValue placeholder="Selecciona el banco" /></SelectTrigger>
                  <SelectContent>
                    {VENEZUELAN_BANKS.map((b) => (
                      <SelectItem key={b.code} value={b.code}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cedula del destinatario</Label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  <Select value={dest.cedula_type} onValueChange={(v) => setDest({ ...dest, cedula_type: v })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="V">V</SelectItem>
                      <SelectItem value="E">E</SelectItem>
                      <SelectItem value="J">J</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="col-span-2">
                    <Input placeholder="12345678" value={dest.cedula_number} onChange={(e) => setDest({ ...dest, cedula_number: e.target.value })} className="h-12 rounded-xl" required />
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Monto (Bs.)</Label>
                <Input type="text" inputMode="decimal" placeholder="0,00" value={dest.amount} onChange={(e) => setDest({ ...dest, amount: e.target.value })} className="h-12 rounded-xl mt-1 text-lg font-semibold" required />
              </div>
              <CurrencyCalculator onCalculate={(val) => setDest({ ...dest, amount: val })} />
              <Button type="submit" className="w-full h-12 font-medium">Continuar</Button>
            </form>
          </div>
        )}

        {/* Step 2: Verification */}
        {step === 2 && (
          <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
            {/* Resumen */}
            <div className="bg-muted/50 rounded-xl p-4 mb-4 space-y-1.5">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Telefono</span><span className="font-medium">{dest.phone}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Banco</span><span className="font-medium text-right">{dest.bank_name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Cedula</span><span className="font-medium">{dest.cedula_type}-{dest.cedula_number}</span></div>
              <div className="flex justify-between text-sm pt-1.5 border-t border-border/50"><span className="text-muted-foreground">Monto</span><span className="font-bold text-foreground">Bs. {formatMoneyDisplay(dest.amount, "VES")}</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-muted-foreground text-center">Ingresa tus credenciales para autorizar el pago</p>
              <div>
                <Label className="text-xs text-muted-foreground">Correo electronico</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="tu@correo.com" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} className="pl-10 h-12 rounded-xl" required />
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Contraseña</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} className="pl-10 h-12 rounded-xl" required />
                </div>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" className="h-12 px-4" onClick={() => setStep(1)}><ArrowLeft size={16} /></Button>
                <Button type="submit" className="flex-1 h-12 font-medium" disabled={loading}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : "Pagar"}
                </Button>
              </div>
            </form>
          </div>
        )}

        <Link to="/login">
          <Button variant="ghost" className="w-full h-11 text-sm text-muted-foreground">Volver a iniciar sesion</Button>
        </Link>
      </div>
    </div>
  );
}