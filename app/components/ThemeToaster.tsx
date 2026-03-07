"use client";
import { Toaster } from "sonner";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToaster() {
    const { isDark, mounted } = useTheme();

    return <Toaster position="top-right" richColors theme={mounted ? (isDark ? 'dark' : 'light') : 'light'} />;
}
