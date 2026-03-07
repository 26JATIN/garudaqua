"use client";
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('./Navbar'), {
    ssr: true,
    loading: () => (
        <>
            {/* Static placeholder navbar — prevents CLS while real navbar loads */}
            <nav className="fixed inset-x-0 top-0 z-100 hidden lg:block">
                <div className="backdrop-blur-xl backdrop-saturate-200 border-b border-(--navbar-border)" style={{ backgroundColor: "var(--navbar-bg)" }}>
                    <div className="max-w-7xl mx-auto px-6 py-1">
                        <div className="flex items-center justify-between h-22">
                            <div className="w-45.25 h-20" />
                            <div className="flex-1 max-w-xl mx-12" />
                            <div className="flex items-center gap-3" />
                        </div>
                    </div>
                </div>
            </nav>
            <div className="lg:hidden fixed top-0 left-0 right-0 z-100 backdrop-blur-xl backdrop-saturate-200 border-b border-(--navbar-border)" style={{ backgroundColor: "var(--navbar-bg)" }}>
                <div className="px-4 py-3 flex items-center justify-between h-15">
                    <div className="w-30 h-10" />
                    <div className="flex items-center gap-2" />
                </div>
            </div>
        </>
    ),
});

export default function ConditionalNavbar() {
    const pathname = usePathname();
    
    // Don't show the main navbar on admin pages
    if (pathname?.startsWith('/admin')) {
        return null;
    }
    
    return <Navbar />;
}