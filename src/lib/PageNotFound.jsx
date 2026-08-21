import React from 'react';
import { useLocation } from 'react-router-dom';
import { localDB } from '@/api/localDB';
import { useQuery } from '@tanstack/react-query';
import { Home, AlertCircle } from 'lucide-react';
import { BNCLogo } from '@/components/banking/SunburstLogo';

// Pagina 404 - BNC
// Autor: SkayJ
export default function PageNotFound({}) {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await localDB.auth.me();
                return { user, isAuthenticated: true };
            } catch (error) {
                return { user: null, isAuthenticated: false };
            }
        }
    });
    
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/50">
            <div className="mb-8">
                <BNCLogo size={36} />
            </div>
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-7xl font-light text-muted-foreground/40">404</h1>
                        <div className="h-0.5 w-16 bg-border mx-auto"></div>
                    </div>
                    
                    <div className="space-y-3">
                        <h2 className="text-2xl font-medium text-foreground">
                            Pagina No Encontrada
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            La pagina <span className="font-medium text-foreground">"{pageName}"</span> no se encontro en esta aplicacion.
                        </p>
                    </div>
                    
                    {isFetched && authData.isAuthenticated && authData.user?.role === 'admin' && (
                        <div className="mt-8 p-4 bg-muted rounded-xl border border-border">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[hsl(25_100%_50%)]/10 flex items-center justify-center mt-0.5">
                                    <AlertCircle className="w-3 h-3 text-[hsl(25_100%_50%)]" />
                                </div>
                                <div className="text-left space-y-1">
                                    <p className="text-sm font-medium text-foreground">Nota del administrador</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Esto puede significar que la pagina aun no ha sido implementada.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-6">
                        <button 
                            onClick={() => window.location.href = '/'} 
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-primary-foreground bg-primary rounded-xl hover:bg-primary/90 transition-colors duration-200"
                        >
                            <Home className="w-4 h-4" />
                            Ir al Inicio
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}