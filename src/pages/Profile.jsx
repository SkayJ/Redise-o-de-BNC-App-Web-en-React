import React, { useState, useEffect } from "react";
import { localDB } from "@/api/localDB";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut, Loader2, CreditCard, Shield, HelpCircle, ChevronRight, Pencil, Save, Fingerprint, Sun, Moon, Building2, User, Nfc, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";
import { useTheme } from "@/lib/ThemeContext";
import { useBiometric } from "@/lib/useBiometric";
import { BNCLogoWhite } from "@/components/banking/SunburstLogo";

// Perfil de usuario BNC con configuracion de huella y modo oscuro
// Autor: SkayJ
export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const bio = useBiometric();
  const [user, setUser] = useState(null);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nfcEnabled, setNfcEnabled] = useState(typeof window !== "undefined" && localStorage.getItem("bnc_nfc") === "true");
  const [cardBlocked, setCardBlocked] = useState(typeof window !== "undefined" && localStorage.getItem("bnc_card_blocked") === "true");

  const [form, setForm] = useState({
    holder_name: "",
    holder_type: "natural",
    cedula_type: "V",
    cedula_number: "",
    phone: "",
    account_number: "",
    account_type: "corriente",
    currency: "VES",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const me = await localDB.auth.me();
        setUser(me);
        const accounts = await localDB.entities.BankAccount.list();
        const ownerAccounts = accounts.filter((item) => item.created_by_id === me.id || item.cedula_number === me.cedula_number || item.holder_name === me.full_name);
        const selectedAccount = ownerAccounts[0] || accounts[0] || null;

        if (selectedAccount) {
          setAccount(selectedAccount);
          setForm({
            holder_name: selectedAccount.holder_name || me.full_name || "",
            holder_type: selectedAccount.holder_type || "natural",
            cedula_type: selectedAccount.cedula_type || "V",
            cedula_number: selectedAccount.cedula_number || "",
            phone: selectedAccount.phone || "",
            account_number: selectedAccount.account_number || "",
            account_type: selectedAccount.account_type || "corriente",
            currency: selectedAccount.currency || "VES",
          });
        } else {
          setForm((prev) => ({ ...prev, holder_name: me.full_name || "" }));
          setEditing(true);
        }
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

  const handleHolderTypeChange = (type) => {
    setForm({
      ...form,
      holder_type: type,
      cedula_type: type === "juridica" ? "J" : "V",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (account) {
        await localDB.entities.BankAccount.update(account.id, {
          ...form,
          created_by_id: user?.id,
        });
        toast({ title: "Cuenta actualizada" });
      } else {
        const newAccount = await localDB.entities.BankAccount.create({
          ...form,
          created_by_id: user?.id,
          balance: 50000,
          account_number: form.account_number || "0191" + Math.random().toString().slice(2, 18),
        });
        setAccount(newAccount);
        toast({ title: "Cuenta creada exitosamente" });
      }
      setEditing(false);
    } catch (err) {
      toast({ title: "Error al guardar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localDB.auth.logout("/login");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 lg:pl-64 overflow-x-hidden">
      <DesktopSidebar />
      {/* Header */}
      <div
        className="px-5 pt-12 pb-16 rounded-b-[2rem]"
        style={{ background: "linear-gradient(135deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}
      >
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <ArrowLeft size={20} className="text-white" />
              </button>
              <BNCLogoWhite size={28} showText={false} />
            </div>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              {theme === "dark" ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-white" />}
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg"
              style={{ background: "linear-gradient(135deg, hsl(25 100% 50%), hsl(25 100% 40%))" }}
            >
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-white text-lg font-bold">{user?.full_name || "Usuario"}</h2>
              <p className="text-white/60 text-sm">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 -mt-8 space-y-4">
        {/* Datos de cuenta */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Datos de Cuenta</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-primary font-semibold">
                <Pencil size={14} /> Editar
              </button>
            ) : null}
          </div>

          {/* Tipo de persona */}
          {editing && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => handleHolderTypeChange("natural")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  form.holder_type === "natural" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <User size={20} className={form.holder_type === "natural" ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-xs font-semibold ${form.holder_type === "natural" ? "text-primary" : "text-muted-foreground"}`}>
                  Natural
                </span>
              </button>
              <button
                type="button"
                onClick={() => handleHolderTypeChange("juridica")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all ${
                  form.holder_type === "juridica" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <Building2 size={20} className={form.holder_type === "juridica" ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-xs font-semibold ${form.holder_type === "juridica" ? "text-primary" : "text-muted-foreground"}`}>
                  Juridica
                </span>
              </button>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">{form.holder_type === "juridica" ? "Razon Social" : "Nombre del Titular"}</Label>
              <Input disabled={!editing} value={form.holder_name} onChange={(e) => setForm({ ...form, holder_name: e.target.value })} className="h-11 rounded-xl" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-1">
                <Label className="text-xs text-muted-foreground">Tipo</Label>
                <Select
                  disabled={!editing || form.holder_type === "juridica"}
                  value={form.cedula_type}
                  onValueChange={(v) => setForm({ ...form, cedula_type: v })}
                >
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {form.holder_type === "juridica" ? (
                      <SelectItem value="J">J</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="V">V</SelectItem>
                        <SelectItem value="E">E</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-xs text-muted-foreground">{form.holder_type === "juridica" ? "RIF" : "Cedula"}</Label>
                <Input disabled={!editing} value={form.cedula_number} onChange={(e) => setForm({ ...form, cedula_number: e.target.value })} placeholder="12345678" className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Telefono</Label>
                <Input disabled={!editing} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0412-1234567" className="h-11 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Cuenta</Label>
                <Select disabled={!editing} value={form.account_type} onValueChange={(v) => setForm({ ...form, account_type: v })}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corriente">Corriente</SelectItem>
                    <SelectItem value="ahorro">Ahorro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editing && (
              <Button onClick={handleSave} disabled={saving} className="w-full h-12 rounded-xl gap-2 mt-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                {account ? "Guardar Cambios" : "Crear Cuenta"}
              </Button>
            )}
          </div>
        </div>

        {/* Configuracion */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <h3 className="text-sm font-semibold text-foreground px-5 pt-4 pb-2">Configuracion</h3>

          {/* Biometrica */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Fingerprint size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Huella Digital</p>
              <p className="text-xs text-muted-foreground">Confirmar pagos e iniciar sesion</p>
            </div>
            <Switch checked={bio.enabled} onCheckedChange={bio.toggle} />
          </div>

          {/* Modo oscuro */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Modo Oscuro</p>
              <p className="text-xs text-muted-foreground">Cambiar apariencia de la app</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>

          {/* NFC */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Nfc size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">NFC</p>
              <p className="text-xs text-muted-foreground">Pagos por proximidad</p>
            </div>
            <Switch checked={nfcEnabled} onCheckedChange={(v) => {
              setNfcEnabled(v);
              localStorage.setItem("bnc_nfc", String(v));
            }} />
          </div>

          {/* Bloquear tarjeta */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-border/50">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <Ban size={18} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Bloquear Tarjeta</p>
              <p className="text-xs text-muted-foreground">Bloquea tu tarjeta en caso de perdida</p>
            </div>
            <Switch checked={cardBlocked} onCheckedChange={(v) => {
              setCardBlocked(v);
              localStorage.setItem("bnc_card_blocked", String(v));
              toast({ title: v ? "Tarjeta bloqueada" : "Tarjeta desbloqueada", description: v ? "Nadie podra usar tu tarjeta" : "Tu tarjeta esta activa" });
            }} />
          </div>
        </div>

        {/* Menu */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          {[
            { icon: CreditCard, label: "Mis Tarjetas", sublabel: "Administrar tarjetas" },
            { icon: Shield, label: "Seguridad", sublabel: "Contraseña y autenticacion" },
            { icon: HelpCircle, label: "Ayuda", sublabel: "Centro de ayuda y soporte" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-3 px-5 py-4 hover:bg-muted/50 transition-colors border-b border-border/50 last:border-b-0">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                <item.icon size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.sublabel}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground/50" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full h-12 rounded-xl text-destructive border-destructive/20 hover:bg-destructive/5 hover:text-destructive gap-2"
        >
          <LogOut size={16} /> Cerrar Sesion
        </Button>
      </div>

      <BottomNav />
    </div>
  );
}