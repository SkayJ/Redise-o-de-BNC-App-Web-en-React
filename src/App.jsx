import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ThemeProvider } from '@/lib/ThemeContext';

import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Home from '@/pages/Home';
import Transfer from '@/pages/Transfer';
import PagoMovil from '@/pages/PagoMovil';
import Transactions from '@/pages/Transactions';
import Services from '@/pages/Services';
import Cuentas from '@/pages/Cuentas';
import ComprarDolares from '@/pages/ComprarDolares';
import Profile from '@/pages/Profile';
import ConsultarSaldo from '@/pages/ConsultarSaldo';
import PagoExpress from '@/pages/PagoExpress';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(223 82% 15%), hsl(228 55% 23%))" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/consultar-saldo" element={<ConsultarSaldo />} />
      <Route path="/pago-express" element={<PagoExpress />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/" element={<Home />} />
        <Route path="/transferir" element={<Transfer />} />
        <Route path="/pago-movil" element={<PagoMovil />} />
        <Route path="/movimientos" element={<Transactions />} />
        <Route path="/servicios" element={<Services />} />
        <Route path="/cuentas" element={<Cuentas />} />
        <Route path="/comprar-dolares" element={<ComprarDolares />} />
        <Route path="/perfil" element={<Profile />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App