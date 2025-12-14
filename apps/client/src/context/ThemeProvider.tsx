import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api';

type ThemeMode = 'dark' | 'light';

interface ThemeContextType {
    themeMode: ThemeMode;
    toggleTheme: () => void;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
    initialTheme?: ThemeMode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, initialTheme = 'dark' }) => {
    const [themeMode, setThemeModeState] = useState<ThemeMode>(initialTheme);
    const [isInitialized, setIsInitialized] = useState(false);

    // Fetch user's theme preference on mount
    useEffect(() => {
        const fetchUserTheme = async () => {
            try {
                const response = await api.get('/user/profile');
                const userTheme = response.data.themeMode as ThemeMode;
                setThemeModeState(userTheme);
                document.documentElement.setAttribute('data-theme', userTheme);
            } catch (error) {
                // If user is not authenticated or error occurs, use default theme
                console.log('Could not fetch user theme, using default');
                document.documentElement.setAttribute('data-theme', themeMode);
            } finally {
                setIsInitialized(true);
            }
        };

        fetchUserTheme();
    }, []);

    // Update theme in database
    const setThemeMode = async (mode: ThemeMode) => {
        try {
            await api.patch('/user/theme', { themeMode: mode });
            setThemeModeState(mode);
            document.documentElement.setAttribute('data-theme', mode);
        } catch (error) {
            console.error('Failed to update theme:', error);
        }
    };

    const toggleTheme = () => {
        const newTheme = themeMode === 'dark' ? 'light' : 'dark';
        setThemeMode(newTheme);
    };

    // Don't render children until theme is initialized to prevent flash
    if (!isInitialized) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ themeMode, toggleTheme, setThemeMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
