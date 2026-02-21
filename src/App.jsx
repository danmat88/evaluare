import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import useAuth from './hooks/useAuth';

import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Exercises from './pages/Exercises';
import TestPage  from './pages/TestSimulator';
import Profile   from './pages/Profile';

const Loading = () => (
  <div style={{ height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
    <span style={{ fontFamily:'var(--font-mono)', fontSize:'2.5rem', color:'var(--neon-cyan)', textShadow:'0 0 20px rgba(0,229,255,0.5)' }}>∑</span>
  </div>
);

const Private = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <BrowserRouter>
    <ToastProvider />
    <Routes>
      <Route path="/"          element={<Home />} />
      <Route path="/login"     element={<Public><Login /></Public>} />
      <Route path="/register"  element={<Public><Register /></Public>} />
      <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
      <Route path="/exercitii" element={<Private><Exercises /></Private>} />
      <Route path="/teste"     element={<Private><TestPage /></Private>} />
      <Route path="/profil"    element={<Private><Profile /></Private>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
