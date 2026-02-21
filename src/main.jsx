import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';
import App from './App';
import useAuthStore from './store/authStore';

// ✅ Initialize Firebase auth listener ONCE before render
// This prevents duplicate onAuthStateChanged subscriptions
// from spawning every time useAuth() runs inside route guards
useAuthStore.getState().init();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
