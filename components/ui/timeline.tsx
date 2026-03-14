"use client";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

interface TimelineProps {
  data: TimelineEntry[];
  heading?: string;
  subheading?: string;
}

export const Timeline = ({ data, heading, subheading }: TimelineProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [beamLeft, setBeamLeft] = useState(0);
  const [scrollYProgress, setScrollYProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      if (ref.current) setHeight(ref.current.getBoundingClientRect().height);
      if (dotRef.current && ref.current) {
        // offsetLeft of the dot relative to the ref (relative) container
        const dotRect = dotRef.current.getBoundingClientRect();
        const refRect = ref.current.getBoundingClientRect();
        // center of the dot
        setBeamLeft(dotRect.left - refRect.left + dotRect.width / 2);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Calculate how far the container is scrolled relative to viewport
      const start = rect.top - windowHeight;
      const distance = rect.height + windowHeight;

      if (start < 0) {
        let progress = Math.abs(start) / distance;
        // Apply easing curve similar to framer-motion defaults
        progress = Math.min(Math.max(progress, 0), 1);
        setScrollYProgress(progress);
      } else {
        setScrollYProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Map progress to height (0 to height)
  const heightTransform = scrollYProgress * height;
  // Map progress to opacity (0 to 1 with quick fade-in at 10%)
  const opacityTransform = scrollYProgress <= 0 ? 0 : Math.min(scrollYProgress * 10, 1);

  return (
    <div
      className="w-full bg-white dark:bg-neutral-950 font-sans"
      ref={containerRef}
    >
      <div className="max-w-7xl mx-auto py-20 px-4 md:px-8 lg:px-10">
        <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-black dark:text-white max-w-4xl">
          {heading ?? "Changelog from my journey"}
        </h2>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base max-w-lg mt-3">
          {subheading ?? "I've been working on Aceternity for the past 2 years. Here's a timeline of my journey."}
        </p>
      </div>

      <div ref={ref} className="relative max-w-7xl mx-auto pb-20 px-4 md:px-8 lg:px-10">
        {data.map((item, index) => (
          <div
            key={index}
            className="flex justify-start pt-10 md:pt-40 md:gap-10"
          >
            {/* Left — dot + sticky title (desktop only) */}
            <div className="sticky flex flex-col md:flex-row z-40 items-center top-40 self-start max-w-xs lg:max-w-sm md:w-full">
              {/* Attach dotRef only to the first dot — all dots share the same x */}
              <div
                ref={index === 0 ? dotRef : undefined}
                className="h-10 absolute left-0 w-10 rounded-full bg-white dark:bg-black flex items-center justify-center"
              >
                <div className="h-4 w-4 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 p-2" />
              </div>
              <h3 className="hidden md:block text-xl md:pl-20 md:text-5xl font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
            </div>

            {/* Right — content */}
            <div className="relative pl-16 pr-4 md:pl-4 w-full">
              <h3 className="md:hidden block text-2xl mb-4 text-left font-bold text-neutral-500 dark:text-neutral-500">
                {item.title}
              </h3>
              {item.content}
            </div>
          </div>
        ))}

        {/* Beam — dynamically centred on the dot using measured beamLeft */}
        <div
          style={{ height: height + "px", left: `${beamLeft}px` }}
          className="absolute top-0 w-0.5 overflow-hidden bg-[linear-gradient(to_bottom,transparent_0%,rgb(212,212,212)_10%,rgb(212,212,212)_90%,transparent_100%)] dark:bg-[linear-gradient(to_bottom,transparent_0%,rgb(64,64,64)_10%,rgb(64,64,64)_90%,transparent_100%)] -translate-x-1/2"
        >
          <div
            style={{ height: `${heightTransform}px`, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-0.5 bg-linear-to-t from-purple-500 via-blue-500 to-transparent from-0% via-10% rounded-full transition-[height,opacity] duration-100 ease-out"
          />
        </div>
      </div>
    </div>
  );
};
