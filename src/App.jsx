import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import ScrollToTop from './components/ScrollToTop';
import ConfettiLayout from './pages/confetti/components/ConfettiLayout';
import ConfettiHome from './pages/confetti/ConfettiHome';
import ConfettiCatalogo from './pages/confetti/ConfettiCatalogo';
import ConfettiFormularioPastel from './pages/confetti/ConfettiFormularioPastel';
import ConfettiFormularioProductos from './pages/confetti/ConfettiFormularioProductos';
import ConfettiGracias from './pages/confetti/ConfettiGracias';

// Web pública: SIN login. El puente Base44 (auth/api_key) desapareció — la web
// habla con Supabase vía anon key + RLS. Solo rutas públicas bajo ConfettiLayout.
function App() {
  return (
    <QueryClientProvider client={queryClientInstance}>
      <Router>
        <ScrollToTop />
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
        <Toaster />
      </Router>
    </QueryClientProvider>
  )
}

export default App
