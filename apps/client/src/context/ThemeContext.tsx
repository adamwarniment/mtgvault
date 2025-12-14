import { createContext } from 'react';

export const ThemeContext = createContext<{ themeMode: 'dark' | 'light'; toggleTheme: () => void } | undefined>(undefined);
