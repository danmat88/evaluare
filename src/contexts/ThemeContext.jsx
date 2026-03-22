import { useEffect, useState } from 'react';
import { ThemeContext } from './ThemeContextValue';

const STORAGE_KEY = 'en-theme';
const THEME_COLORS = {
  dark: '#070b13',
  light: '#edf6ff',
};

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'dark';

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // Ignore storage failures and fall back to system preference.
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.style.colorScheme = theme;

  let themeColorMeta = document.querySelector('meta[name="theme-color"]');

  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColorMeta);
  }

  themeColorMeta.setAttribute('content', THEME_COLORS[theme] ?? THEME_COLORS.dark);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage failures; the theme can still be applied for the current session.
    }
  }, [theme]);

  useEffect(() => {
    const syncTheme = (event) => {
      if (event.key && event.key !== STORAGE_KEY) return;
      setTheme(getInitialTheme());
    };

    window.addEventListener('storage', syncTheme);
    return () => window.removeEventListener('storage', syncTheme);
  }, []);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
};
