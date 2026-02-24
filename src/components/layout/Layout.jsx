import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  MoonStar,
  Search,
  Sigma,
  Sun,
  User,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth, useTheme } from '../../contexts';
import XPBar from '../ui/XPBar';
import CommandPalette from './CommandPalette';
import styles from './Layout.module.css';

const NAV = [
  { to: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Acasa' },
  { to: '/exercitii', icon: <BookOpen size={16} />, label: 'Exercitii' },
  { to: '/teste', icon: <FlaskConical size={16} />, label: 'Teste' },
  { to: '/profil', icon: <User size={16} />, label: 'Profil' },
];

const Layout = ({ children }) => {
  const { profile, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const [paletteOpen, setPaletteOpen] = useState(false);

  const todayLabel = new Intl.DateTimeFormat('ro-RO', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(new Date());

  useEffect(() => {
    const onKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const goTo = (to) => {
    navigate(to);
    setPaletteOpen(false);
  };

  return (
    <div className={styles.shell}>
      <header className={styles.nav}>
        <div className={styles.brand}>
          <span className={styles.brandSigma}><Sigma size={15} /></span>
          <span className={styles.brandName}>EN<span className={styles.brandAccent}>.</span>Math</span>
        </div>

        <nav className={styles.links}>
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.linkActive : ''}`}
            >
              {n.icon}
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.right}>
          <span className={styles.today}>{todayLabel}</span>
          <div className={styles.xpWrap}>
            <XPBar />
          </div>
          <div className={styles.divider} />

          <button
            className={styles.cmdBtn}
            onClick={() => setPaletteOpen(true)}
            aria-label="Deschide comenzi rapide"
            title="Comenzi rapide (Ctrl/Cmd + K)"
          >
            <Search size={13} />
            <span>Comenzi</span>
            <kbd>Ctrl K</kbd>
          </button>

          <button
            className={styles.themeBtn}
            onClick={toggle}
            aria-label={isDark ? 'Activeaza tema luminoasa' : 'Activeaza tema intunecata'}
            title={isDark ? 'Tema luminoasa' : 'Tema intunecata'}
          >
            {isDark ? <Sun size={14} /> : <MoonStar size={14} />}
            <span>{isDark ? 'Light' : 'Dark'}</span>
          </button>

          <span className={styles.username}>{profile?.name?.split(' ')[0]}</span>

          <button
            className={styles.logoutBtn}
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            title="Deconectare"
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <motion.div
          className={styles.pageWrap}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {children}
        </motion.div>
      </main>

      <nav className={styles.mobileDock} aria-label="Navigare rapida">
        {NAV.map((n) => (
          <NavLink
            key={`mobile-${n.to}`}
            to={n.to}
            className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ''}`}
          >
            {n.icon}
            <span>{n.label}</span>
          </NavLink>
        ))}

        <button type="button" className={styles.mobileLink} onClick={() => setPaletteOpen(true)}>
          <Search size={16} />
          <span>Cauta</span>
        </button>

        <button type="button" className={styles.mobileLink} onClick={toggle}>
          {isDark ? <Sun size={16} /> : <MoonStar size={16} />}
          <span>Tema</span>
        </button>
      </nav>

      <CommandPalette
        isOpen={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onNavigate={goTo}
        onToggleTheme={toggle}
        isDark={isDark}
      />
    </div>
  );
};

export default Layout;
