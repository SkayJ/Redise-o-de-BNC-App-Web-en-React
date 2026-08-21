import React, { useState } from "react";
import { Link } from "react-router-dom";
import { localDB } from "@/api/localDB";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Lock, Loader2, User, Upload, FileCheck, ArrowLeft, ArrowRight } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import { toast } from "@/components/ui/use-toast";

// Registro de cuenta BNC con cedula y documentos digitales
// Autor: SkayJ
export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    cedula_type: "V",
    cedula_number: "",
  });
  const [docUrls, setDocUrls] = useState({
    constancia_trabajo: "",
    referencias: "",
    rif: "",
  });
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleGoogle = () => {
    window.location.href = "/";
  };

  const handleDocUpload = async (field, file) => {
    if (!file) return;
    setUploading(field);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = typeof reader.result === "string" ? reader.result : "";
        setDocUrls((prev) => ({ ...prev, [field]: dataUrl }));
        toast({ title: "Documento subido correctamente" });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError("Error al subir el documento");
    } finally {
      setUploading(null);
    }
  };

  const handleStep1 = (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setStep(2);
  };

  const handleStep2 = (e) => {
    e.preventDefault();
    setError("");
    if (!form.cedula_number.trim()) {
      setError("Ingresa tu cedula");
      return;
    }
    setStep(3);
  };

  const handleStep3 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await localDB.auth.register({ email: form.email, password: form.password });
      setStep(4);
    } catch (err) {
      setError(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await localDB.auth.verifyOtp({ email: form.email, otpCode });
      if (result?.access_token) {
        localDB.auth.setToken(result.access_token);
      }
      await localDB.entities.AccountApplication.create({
        email: form.email,
        username: form.username,
        cedula_type: form.cedula_type,
        cedula_number: form.cedula_number,
        status: "pendiente",
        constancia_trabajo_url: docUrls.constancia_trabajo,
        referencias_url: docUrls.referencias,
        rif_url: docUrls.rif,
      });
      window.location.href = "/";
    } catch (err) {
      setError(err.message || "Codigo de verificacion invalido");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await localDB.auth.resendOtp(form.email);
      toast({ title: "Codigo enviado", description: "Revisa tu correo." });
    } catch (err) {
      setError(err.message || "Error al reenviar");
    }
  };

  if (step === 4) {
    return (
      <AuthLayout title="Verifica tu correo" subtitle={`Enviamos un codigo a ${form.email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-medium" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</> : "Verificar y Enviar Solicitud"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          ¿No recibiste el codigo?{" "}
          <button onClick={handleResend} className="text-primary font-medium hover:underline">Reenviar</button>
        </p>
      </AuthLayout>
    );
  }

  const stepTitles = ["Datos de Cuenta", "Identificacion", "Documentos"];

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle={`Paso ${step} de 3 · ${stepTitles[step - 1]}`}
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-white lg:text-primary font-medium hover:underline">Iniciar sesion</Link>
        </>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {s}
            </div>
            {i < 2 && <div className={`flex-1 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      {/* Step 1: Account */}
      {step === 1 && (
        <>
          <Button variant="outline" className="w-full h-12 text-sm font-medium mb-4" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continuar con Google
          </Button>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">o</span></div>
          </div>
          <form onSubmit={handleStep1} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electronico</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="tu@correo.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="username" placeholder="SkayJ" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="confirm" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className="pl-10 h-12" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 font-medium">Continuar <ArrowRight size={16} /></Button>
          </form>
        </>
      )}

      {/* Step 2: Cedula */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Cedula de Identidad</Label>
            <div className="grid grid-cols-3 gap-3">
              <Select value={form.cedula_type} onValueChange={(v) => setForm({ ...form, cedula_type: v })}>
                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="V">V</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="J">J</SelectItem>
                </SelectContent>
              </Select>
              <div className="col-span-2">
                <Input placeholder="12345678" value={form.cedula_number} onChange={(e) => setForm({ ...form, cedula_number: e.target.value })} className="h-12 rounded-xl" required />
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="h-12 px-4" onClick={() => setStep(1)}><ArrowLeft size={16} /></Button>
            <Button type="submit" className="flex-1 h-12 font-medium">Continuar <ArrowRight size={16} /></Button>
          </div>
        </form>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <p className="text-xs text-muted-foreground">Sube tus documentos en PDF o imagen. Tu solicitud pasara por un proceso de aprobacion.</p>
          {[
            { field: "constancia_trabajo", label: "Constancia de Trabajo" },
            { field: "referencias", label: "Referencias Personales" },
            { field: "rif", label: "RIF" },
          ].map((doc) => (
            <div key={doc.field}>
              <Label className="text-xs text-muted-foreground">{doc.label}</Label>
              <label className={`mt-1 flex items-center gap-3 p-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${docUrls[doc.field] ? "border-success/30 bg-success/5" : "border-border hover:border-primary/30"}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${docUrls[doc.field] ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                  {docUrls[doc.field] ? <FileCheck size={18} /> : <Upload size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{docUrls[doc.field] ? "Documento subido" : "Subir archivo"}</p>
                  <p className="text-xs text-muted-foreground">PDF, JPG o PNG</p>
                </div>
                {uploading === doc.field && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground flex-shrink-0" />}
                <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => handleDocUpload(doc.field, e.target.files[0])} />
              </label>
            </div>
          ))}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="h-12 px-4" onClick={() => setStep(2)}><ArrowLeft size={16} /></Button>
            <Button type="submit" className="flex-1 h-12 font-medium" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando...</> : "Enviar Solicitud"}
            </Button>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}