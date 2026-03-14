"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface ThemeContextType {
    theme: string;
    toggleTheme: () => void;
    isDark: boolean;
    mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    const applyTheme = useCallback((newTheme: string, animate = false) => {
        const root = document.documentElement;

        if (animate) {
            // Add transition class to enable smooth theme switch
            root.classList.add('theme-transitioning');
        }

        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Update theme-color meta to match navbar bg
        const meta = document.getElementById('theme-color-meta');
        if (meta) {
            (meta as HTMLMetaElement).content = newTheme === 'dark' ? '#000000' : '#ffffff';
        }

        if (animate) {
            // Remove transition class after animation completes
            setTimeout(() => {
                root.classList.remove('theme-transitioning');
            }, 350);
        }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        // Read from localStorage — default to light if no preference stored
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') {
            setTheme('dark');
            applyTheme('dark');
        } else {
            setTheme('light');
            applyTheme('light');
        }
    }, [applyTheme]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme, true);
    };

    const isDark = theme === 'dark';

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}
