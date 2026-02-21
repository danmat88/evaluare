import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, FlaskConical, LayoutDashboard, User, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import XPBar from '../ui/XPBar';
import styles from './Layout.module.css';

const NAV = [
  { to: '/dashboard',  icon: <LayoutDashboard size={16} />, label: 'Acasă' },
  { to: '/exercitii',  icon: <BookOpen size={16} />,        label: 'Exerciții' },
  { to: '/teste',      icon: <FlaskConical size={16} />,    label: 'Teste' },
  { to: '/profil',     icon: <User size={16} />,            label: 'Profil' },
];

const Layout = ({ children }) => {
  const { profile, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className={styles.shell}>
      <header className={styles.nav}>
        {/* Brand */}
        <div className={styles.brand}>
          <span className={styles.brandSigma}>∑</span>
          <span className={styles.brandName}>EN<span className={styles.brandAccent}>·</span>Math</span>
        </div>

        {/* Nav links */}
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

        {/* Right: XP + name + logout */}
        <div className={styles.right}>
          <XPBar />
          <div className={styles.divider} />
          <span className={styles.username}>{profile?.name?.split(' ')[0]}</span>
          <button className={styles.logoutBtn} onClick={async () => { await logout(); navigate('/'); }} title="Deconectare">
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
    </div>
  );
};

export default Layout;
