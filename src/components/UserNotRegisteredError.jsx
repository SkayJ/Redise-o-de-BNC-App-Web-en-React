import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { BNCLogo } from '@/components/banking/SunburstLogo';

// Pantalla de acceso restringido BNC
// Autor: SkayJ
const UserNotRegisteredError = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-muted/50 px-5">
      <div className="mb-8">
        <BNCLogo size={36} />
      </div>
      <div className="max-w-md w-full p-8 bg-card rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-destructive/10">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-4">Acceso Restringido</h1>
          <p className="text-muted-foreground mb-6 text-sm">
            No estas registrado para usar esta aplicacion. Contacta al administrador de la app para solicitar acceso.
          </p>
          <div className="p-4 bg-muted rounded-xl text-sm text-muted-foreground text-left">
            <p className="font-medium text-foreground mb-2">Si crees que es un error:</p>
            <ul className="list-disc list-inside space-y-1.5">
              <li>Verifica que iniciaste sesion con la cuenta correcta</li>
              <li>Contacta al administrador de la app</li>
              <li>Intenta cerrar y volver a iniciar sesion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;