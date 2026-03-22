import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Sigma } from 'lucide-react';
import { ToastProvider } from './components/ui/Toast';
import { useAuth } from './contexts';

const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Exercises = lazy(() => import('./pages/Exercises'));
const TestPage = lazy(() => import('./pages/TestSimulator'));
const Profile = lazy(() => import('./pages/Profile'));

const srOnly = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
};

const Loading = ({ label = 'Se incarca pagina...' }) => (
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
      aria-hidden="true"
    >
      <Sigma size={28} />
    </span>
    <span style={srOnly}>{label}</span>
  </div>
);

const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  const redirectTo = location.state?.redirectTo || '/dashboard';
  return isAuthenticated ? <Navigate to={redirectTo} replace /> : <Suspense fallback={<Loading />}>{children}</Suspense>;
};

const Private = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  const redirectTo = `${location.pathname}${location.search}${location.hash}`;
  return isAuthenticated
    ? <Suspense fallback={<Loading />}>{children}</Suspense>
    : <Navigate to="/login" replace state={{ redirectTo }} />;
};

const App = () => (
  <BrowserRouter>
    <ToastProvider />
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Public><Home /></Public>} />
      <Route path="/register" element={<Public><Home /></Public>} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/exercitii" element={<Private><Exercises /></Private>} />
      <Route path="/teste" element={<Private><TestPage /></Private>} />
      <Route path="/profil" element={<Private><Profile /></Private>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
