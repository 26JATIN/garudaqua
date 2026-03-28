"use client";
import { usePathname } from "next/navigation";
import NavigationLink from "@/app/components/NavigationLink";
import { useAdminAuth, AdminAuthProvider } from "../context/AdminAuthContext";
import { useState, useEffect, useRef, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ===== Admin Login Screen =====
function AdminLoginScreen() {
    const { login } = useAdminAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);
        try {
            const success = await login(email, password);
            if (!success) {
                setError("Invalid email or password");
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-[#0EA5E9] rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-xl">G</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                        <p className="text-sm text-gray-500 mt-1">Garud Aqua Solutions</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Email
                            </label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                placeholder="admin@garudaqua.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent transition"
                                placeholder="Enter password"
                            />
                        </div>

                        {error && (
                            <p className="text-red-600 text-sm text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#0EA5E9] text-white rounded-lg font-medium hover:bg-[#0369A1] transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Signing In..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

// ===== Admin Layout Inner (uses auth) =====
function AdminLayoutInner({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const { user, logout, loading } = useAdminAuth();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const wasDarkRef = useRef(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
        const html = document.documentElement;
        wasDarkRef.current = html.classList.contains("dark");
        if (wasDarkRef.current) {
            html.classList.remove("dark");
        }

        // Remove body padding-top added by main site navbar CSS
        const prevBodyPaddingTop = document.body.style.paddingTop;
        document.body.style.paddingTop = "0px";

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "class") {
                    if (html.classList.contains("dark")) {
                        html.classList.remove("dark");
                    }
                }
            });
        });
        observer.observe(html, { attributes: true });

        return () => {
            observer.disconnect();
            document.body.style.paddingTop = prevBodyPaddingTop;
            if (wasDarkRef.current) {
                html.classList.add("dark");
            }
        };
    }, []);

    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            document.body.style.height = "100vh";
            document.body.style.touchAction = "none";
        } else {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.height = "";
            document.body.style.touchAction = "";
        }
        return () => {
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.body.style.height = "";
            document.body.style.touchAction = "";
        };
    }, [isMobileSidebarOpen]);

    if (loading || !mounted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="h-12 w-12 bg-gray-200 rounded-full mx-auto animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
            </div>
        );
    }

    if (!user || !user.isAdmin) {
        return <AdminLoginScreen />;
    }

    const navItems = [
        {
            path: "/admin",
            label: "Dashboard",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
            ),
        },
        {
            path: "/admin/categories",
            label: "Categories",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
        },
        {
            path: "/admin/products",
            label: "Products",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            ),
        },
        {
            path: "/admin/enquiries",
            label: "Enquiries",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
            ),
        },
        {
            path: "/admin/blogs",
            label: "Blogs",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
        },
        {
            path: "/admin/blog-categories",
            label: "Blog Categories",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
                </svg>
            ),
        },
        {
            path: "/admin/hero-videos",
            label: "Hero Videos",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            path: "/admin/hero-slides",
            label: "Hero Slides",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            path: "/admin/gallery",
            label: "Gallery",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Admin Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
                <div className="px-4 lg:px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 lg:space-x-4">
                            <button
                                onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                aria-label="Toggle menu"
                            >
                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#0EA5E9] rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">G</span>
                                </div>
                                <div>
                                    <h1 className="text-lg lg:text-xl font-bold text-gray-900">Admin Panel</h1>
                                    <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Garud Aqua Solutions</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 lg:space-x-4">
                            <div className="hidden lg:flex items-center space-x-4 text-sm text-gray-600">
                                <span>Welcome back, {user.name}</span>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                                >
                                    <div className="w-8 h-8 bg-[#0EA5E9] rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <svg className="w-4 h-4 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {isProfileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border border-gray-100 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                            </div>
                                            <NavigationLink
                                                href="/"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileOpen(false)}
                                            >
                                                View Website
                                            </NavigationLink>
                                            <button
                                                onClick={logout}
                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Sidebar Backdrop */}
            <AnimatePresence mode="wait">
                {isMobileSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            <div className="flex pt-18">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 bg-white shadow-sm border-r border-gray-200 fixed left-0 top-18.25 bottom-0 z-30 overflow-y-auto overscroll-contain">
                    <nav className="p-4 space-y-2 pb-20">
                        {navItems.map((item) => {
                            const isActive = pathname === item.path;
                            return (
                                <NavigationLink
                                    key={item.path}
                                    href={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                        isActive
                                            ? "bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white shadow-md"
                                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                                >
                                    <span className={`transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-gray-400"}`}>
                                        {item.icon}
                                    </span>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </NavigationLink>
                            );
                        })}
                    </nav>
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-linear-to-b from-gray-50 to-gray-100 z-10">
                        <div className="text-center">
                            <p className="text-xs font-medium text-gray-600">Garud Aqua Admin</p>
                            <p className="text-xs text-gray-400 mt-0.5">v1.0.0</p>
                        </div>
                    </div>
                </aside>

                {/* Mobile Sidebar */}
                <AnimatePresence mode="wait">
                    {isMobileSidebarOpen && (
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="lg:hidden w-72 bg-white shadow-2xl fixed left-0 top-0 bottom-0 z-50 overflow-hidden flex flex-col"
                        >
                            <div className="bg-linear-to-r from-[#0EA5E9] to-[#0369A1] px-6 py-5 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                                        <span className="text-white font-bold text-lg">G</span>
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg">Admin Panel</h2>
                                        <p className="text-white/80 text-xs">Garud Aqua</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileSidebarOpen(false)}
                                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-4 py-4 border-b border-gray-100">
                                <div className="flex items-center space-x-3 p-3 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl">
                                    <div className="w-12 h-12 bg-linear-to-br from-[#0EA5E9] to-[#0369A1] rounded-full flex items-center justify-center shadow-md">
                                        <span className="text-white text-lg font-bold">
                                            {user.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>

                            <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.path;
                                    return (
                                        <NavigationLink
                                            key={item.path}
                                            href={item.path}
                                            onClick={() => setIsMobileSidebarOpen(false)}
                                            className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                                                isActive
                                                    ? "bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white shadow-lg scale-[1.02]"
                                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:scale-95"
                                            }`}
                                        >
                                            <span className={`transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-gray-400"}`}>
                                                {item.icon}
                                            </span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {isActive && (
                                                <span className="ml-auto">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                        </NavigationLink>
                                    );
                                })}
                            </nav>

                            <div className="border-t border-gray-200 bg-linear-to-b from-gray-50 to-gray-100">
                                <div className="px-4 py-3 space-y-2">
                                    <NavigationLink
                                        href="/"
                                        onClick={() => setIsMobileSidebarOpen(false)}
                                        className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                        <span>View Website</span>
                                    </NavigationLink>
                                    <button
                                        onClick={logout}
                                        className="flex items-center justify-center space-x-2 w-full px-4 py-2.5 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                                <div className="px-4 py-3 text-center border-t border-gray-200">
                                    <p className="text-xs font-medium text-gray-600">Garud Aqua Admin</p>
                                    <p className="text-xs text-gray-400 mt-0.5">v1.0.0</p>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 bg-gray-50 min-h-[calc(100vh-73px)]">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

// ===== Exported AdminLayout wraps with AuthProvider =====
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <AdminAuthProvider>
            <AdminLayoutInner>{children}</AdminLayoutInner>
        </AdminAuthProvider>
    );
}
