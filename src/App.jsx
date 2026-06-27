import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ConfettiLayout from './pages/confetti/components/ConfettiLayout';
import ConfettiHome from './pages/confetti/ConfettiHome';
import ConfettiCatalogo from './pages/confetti/ConfettiCatalogo';
import ConfettiFormularioPastel from './pages/confetti/ConfettiFormularioPastel';
import ConfettiFormularioProductos from './pages/confetti/ConfettiFormularioProductos';
import ConfettiGracias from './pages/confetti/ConfettiGracias';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/confetti" replace />} />
      <Route element={<ConfettiLayout />}>
        <Route path="/confetti" element={<ConfettiHome />} />
        <Route path="/confetti/catalogo" element={<ConfettiCatalogo />} />
        <Route path="/confetti/pedir" element={<ConfettiFormularioPastel />} />
        <Route path="/confetti/productos" element={<ConfettiFormularioProductos />} />
        <Route path="/confetti/gracias" element={<ConfettiGracias />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App