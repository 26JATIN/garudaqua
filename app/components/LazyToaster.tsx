"use client";

import dynamic from "next/dynamic";

const ThemeToaster = dynamic(() => import("./ThemeToaster"), { ssr: false });

export default function LazyToaster() {
  return <ThemeToaster />;
}
