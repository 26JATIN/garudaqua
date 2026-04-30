"use client";
import dynamicImports from "next/dynamic";

export const LazyImageGallery = dynamicImports(() => import('./ImageGallery'), { ssr: false });
export const LazyVideoShowcaseSection = dynamicImports(() => import('./HeroVideoShowcase'), { ssr: false });
