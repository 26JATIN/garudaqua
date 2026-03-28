"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface GalleryItem {
  image: string;
  text: string;
}

interface Props {
  items: GalleryItem[];
  textColor?: string;
  borderRadius?: number;
}

export default function ScrollGallery({
  items,
  textColor = "#0EA5E9",
  borderRadius = 0.05,
}: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    startX.current = e.pageX - (trackRef.current?.offsetLeft ?? 0);
    scrollLeft.current = trackRef.current?.scrollLeft ?? 0;
    trackRef.current?.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging || !trackRef.current) return;
      e.preventDefault();
      const x = e.pageX - trackRef.current.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      trackRef.current.scrollLeft = scrollLeft.current - walk;
    },
    [isDragging]
  );

  const onPointerUp = useCallback(() => setIsDragging(false), []);

  // Auto-scroll effect
  useEffect(() => {
    const track = trackRef.current;
    if (!track || isDragging) return;

    let animId: number;
    let speed = 0.5;

    const step = () => {
      track.scrollLeft += speed;
      // Loop: when reaching end, jump back to start seamlessly
      if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
        track.scrollLeft = 0;
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isDragging]);

  // Build enough items to fill the scrollable area for seamless looping.
  // We need at least ~12 visible cards so the loop reset isn't obvious.
  const MIN_CARDS = 12;
  let displayItems = items;
  if (items.length > 0 && items.length < MIN_CARDS) {
    const repeats = Math.ceil(MIN_CARDS / items.length);
    displayItems = Array.from({ length: repeats }, () => items).flat();
  }

  return (
    <div
      ref={trackRef}
      className="flex gap-6 overflow-x-auto h-full items-center px-4 scrollbar-hide select-none"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        scrollBehavior: isDragging ? "auto" : "smooth",
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {displayItems.map((item, i) => (
        <div
          key={`${item.text}-${i}`}
          className="shrink-0 relative group"
          style={{
            width: "clamp(260px, 30vw, 400px)",
            height: "clamp(320px, 40vw, 500px)",
            borderRadius: `${borderRadius * 100}%`,
          }}
        >
          <div className="relative w-full h-full overflow-hidden rounded-2xl shadow-xl">
            <Image
              src={item.image}
              alt={item.text}
              fill
              sizes="(max-width: 640px) 260px, (max-width: 1024px) 30vw, 400px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              draggable={false}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
            {/* Text label */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <p
                className="text-lg md:text-xl font-semibold drop-shadow-lg"
                style={{ color: textColor }}
              >
                {item.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
