import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme, Theme as NavTheme } from '@react-navigation/native';

type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  mode: ThemeMode;
  isDark: boolean;
  toggle: () => void;
  navigationTheme: NavTheme;
  colors: {
    background: string;
    card: string;
    text: string;
    muted: string;
    border: string;
    primary: string;
  };
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const colorScheme: ColorSchemeName = Appearance.getColorScheme();
  const initial: ThemeMode = (colorScheme === 'dark' ? 'dark' : 'light');
  const [mode, setMode] = useState<ThemeMode>(initial);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme: next }) => {
      // Solo sincroniza si el usuario no cambió manualmente; para simplicidad, no persistimos.
      setMode((prev) => prev);
    });
    return () => sub.remove();
  }, []);

  const toggle = useCallback(() => setMode((m) => (m === 'light' ? 'dark' : 'light')), []);

  const navigationTheme: NavTheme = useMemo(() => (mode === 'dark' ? NavDarkTheme : NavLightTheme), [mode]);

  const colors = useMemo(() => {
    if (mode === 'dark') {
      return {
        background: '#0b1220',
        card: '#111827',
        text: '#f9fafb',
        muted: '#9ca3af',
        border: '#1f2937',
        primary: '#22c55e',
      };
    }
    return {
      background: '#ffffff',
      card: '#ffffff',
      text: '#111827',
      muted: '#6b7280',
      border: '#e5e7eb',
      primary: '#0ea5e9',
    };
  }, [mode]);

  const value = useMemo(() => ({ mode, isDark: mode === 'dark', toggle, navigationTheme, colors }), [mode, toggle, navigationTheme, colors]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}


