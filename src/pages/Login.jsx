import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, Fingerprint } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import GoogleIcon from "@/components/GoogleIcon";
import BiometricModal from "@/components/banking/BiometricModal";

/**
 * Página de inicio de sesión.
 * En este prototipo, el inicio de sesión es simulado y redirige directamente al dashboard.
 * @returns {JSX.Element} El componente de la página de Login.
 */
export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bioModalOpen, setBioModalOpen] = useState(false);

  // Verifica si la autenticación biométrica está habilitada en el LocalStorage.
  const biometricEnabled = typeof window !== "undefined" && localStorage.getItem("bnc_biometric") === "true";

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // ==========================================
    // SIMULACIÓN DE INICIO DE SESIÓN DE PRUEBA
    // ==========================================
    // Simulamos un retraso de 1 segundo para que veas la animación de carga
    setTimeout(() => {
      setLoading(false);
      // Usamos navigate para una navegación SPA sin recargar la página.
      navigate("/");
    }, 1000);
  };

  const handleGoogle = () => {
    // Modo de prueba: acceso directo instantáneo con el botón de Google
    navigate("/");
  };

  const handleBiometric = () => {
    setBioModalOpen(true);
  };

  const handleBiometricCancel = () => {
    setBioModalOpen(false);
  };

  const handleBiometricSuccess = () => {
    setBioModalOpen(false);
    // Redirige al home tras una "autenticación" biométrica exitosa.
    navigate("/");
  };

  return (
    <AuthLayout
      title="Bienvenido"
      subtitle="Inicia sesion en tu cuenta BNC"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/register" className="text-white lg:text-primary font-medium hover:underline">
            Crear una
          </Link>
        </>
      }
    >
      {/* Movil: huella siempre disponible */}
      <div className="lg:hidden">
        <Button
          className="w-full h-12 text-sm font-semibold mb-4 gap-2"
          onClick={handleBiometric}
          style={{ background: "hsl(223 82% 15%)" }}
        >
          <Fingerprint size={20} />
          Iniciar con Huella
        </Button>
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">o</span></div>
        </div>
      </div>

      {/* Desktop: huella solo si esta activada */}
      <div className="hidden lg:block">
        {biometricEnabled ? (
          <Button
            className="w-full h-12 text-sm font-semibold mb-6 gap-2"
            onClick={handleBiometric}
            style={{ background: "hsl(223 82% 15%)" }}
          >
            <Fingerprint size={20} />
            Iniciar con Huella
          </Button>
        ) : (
          <Button variant="outline" className="w-full h-12 text-sm font-medium mb-6" onClick={handleGoogle}>
            <GoogleIcon className="w-5 h-5 mr-2" />
            Continuar con Google
          </Button>
        )}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-3 text-muted-foreground">o</span></div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Correo electronico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Contraseña</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Iniciando sesion...
            </>
          ) : (
            "Iniciar Sesion"
          )}
        </Button>
      </form>

      <BiometricModal open={bioModalOpen} onSuccess={handleBiometricSuccess} onCancel={handleBiometricCancel} />

      <div className="mt-6 pt-6 border-t border-border lg:hidden">
        <p className="text-center text-xs text-muted-foreground mb-3">Accesos rapidos sin iniciar sesion</p>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/consultar-saldo">
            <Button variant="outline" className="w-full h-11 text-xs font-medium">
              Consultar Saldo
            </Button>
          </Link>
          <Link to="/pago-express">
            <Button variant="outline" className="w-full h-11 text-xs font-medium">
              Pago Movil
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}