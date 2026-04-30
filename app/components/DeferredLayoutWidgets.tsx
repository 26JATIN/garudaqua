"use client";

import dynamic from "next/dynamic";

// These components render nothing visible on initial paint.
// Dynamic import with ssr:false defers their JS entirely past the LCP window,
// eliminating ~100-200ms of main-thread blocking during hydration.
const PullToRefresh = dynamic(() => import("./PullToRefresh"), { ssr: false });
const RouteChangeOverlay = dynamic(() => import("./RouteChangeOverlay"), { ssr: false });

export default function DeferredLayoutWidgets() {
  return (
    <>
      <PullToRefresh />
      <RouteChangeOverlay />
    </>
  );
}
