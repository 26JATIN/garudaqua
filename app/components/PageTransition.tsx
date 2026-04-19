"use client";
import { createContext, useContext, useCallback, useState, useEffect, useRef, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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

import { Suspense } from "react";

function PageTransitionInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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

      // Defer to a microtask so that synchronous onClick handlers
      // (which may call e.preventDefault() for client-side filtering)
      // run first. If the click was prevented, don't start the loading bar.
      queueMicrotask(() => {
        if (e.defaultPrevented) return;
        setIsTransitioning(true);
        pendingHref.current = href;
      });
    };

    document.addEventListener("click", handleGlobalClick, true); // capture phase
    return () => document.removeEventListener("click", handleGlobalClick, true);
  }, []);

  // Reset transitioning state when pathname or search parameters change (route completed)
  useEffect(() => {
    setIsTransitioning(false);
    pendingHref.current = null;
  }, [pathname, searchParams]);

  // Reset on browser back/forward buttons and page visibility changes
  useEffect(() => {
    const resetTransition = () => {
      setIsTransitioning(false);
      pendingHref.current = null;
    };

    // popstate fires on back/forward — reset immediately and also
    // schedule a deferred reset in case React re-render lags behind
    const handlePopState = () => {
      resetTransition();
      // Secondary reset catches edge cases where a 301 redirect
      // causes a re-navigation before React processes the first reset
      setTimeout(resetTransition, 100);
    };

    // pagehide fires when navigating away (including hard 301 redirects)
    // so we cleanly reset state before the page is replaced
    const handlePageHide = () => resetTransition();

    // visibilitychange catches the case where the user switches tabs
    // during a long transition (e.g., redirect chain over slow network)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") resetTransition();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Safety timeout: if route takes too long, reset the loading state
  useEffect(() => {
    if (!isTransitioning) return;
    const timeout = setTimeout(() => {
      setIsTransitioning(false);
      pendingHref.current = null;
    }, 5000);
    return () => clearTimeout(timeout);
  }, [isTransitioning]);

  return (
    <PageTransitionContext.Provider value={{ navigate, isTransitioning }}>
      {children}
    </PageTransitionContext.Provider>
  );
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <PageTransitionInner>
        {children}
      </PageTransitionInner>
    </Suspense>
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
