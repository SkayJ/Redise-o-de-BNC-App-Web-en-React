import React, { createContext, useState, useContext, useEffect } from 'react';
import { localDB } from '@/api/localDB';
// Importamos tus datos reales desde tu archivo hermano dbSeed.js
import { INITIAL_DB } from './dbSeed';

const AuthContext = createContext();

// ==========================================
// CONFIGURACIÓN DE CREDENCIALES FICTICIAS
// ==========================================
const MODO_PRUEBA = true; // Activa o desactiva el entorno simulado local

// Mapeamos el usuario simulado directamente desde tu dbSeed.js
const USUARIO_SIMULADO = {
  ...INITIAL_DB.User,
  user_metadata: {
    full_name: INITIAL_DB.User.full_name
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    if (MODO_PRUEBA) {
      // Guardamos las cuentas de dbSeed en el LocalStorage de forma automática para consultar-saldo
      localStorage.setItem("bnc_cached_accounts", JSON.stringify(INITIAL_DB.BankAccount));
      localStorage.setItem("bnc_cached_user", JSON.stringify({ full_name: INITIAL_DB.User.full_name }));

      setUser(USUARIO_SIMULADO);
      setIsAuthenticated(true);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAuthChecked(true);
      setAppPublicSettings({ id: "mock-app", public_settings: {} });
      return;
    }

    try {
      setIsLoadingPublicSettings(true);
      setAuthError(null);
      setAppPublicSettings({ id: 'local-app', public_settings: {} });
      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    } catch (error) {
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    if (MODO_PRUEBA) {
      setUser(USUARIO_SIMULADO);
      setIsAuthenticated(true);
      setAuthChecked(true);
      setIsLoadingAuth(false);
      return;
    }

    try {
      setIsLoadingAuth(true);
      const currentUser = await localDB.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }
  };

  // Función login simulada para el formulario de Login.jsx
  const login = async (credentials) => {
    if (MODO_PRUEBA) {
      setUser(USUARIO_SIMULADO);
      setIsAuthenticated(true);
      return { user: USUARIO_SIMULADO, success: true };
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    
    if (MODO_PRUEBA) {
      return;
    }

    if (shouldRedirect) {
      localDB.auth.logout(window.location.href);
    } else {
      localDB.auth.logout();
    }
  };

  const navigateToLogin = () => {
    if (MODO_PRUEBA) {
      return;
    }
    localDB.auth.redirectToLogin(window.location.href);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      login, 
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};