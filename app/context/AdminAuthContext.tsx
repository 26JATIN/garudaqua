"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface AdminUser {
    name: string;
    email: string;
    isAdmin: boolean;
}

interface AdminAuthContextType {
    user: AdminUser | null;
    loading: boolean;
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
    user: null,
    loading: true,
    login: () => false,
    logout: () => {},
});

// Hardcoded admin credentials — change these as needed
const ADMIN_EMAIL = "admin@garudaqua.com";
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "garudaqua_admin_auth";

export function AdminAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AdminUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as AdminUser;
                if (parsed.isAdmin) {
                    setUser(parsed);
                }
            }
        } catch {
            localStorage.removeItem(STORAGE_KEY);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (email: string, password: string): boolean => {
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            const adminUser: AdminUser = {
                name: "Admin",
                email: ADMIN_EMAIL,
                isAdmin: true,
            };
            setUser(adminUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(adminUser));
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AdminAuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AdminAuthContext.Provider>
    );
}

export function useAdminAuth() {
    return useContext(AdminAuthContext);
}
