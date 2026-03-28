"use client";
import { createContext, useContext, useCallback, useState, useEffect, useRef, useTransition } from "react";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [, startTransition] = useTransition();
  const pendingHref = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);

  // Keep pathnameRef in sync for the global click handler
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const navigate = useCallback((href: string) => {
    const currentPath = pathnameRef.current;

    // Don't trigger for same page, external, tel, or mailto links
    if (
      href === currentPath ||
      href.startsWith("http") ||
      href.startsWith("mailto") ||
      href.startsWith("tel")
    ) {
      if (href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) {
        window.location.href = href;
      }
      return;
    }

    // Immediately show loading state
    setIsTransitioning(true);
    pendingHref.current = href;

    // Use startTransition so React can coordinate with Suspense boundaries
    startTransition(() => {
      router.push(href);
    });
  }, [router, startTransition]);

  // Global click interceptor: catch ALL <a> clicks (including server-rendered <Link>)
  // This ensures instant loading feedback even for links in server components
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Only handle left-clicks without modifier keys
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.defaultPrevented) return;

      // Walk up the DOM to find the closest <a> tag
      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== "A") {
        target = target.parentElement;
      }
      if (!target) return;

      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute("href");
      if (!href) return;

      // Skip external links, anchors, mailto, tel
      if (
        href.startsWith("http") ||
        href.startsWith("mailto") ||
        href.startsWith("tel") ||
        href.startsWith("#") ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      // Skip same-page links
      const currentPath = pathnameRef.current;
      if (href === currentPath) return;

      // This is an internal navigation — trigger loading immediately
      // Don't preventDefault — let Next.js <Link> handle navigation normally
      // We just set the loading state so the overlay appears instantly
      setIsTransitioning(true);
      pendingHref.current = href;
    };

    document.addEventListener("click", handleGlobalClick, true); // capture phase
    return () => document.removeEventListener("click", handleGlobalClick, true);
  }, []);

  // Reset transitioning state when pathname changes (route completed)
  useEffect(() => {
    setIsTransitioning(false);
    pendingHref.current = null;
  }, [pathname]);

  // Safety timeout: if route takes too long, reset the loading state
  useEffect(() => {
    if (!isTransitioning) return;
    const timeout = setTimeout(() => {
      setIsTransitioning(false);
      pendingHref.current = null;
    }, 8000);
    return () => clearTimeout(timeout);
  }, [isTransitioning]);

  return (
    <PageTransitionContext.Provider value={{ navigate, isTransitioning }}>
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
