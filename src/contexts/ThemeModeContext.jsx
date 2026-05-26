import { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider } from 'styled-components';
import { darkTheme, lightTheme } from '../styles/theme.js';

const ThemeModeContext = createContext(null);

export function ThemeModeProvider({ children }) {
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('proclamai_theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    localStorage.setItem('proclamai_theme', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentTheme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeModeContext.Provider value={{ themeMode, toggleTheme, setThemeMode }}>
      <ThemeProvider theme={currentTheme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
}
