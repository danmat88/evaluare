import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Sigma } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import { useAuth } from './contexts';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import TestPage from './pages/TestSimulator';
import Profile from './pages/Profile';

const Loading = () => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span
      style={{
        width: '58px',
        height: '58px',
        borderRadius: '18px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: 'var(--border-cyan)',
        background: 'color-mix(in srgb, var(--bg-surface) 80%, transparent)',
        color: 'var(--neon-cyan)',
        boxShadow: 'var(--shadow-glow-cyan)',
      }}
    >
      <Sigma size={28} />
    </span>
  </div>
);

const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const Private = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => (
  <BrowserRouter>
    <ToastProvider />
    <Routes>
      <Route path="/" element={<Public><Home /></Public>} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/exercitii" element={<Private><Exercises /></Private>} />
      <Route path="/teste" element={<Private><TestPage /></Private>} />
      <Route path="/profil" element={<Private><Profile /></Private>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
