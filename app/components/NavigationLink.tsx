"use client";
import Link from "next/link";
import React from "react";

/**
 * Drop-in replacement for Next.js <Link> that adds the
 * transition-all duration-300 active:scale-95 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 dark:hover:shadow-[#0EA5E9]/10 microinteraction class.
 *
 * The instant loading overlay is now handled globally by
 * PageTransitionProvider's document-level click interceptor,
 * so this component no longer needs to manually call navigate().
 * It simply renders a normal <Link>.
 */
export default function NavigationLink({
  href,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link href={href} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
