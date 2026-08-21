import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Zap, Wifi, Phone, Tv, Droplets, GraduationCap, Car, ShieldCheck, Smartphone, DollarSign } from "lucide-react";
import BottomNav from "@/components/banking/BottomNav";
import DesktopSidebar from "@/components/banking/DesktopSidebar";

// Pagina de servicios BNC (incluye recargas)
// Autor: SkayJ
const services = [
  { name: "Electricidad", description: "CORPOELEC", icon: Zap, color: "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400" },
  { name: "Internet", description: "CANTV, Inter, Netuno", icon: Wifi, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
  { name: "Telefonia", description: "Movistar, Digitel, Movilnet", icon: Phone, color: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400" },
  { name: "TV por cable", description: "SimpleTV, DirecTV", icon: Tv, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400" },
  { name: "Agua", description: "Hidrocapital, Hidroven", icon: Droplets, color: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950/50 dark:text-cyan-400" },
  { name: "Recargas", description: "Movilnet, Movistar, Digitel", icon: Smartphone, color: "bg-orange-50 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400" },
  { name: "Educacion", description: "Universidades, colegios", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400" },
  { name: "Vehiculos", description: "SAIME, INTT, multas", icon: Car, color: "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400" },
  { name: "Seguros", description: "Mercantil, Mapfre, Qualitas", icon: ShieldCheck, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-8 lg:pl-64 overflow-x-hidden">
      <DesktopSidebar />
      <div className="bg-card border-b border-border px-5 pt-12 pb-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground">Servicios</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-6">
        {/* Comprar Dolares - destacado */}
        <button
          onClick={() => navigate("/comprar-dolares")}
          className="w-full mb-6 rounded-2xl p-5 text-left flex items-center gap-4 transition-all hover:shadow-lg"
          style={{ background: "linear-gradient(135deg, hsl(127 73% 33%), hsl(127 73% 25%))" }}
        >
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
            <DollarSign size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-base">Comprar Dolares</p>
            <p className="text-white/70 text-xs mt-0.5">Tasa BCV disponible</p>
          </div>
          <ArrowLeft size={20} className="text-white/60 rotate-180" />
        </button>

        <p className="text-sm text-muted-foreground mb-4">Selecciona el servicio que deseas pagar</p>
        <div className="grid grid-cols-2 gap-3">
          {services.map((service) => (
            <button
              key={service.name}
              className="bg-card rounded-2xl border border-border p-5 text-left hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
            >
              <div className={`w-11 h-11 rounded-xl ${service.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <service.icon size={20} />
              </div>
              <p className="text-sm font-semibold text-foreground">{service.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{service.description}</p>
            </button>
          ))}
        </div>

        <div className="mt-8 bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <p className="text-sm font-semibold text-primary mb-1">Proximamente</p>
          <p className="text-xs text-muted-foreground">
            El pago de servicios estara disponible en la proxima actualizacion. Podras pagar tus servicios directamente desde la app.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}