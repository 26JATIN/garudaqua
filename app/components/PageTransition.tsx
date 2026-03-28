"use client";
import { createContext, useContext, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

interface PageTransitionContextType {
  navigate: (href: string) => void;
  isTransitioning: boolean;
}

const PageTransitionContext = createContext<PageTransitionContextType>({
  navigate: () => {},
  isTransitioning: false,
});

export function usePageTransition() {
  return useContext(PageTransitionContext);
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback((href: string) => {
    if (href === pathname || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) {
      router.push(href);
      return;
    }
    router.push(href);
  }, [pathname, router]);

  return (
    <PageTransitionContext.Provider value={{ navigate, isTransitioning: false }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function TransitionElement({
  name,
  children,
  className,
}: {
  name: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className} style={{ viewTransitionName: name }}>
      {children}
    </div>
  );
}
