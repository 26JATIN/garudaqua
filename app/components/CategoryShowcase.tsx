"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Droplets } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Type definitions
interface Category {
  id: string;
  name: string;
  isActive: boolean;
  image: string;
  description?: string;
}

interface Subcategory {
  id: string;
  name: string;
  isActive: boolean;
  image: string;
  category: { id: string; name: string };
}

interface CategoryPreviewProps {
  category: { name: string; image?: string };
  className?: string;
}

interface SubcategoryBadgeProps {
  subcategory: { name: string; image?: string };
  onClick: (e: React.MouseEvent) => void;
  index: number;
}

interface CardProps {
  card: {
    id?: string;
    name: string;
    image?: string;
    description?: string;
  };
  index: number;
  layout?: boolean;
  onClick?: (card: CardProps["card"]) => void;
  subcategories?: { id?: string; name: string; image?: string }[];
  onSubcategoryClick?: (card: CardProps["card"], subcategory: NonNullable<CardProps["subcategories"]>[number]) => void;
}


// Category Preview Component
const CategoryPreview = React.memo(({ category, className }: CategoryPreviewProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setHasError(false);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoaded(false);
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className || ''}`}>
      {category.image ? (
        <>
          <Image
            src={category.image}
            alt={category.name}
            fill={true}
            className={`object-cover object-top transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'
              } ${hasError ? 'hidden' : 'block'}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={70}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
        </>
      ) : null}

      {/* Loading state */}
      {(!isLoaded && !hasError) && category.image && (
        <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 dark:from-[#111] dark:to-black shimmer" />
      )}

      {/* Fallback when no image */}
      {(!category.image || hasError) && (
        <div className="absolute inset-0 bg-linear-to-br from-[#FAFAFA] to-[#F5F5F5] dark:from-[#0A0A0A] dark:to-black flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400 p-4">
            <Droplets className="w-12 h-12 mx-auto mb-2 opacity-40 text-[#0EA5E9]" />
            <div className="text-sm font-medium mb-1">{category.name}</div>
          </div>
        </div>
      )}

      {/* Click overlay for cards */}
      <div className="absolute inset-0 bg-transparent cursor-pointer z-10" />
    </div>
  );
});

CategoryPreview.displayName = 'CategoryPreview';

// Subcategory Badge Component
const SubcategoryBadge = React.memo(({ subcategory, onClick, index }: SubcategoryBadgeProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="cursor-pointer group/sub"
    >
      {/* Subcategory Badge */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-linear-to-br from-gray-100 to-gray-200 dark:from-[#0A0A0A] dark:to-black border border-gray-200 dark:border-white/10 group-hover/sub:border-[#0EA5E9] transition-all duration-300">
        {subcategory.image ? (
          <>
            <Image
              src={subcategory.image}
              alt={subcategory.name}
              fill={true}
              className={`object-cover transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              sizes="80px"
              quality={60}
            />
            {!isLoaded && (
              <div className="absolute inset-0 bg-linear-to-br from-gray-100 to-gray-200 dark:from-[#111] dark:to-black shimmer" />
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Droplets className="w-8 h-8 text-[#0EA5E9] opacity-30" />
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Subcategory Name */}
        <div className="absolute inset-x-0 bottom-0 p-2">
          <p className="text-white text-xs font-medium text-center line-clamp-2 drop-shadow-lg">
            {subcategory.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
});

SubcategoryBadge.displayName = 'SubcategoryBadge';

// Main Category Card Component
export const Card = React.memo(({
  card,
  index,
  layout = false,
  onClick,
  subcategories = [],
  onSubcategoryClick
}: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Memoize the card preview to prevent unnecessary re-renders
  const cardPreview = useMemo(() => (
    <div
      className={`rounded-xl sm:rounded-2xl transition-all duration-700 ease-out hover:scale-105 p-0.5 sm:p-1 md:p-2 aspect-4/3 overflow-hidden relative group`}
      style={{
        borderRadius: '24px 24px 4px 24px'
      }}
    >
      <div className="bg-white dark:bg-[#0A0A0A] h-full shadow-lg relative overflow-hidden" style={{ borderRadius: '16px 16px 2px 16px' }}>
        <CategoryPreview
          category={card}
          className="w-full h-full"
        />
      </div>
    </div>
  ), [card]);

  const handleOpen = () => {
    if (onClick) onClick(card);
  };

  const handleSubcategoryClick = (e: React.MouseEvent, subcategory: NonNullable<CardProps["subcategories"]>[number]) => {
    e.stopPropagation();
    if (onSubcategoryClick) {
      onSubcategoryClick(card, subcategory);
    }
  };

  return (
    <motion.div
      layoutId={layout ? `card-${card.id || card.name}` : undefined}
      whileTap={{ scale: 0.98 }}
      onClick={handleOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative cursor-pointer rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-gray-200 dark:border-white/6 bg-white/50 dark:bg-[#0A0A0A] shadow-sm transition-shadow duration-300",
        isHovered && "shadow-lg"
      )}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}>

      {/* Hover spotlight background */}
      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-slate-800/70 block rounded-2xl sm:rounded-3xl"
            layoutId={`hoverBg-${card.id || card.name}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.15, delay: 0.1 } }}
          />
        )}
      </AnimatePresence>

      {/* Card content — above the spotlight */}
      <div className="relative z-10">
        {cardPreview}
        <div className="space-y-2 sm:space-y-3 md:space-y-4 mt-2 sm:mt-3 md:mt-4">
          <div className="flex flex-col gap-1 sm:gap-2">
            <div className="flex justify-between items-start gap-2">
              <motion.h3
                layoutId={layout ? `title-${card.id || card.name}` : undefined}
                className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight flex-1"
              >
                {card.name}
              </motion.h3>
            </div>
            {card.description && (
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {card.description}
              </p>
            )}
          </div>

          {/* Subcategories */}
          {subcategories && subcategories.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {subcategories.length} {subcategories.length === 1 ? 'Type' : 'Types'}
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {subcategories.slice(0, 4).map((sub, idx) => (
                  <SubcategoryBadge
                    key={sub.id || idx}
                    subcategory={sub}
                    index={idx}
                    onClick={(e) => handleSubcategoryClick(e, sub)}
                  />
                ))}
              </div>
              {subcategories.length > 4 && onClick && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick(card);
                  }}
                  className="text-xs text-[#0EA5E9] hover:text-[#0284C7] transition-colors font-medium"
                >
                  +{subcategories.length - 4} more types →
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
});

Card.displayName = 'Card';

interface CategoryShowcaseProps {
  initialCategories?: Category[];
  initialSubcategories?: Subcategory[];
}

export default function CategoryShowcase({ initialCategories, initialSubcategories }: CategoryShowcaseProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories || []);
  const [isLoading, setIsLoading] = useState(!initialCategories || !initialSubcategories);
  const sectionRef = useRef<HTMLElement>(null);
  const router = useRouter();

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      // API failed
    }
  }, []);

  const fetchSubcategories = useCallback(async () => {
    try {
      const res = await fetch("/api/subcategories");
      if (!res.ok) throw new Error("Failed to fetch subcategories");
      const data = await res.json();
      if (Array.isArray(data)) {
        setSubcategories(data);
      }
    } catch {
      // API failed
    }
  }, []);

  useEffect(() => {
    if (initialCategories && initialSubcategories) return;
    async function loadData() {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchSubcategories()]);
      setIsLoading(false);
    }
    loadData();
  }, [fetchCategories, fetchSubcategories, initialCategories, initialSubcategories]);

  const MAX_DISPLAYED = 16;

  // Function to scroll to the top of the section smoothly
  const scrollToSection = useCallback(() => {
    if (sectionRef.current) {
      const sectionTop = sectionRef.current.offsetTop;
      window.scrollTo({
        top: sectionTop - 80,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle category change with scroll
  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
    scrollToSection();
  }, [scrollToSection]);

  // Check if element is already in viewport on mount
  useEffect(() => {
    const checkInitialVisibility = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInViewport = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isInViewport) {
          setIsVisible(true);
        }
      }
    };

    const timer = setTimeout(checkInitialVisibility, 100);
    return () => clearTimeout(timer);
  }, []);

  // Intersection observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubcategoryClick = useCallback((subcategory: Subcategory) => {
    const categoryInfo = categories.find(cat =>
      cat.id === subcategory.category.id ||
      cat.name === subcategory.category.name
    );

    if (categoryInfo) {
      const subcategoryId = encodeURIComponent(subcategory.id);
      router.push(`/products?category=${categoryInfo.id}&subcategory=${subcategoryId}`);
    } else {
      router.push(`/products?subcategory=${encodeURIComponent(subcategory.id)}`);
    }
  }, [router, categories]);

  // Get unique categories for filter buttons
  const categoryFilters = useMemo(() => {
    const filters = ['ALL'];
    categories.forEach(cat => {
      if (cat.name && !filters.includes(cat.name)) {
        filters.push(cat.name);
      }
    });
    return filters;
  }, [categories]);

  // Filter subcategories based on selected category
  const filteredSubcategories = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return subcategories;
    }
    const category = categories.find(cat => cat.name === selectedCategory);
    if (!category) return [];

    return subcategories.filter(sub =>
      sub.isActive && (
        sub.category.id === category.id ||
        sub.category.name === category.name
      )
    );
  }, [subcategories, selectedCategory, categories]);

  // Get displayed subcategories (limited to MAX_DISPLAYED)
  const displayedSubcategories = useMemo(() => {
    return filteredSubcategories.slice(0, MAX_DISPLAYED);
  }, [filteredSubcategories]);

  const hasMore = filteredSubcategories.length > MAX_DISPLAYED;

  // Memoize rendered subcategories as cards
  const renderedSubcategories = useMemo(() => {
    return displayedSubcategories.map((subcategory, index) => (
      <motion.div
        key={`${selectedCategory}-${subcategory.id}`}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.6,
            delay: index * 0.1,
            ease: "easeOut"
          }
        }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.95,
          transition: { duration: 0.3 }
        }}
        layout
      >
        <Card
          card={subcategory}
          index={index}
          layout={true}
          onClick={() => handleSubcategoryClick(subcategory)}
          subcategories={[]}
          onSubcategoryClick={() => { }}
        />
      </motion.div>
    ));
  }, [displayedSubcategories, selectedCategory, handleSubcategoryClick]);

  return (
    <section ref={sectionRef} className="bg-white dark:bg-black py-8 sm:py-12 lg:py-16">
      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Filter Section */}
        <div className="w-full lg:w-1/5 p-4 sm:p-6 lg:p-8 xl:p-12 flex flex-col justify-start">
          <div className="lg:sticky lg:top-24">
            <div
              className={`transform transition-all duration-1500 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-[50vh] opacity-0"
                }`}
            >
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 sm:mb-6 lg:mb-8 hover:text-[#0EA5E9] transition-all duration-300 cursor-default hover:scale-105 transform">
                Explore
                <br />
                Categories
              </h2>
            </div>

            <div
              className={`transform transition-all duration-1000 ease-out delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
            >
              {/* Category Filter Buttons */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Filter by Category
                </h3>

                {/* Desktop: Vertical layout */}
                <div className="hidden lg:flex flex-col gap-2">
                  {categoryFilters.map((filter) => {
                    const count = filter === 'ALL'
                      ? subcategories.length
                      : subcategories.filter(sub => {
                        const category = categories.find(cat => cat.name === filter);
                        if (!category) return false;
                        return sub.isActive && (
                          sub.category.id === category.id ||
                          sub.category.name === category.name
                        );
                      }).length;

                    return (
                      <button
                        key={filter}
                        onClick={() => handleCategoryChange(filter)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-[1.02] flex items-center justify-between group ${selectedCategory === filter
                          ? 'bg-linear-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-lg shadow-[#0EA5E9]/20'
                          : 'text-gray-900 dark:text-gray-100 hover:text-[#0369A1] dark:hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/5 dark:hover:bg-[#0EA5E9]/10 hover:shadow-md border border-transparent hover:border-[#0EA5E9]/30'
                          }`}
                      >
                        <span className="truncate">{filter}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${selectedCategory === filter
                          ? 'bg-white/20 text-white backdrop-blur-sm'
                          : 'bg-[#0EA5E9]/10 text-[#0369A1] dark:bg-[#0EA5E9]/20 dark:text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white'
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Mobile: Horizontal scrollable layout */}
                <div className="lg:hidden overflow-x-auto">
                  <div className="flex gap-2 pb-2">
                    {categoryFilters.map((filter) => {
                      const count = filter === 'ALL'
                        ? subcategories.length
                        : subcategories.filter(sub => {
                          const category = categories.find(cat => cat.name === filter);
                          if (!category) return false;
                          return sub.isActive && (
                            sub.category.id === category.id ||
                            sub.category.name === category.name
                          );
                        }).length;

                      return (
                        <button
                          key={filter}
                          onClick={() => handleCategoryChange(filter)}
                          className={`whitespace-nowrap px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 group ${selectedCategory === filter
                            ? 'bg-linear-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-lg shadow-[#0EA5E9]/20'
                            : 'bg-white text-gray-900 dark:bg-[#0A0A0A] dark:text-gray-100 hover:text-[#0369A1] dark:hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/5 dark:hover:bg-[#0EA5E9]/10 hover:shadow-md border border-gray-200 dark:border-white/10 hover:border-[#0EA5E9]/30'
                            }`}
                        >
                          <span>{filter}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold transition-all duration-300 ${selectedCategory === filter
                            ? 'bg-white/20 text-white backdrop-blur-sm'
                            : 'bg-white text-[#0369A1] dark:bg-[#0EA5E9]/20 dark:text-[#0EA5E9] group-hover:bg-[#0EA5E9] group-hover:text-white border border-gray-200 dark:border-white/10'
                            }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* View All Products CTA */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
                <button
                  onClick={() => router.push('/products')}
                  className="w-full group flex items-center justify-between px-4 py-3 rounded-xl bg-[#0EA5E9]/8 dark:bg-[#0EA5E9]/10 border border-[#0EA5E9]/20 hover:bg-[#0EA5E9] hover:border-[#0EA5E9] transition-all duration-300"
                >
                  <span className="text-sm font-semibold text-[#0369A1] dark:text-[#0EA5E9] group-hover:text-white transition-colors duration-300">
                    View All Products
                  </span>
                  <svg className="w-4 h-4 text-[#0EA5E9] group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Categories Grid */}
        <div className="w-full lg:w-4/5">
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-8 sm:space-y-12">
            {/* Filter Status Indicator */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isVisible ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4"
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedCategory === 'ALL' ? 'All Subcategories' : selectedCategory}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredSubcategories.length <= MAX_DISPLAYED
                    ? `Showing all ${filteredSubcategories.length} subcategories`
                    : `Showing ${displayedSubcategories.length} of ${filteredSubcategories.length} subcategories`
                  }
                </p>
              </div>
              {selectedCategory !== 'ALL' && (
                <button
                  onClick={() => setSelectedCategory('ALL')}
                  className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 flex items-center gap-2"
                >
                  <span>Clear filter</span>
                  <span className="text-lg">×</span>
                </button>
              )}
            </motion.div>

            {/* Categories Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-white/50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/6">
                    <div className="aspect-4/3 rounded-xl sm:rounded-2xl skeleton-loader" />
                    <div className="mt-2 sm:mt-3 md:mt-4 space-y-2">
                      <div className="h-5 w-3/4 rounded skeleton-loader" />
                      <div className="h-4 w-1/2 rounded skeleton-loader" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSubcategories.length > 0 ? (
              <>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10"
                  >
                    {renderedSubcategories}
                  </motion.div>
                </AnimatePresence>

                {/* Show More / Explore All Button */}
                {hasMore && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex justify-center pt-8"
                  >
                    <button
                      onClick={() => {
                        if (selectedCategory !== 'ALL') {
                          const cat = categories.find(c => c.name === selectedCategory);
                          router.push(`/products?category=${cat?.id || ''}`);
                        } else {
                          router.push('/products');
                        }
                      }}
                      className="group relative px-8 py-4 bg-linear-to-r from-[#0EA5E9] to-[#0369A1] text-white rounded-full hover:shadow-xl transition-all duration-300 font-medium tracking-wide overflow-hidden"
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        Explore All {filteredSubcategories.length} Subcategories
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-linear-to-r from-[#0369A1] to-[#0EA5E9] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-gray-300 mb-4">
                  <Droplets className="w-16 h-16 mx-auto opacity-40" />
                </div>
                <h3 className="text-xl font-light text-gray-600 dark:text-gray-400 mb-2">No subcategories available</h3>
                <p className="text-gray-500 dark:text-gray-600">Check back soon for new categories</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles for Performance Optimizations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .card-hover {
          will-change: transform;
          transform: translate3d(0, 0, 0);
        }

        @media (prefers-reduced-motion: reduce) {
          .card-hover,
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        .skeleton-loader {
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
        }

        .skeleton-loader::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
          animation: skeleton-loading 1.5s infinite;
          will-change: transform;
        }

        @keyframes skeleton-loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .dark .skeleton-loader {
          background: #0A0A0A;
        }

        .dark .skeleton-loader::after {
          background: linear-gradient(90deg, transparent, #111, transparent);
        }
      ` }} />
    </section>
  );
}