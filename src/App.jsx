import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { useAuth } from './contexts';

import Home      from './pages/Home';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import TestPage  from './pages/TestSimulator';
import Profile   from './pages/Profile';

const Loading = () => (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '2.5rem', color: 'var(--neon-cyan)', textShadow: '0 0 20px rgba(0,229,255,0.5)' }}>
      ∑
    </span>
  </div>
);

/* Redirect logged-in users away from landing */
const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/* Redirect unauthenticated users back to landing */
const Private = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/" replace />;
};

const App = () => (
  <BrowserRouter>
    <ToastProvider />
    <Routes>
      <Route path="/"          element={<Public><Home /></Public>} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/exercitii" element={<Private><Exercises /></Private>} />
      <Route path="/teste"     element={<Private><TestPage /></Private>} />
      <Route path="/profil"    element={<Private><Profile /></Private>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
