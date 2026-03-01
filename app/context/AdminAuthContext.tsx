"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";

interface AdminUser {
  name: string;
  email: string;
  isAdmin: boolean;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [loginLoading, setLoginLoading] = useState(false);

  const user: AdminUser | null = session?.user
    ? {
        name: session.user.name || "Admin",
        email: session.user.email || "",
        isAdmin: true,
      }
    : null;

  const loading = status === "loading" || loginLoading;

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      setLoginLoading(true);
      try {
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        return !result?.error;
      } catch {
        return false;
      } finally {
        setLoginLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    signOut({ redirect: false });
  }, []);

  return (
    <AdminAuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
