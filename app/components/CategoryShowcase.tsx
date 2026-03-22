"use client";

import "@/app/styles/animations.css";
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Droplets, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useRouter } from "next/navigation";

/** Mirrors the server-side slugify so we never fall back to an ObjectId */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
function productPath(product: { slug?: string; name: string }): string {
  return product.slug || slugify(product.name);
}

// Type definitions
interface Category {
  id: string;
  name: string;
  isActive: boolean;
  image: string;
  description?: string;
  slug?: string;
  hasSeoPage?: boolean;
}

interface Product {
  id: string;
  name: string;
  slug?: string;
  isActive: boolean;
  image: string;
  description?: string;
  category: { id: string; name: string };
}

interface CategoryPreviewProps {
  category: { name: string; image?: string };
  className?: string;
  priority?: boolean;
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
const CategoryPreview = React.memo(({ category, className, priority = false }: CategoryPreviewProps) => {
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
            priority={priority}
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? undefined : "lazy"}
            decoding={priority ? "sync" : "async"}
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
    <div
      onClick={onClick}
      className={`cursor-pointer group/sub transition-all duration-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} hover:scale-105 hover:-translate-y-1 active:scale-95`}
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
              decoding="async"
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
    </div>
  );
});

SubcategoryBadge.displayName = 'SubcategoryBadge';

// Main Category Card Component
export const Card = React.memo(({
  card,
  index,
  onClick,
  subcategories = [],
  onSubcategoryClick
}: CardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  // Memoize the card preview to prevent unnecessary re-renders
  const cardPreview = useMemo(() => (
    <div
      className="bg-white dark:bg-[#0A0A0A] shadow-lg relative overflow-hidden transition-all duration-700 ease-out group-hover:scale-[1.03] aspect-square rounded-[16px_16px_2px_16px] sm:rounded-[24px_24px_4px_24px]"
    >
        <CategoryPreview
          category={card}
          className="w-full h-full"
          priority={false}
        />
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
    <div
      onClick={handleOpen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative flex flex-col h-full cursor-pointer rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-gray-200 dark:border-white/6 bg-white/50 dark:bg-[#0A0A0A] shadow-sm transition-all duration-300 md:active:scale-95 group",
        isHovered && "shadow-lg"
      )}
    >
      {/* Hover spotlight background */}
      <div 
        className={cn(
          "absolute inset-0 h-full w-full bg-neutral-100 dark:bg-slate-800/70 block rounded-2xl sm:rounded-3xl transition-opacity duration-150",
          isHovered ? "opacity-100" : "opacity-0"
        )}
      />

      {/* Card content — above the spotlight */}
      <div className="relative z-10 flex flex-col flex-1 h-full">
        {cardPreview}
        <div className="space-y-2 sm:space-y-3 md:space-y-4 mt-2 sm:mt-3 md:mt-4 flex-1 flex flex-col">
          <div className="flex flex-col gap-1 sm:gap-2 flex-1">
            <div className="flex justify-between items-start gap-2">
              <h3
                className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 leading-tight flex-1 truncate"
                title={card.name}
              >
                {card.name}
              </h3>
            </div>
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
    </div>
  );
});

Card.displayName = 'Card';

interface CategoryShowcaseProps {
  initialCategories?: Category[];
  initialProducts?: Product[];
}

export default function CategoryShowcase({ initialCategories, initialProducts }: CategoryShowcaseProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [categories, setCategories] = useState<Category[]>(initialCategories || []);
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isLoading, setIsLoading] = useState(!initialCategories || !initialProducts);
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const mobileFilterRef = useRef<HTMLDivElement>(null);
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

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products?limit=100");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      if (data && Array.isArray(data.products)) {
        setProducts(data.products);
      } else if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch {
      // API failed
    }
  }, []);

  useEffect(() => {
    if (initialCategories && initialProducts) return;
    async function loadData() {
      setIsLoading(true);
      await Promise.all([fetchCategories(), fetchProducts()]);
      setIsLoading(false);
    }
    loadData();
  }, [fetchCategories, fetchProducts, initialCategories, initialProducts]);

  const MAX_DISPLAYED = 50;

  // Function to scroll to the top of the section smoothly
  const scrollToSection = useCallback(() => {
    const isMobile = window.innerWidth < 1024;

    if (isMobile && contentRef.current && mobileFilterRef.current) {
      // On mobile: scroll so the content (filter status + grid) sits right below the sticky filter bar
      const contentRect = contentRef.current.getBoundingClientRect();
      const navbarHeight = 60;
      const filterBarHeight = mobileFilterRef.current.offsetHeight;
      const scrollTarget = window.scrollY + contentRect.top - navbarHeight - filterBarHeight;

      window.scrollTo({
        top: scrollTarget,
        behavior: 'smooth'
      });
    } else if (sectionRef.current) {
      // On desktop: scroll to top of the section, below navbar
      const rect = sectionRef.current.getBoundingClientRect();
      const navbarHeight = 72;
      const scrollTarget = window.scrollY + rect.top - navbarHeight;

      window.scrollTo({
        top: scrollTarget,
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

  const handleProductClick = useCallback((product: Product) => {
    router.push(`/products/${productPath(product)}`);
  }, [router]);

  const getCategoryInfoLink = useCallback(() => {
    if (selectedCategory === 'ALL') return '/categories';
    const cat = categories.find(c => c.name === selectedCategory);
    if (!cat) return '/categories';
    return `/categories/${cat.slug || slugify(cat.name)}`;
  }, [selectedCategory, categories]);

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

  // Filter products based on selected category
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'ALL') {
      return products;
    }
    const category = categories.find(cat => cat.name === selectedCategory);
    if (!category) return [];

    return products.filter(prod =>
      prod.isActive && (
        prod.category.id === category.id ||
        prod.category.name === category.name
      )
    );
  }, [products, selectedCategory, categories]);

  // Get displayed products (limited to MAX_DISPLAYED)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, MAX_DISPLAYED);
  }, [filteredProducts]);

  const hasMore = filteredProducts.length > MAX_DISPLAYED;

  // Memoize rendered products as cards
  const renderedProducts = useMemo(() => {
    return displayedProducts.map((product, index) => (
      <div
        key={`${selectedCategory}-${product.id}`}
        className="h-full transform transition-all duration-500 ease-out animate-on-view is-visible"
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <Card
          card={product}
          index={index}
          layout={true}
          onClick={() => handleProductClick(product)}
          subcategories={[]}
          onSubcategoryClick={() => { }}
        />
      </div>
    ));
  }, [displayedProducts, selectedCategory, handleProductClick]);

  return (
    <section ref={sectionRef} className="bg-white dark:bg-black py-6 sm:py-12 md:py-16 lg:py-20 px-3 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      {/* Mobile: "Explore Categories" heading — scrolls away naturally */}
      <div className={`lg:hidden flex items-end justify-between mb-4 transform transition-all duration-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 hover:text-[#0EA5E9] transition-colors cursor-default leading-tight">
          Explore
          <br />
          Categories
        </h2>
        <button
          onClick={() => router.push(getCategoryInfoLink())}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium bg-[#0EA5E9]/10 text-[#0369A1] dark:text-[#38BDF8] border border-[#0EA5E9]/20 rounded-full hover:bg-[#0EA5E9] hover:text-white transition-all mb-1"
        >
          <Info className="w-4 h-4" />
          <span>{selectedCategory === 'ALL' ? 'All Categories' : 'Category Info'}</span>
        </button>      
      </div>

      {/* Mobile: Sticky filter bar — sticks below navbar as you scroll */}
      <div ref={mobileFilterRef} className="lg:hidden sticky z-30 -mx-3 sm:-mx-6 px-3 sm:px-6 py-3 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-200/50 dark:border-white/5" style={{ top: "calc(60px + env(safe-area-inset-top, 0px))" }}>
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Filter by Category
          </h3>
          <div className="overflow-x-auto scrollbar-hide -mx-3 sm:-mx-6 px-3 sm:px-6">
            <div className="flex gap-2 pb-1 min-w-max">
              {categoryFilters.map((filter) => {
                const count = filter === 'ALL'
                  ? products.length
                  : products.filter(prod => {
                    const category = categories.find(cat => cat.name === filter);
                    if (!category) return false;
                    return prod.isActive && (
                      prod.category.id === category.id ||
                      prod.category.name === category.name
                    );
                  }).length;

                return (
                  <button
                    key={filter}
                    onClick={() => handleCategoryChange(filter)}
                    className={`whitespace-nowrap px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 shrink-0 ${selectedCategory === filter
                      ? 'bg-linear-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-lg shadow-[#0EA5E9]/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 bg-transparent dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-900'
                      }`}
                  >
                    <span>{filter}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full transition-colors ${selectedCategory === filter
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-[#121212] text-gray-600 dark:text-gray-400'
                      }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row min-h-100 lg:min-h-[60vh] gap-6 lg:gap-0">
        {/* Sidebar - Filter Section (Desktop only: sticky sidebar with heading + filters) */}
        <div className="hidden lg:block lg:w-1/5 shrink-0 lg:pr-6 xl:pr-8">
          <div
            className={`lg:sticky transform transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}
            style={{ top: "calc(88px + env(safe-area-inset-top, 0px))" }}
          >
            <div className="mb-8">
              <h2 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4 hover:text-[#0EA5E9] transition-all duration-300 cursor-default hover:scale-105 transform leading-tight">
                Explore
                <br />
                Categories
              </h2>
              <button
                onClick={() => router.push(getCategoryInfoLink())}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#0EA5E9]/10 text-[#0369A1] dark:text-[#38BDF8] border border-[#0EA5E9]/20 rounded-full hover:bg-[#0EA5E9] hover:text-white transition-all w-fit group"
              >
                <Info className="w-4 h-4" />
                <span>{selectedCategory === 'ALL' ? 'All Categories Info' : 'Category Info'}</span>
              </button>
            </div>

            <div
              className={`transform transition-all duration-700 ease-out ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              style={{ transitionDelay: '150ms' }}
            >
              {/* Category Filter Buttons — Desktop only (mobile is the sticky bar above) */}
              <div className="hidden lg:block space-y-3">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                  Filter by Category
                </h3>

                {/* Desktop: Vertical layout */}
                <div className="flex flex-col gap-2">
                  {categoryFilters.map((filter, index) => {
                    const count = filter === 'ALL'
                      ? products.length
                      : products.filter(prod => {
                        const category = categories.find(cat => cat.name === filter);
                        if (!category) return false;
                        return prod.isActive && (
                          prod.category.id === category.id ||
                          prod.category.name === category.name
                        );
                      }).length;

                    return (
                      <button
                        key={filter}
                        onClick={() => handleCategoryChange(filter)}
                        className={`text-left px-3 py-2 rounded-lg text-sm font-medium transition-all duration-500 ease-out hover:scale-105 flex items-center justify-between group ${selectedCategory === filter
                          ? 'bg-linear-to-r from-[#0EA5E9] to-[#0284C7] text-white shadow-lg shadow-[#0EA5E9]/20'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
                          } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                        style={{ transitionDelay: `${250 + index * 80}ms` }}
                      >
                        <span className="truncate">{filter}</span>
                        <span className={`ml-2 text-xs px-2 py-1 rounded-full transition-colors ${selectedCategory === filter
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-[#0EA5E9] group-hover:text-white'
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Categories Grid */}
        <div ref={contentRef} className="w-full lg:w-4/5 flex-1">
          <div className="space-y-8 sm:space-y-12">
            {/* Filter Status Indicator */}
            <div
              className={`flex items-center justify-between border-b border-gray-200 dark:border-white/10 pb-4 transition-all duration-500 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} delay-300`}
            >
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {selectedCategory === 'ALL' ? 'All Products' : `${selectedCategory} Products`}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {filteredProducts.length <= MAX_DISPLAYED
                    ? `Showing all ${filteredProducts.length} products`
                    : `Showing ${displayedProducts.length} of ${filteredProducts.length} products`
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
            </div>

            {/* Categories Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="rounded-2xl sm:rounded-3xl p-2 sm:p-3 bg-white/50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/6 h-full flex flex-col">
                    <div className="aspect-square rounded-xl sm:rounded-2xl skeleton-loader" />
                    <div className="mt-2 sm:mt-3 md:mt-4 space-y-2 flex-1">
                      <div className="h-5 w-full rounded skeleton-loader" />
                      <div className="h-4 w-1/2 rounded skeleton-loader" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                <div
                  key={selectedCategory}
                  className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 animate-fade-in"
                >
                  {renderedProducts}
                </div>

                {/* Show More / Explore All Button */}
                {hasMore && (
                  <div
                    className="flex justify-center pt-8 animate-fade-in"
                    style={{ animationDelay: '300ms' }}
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
                        Explore All {filteredProducts.length} Products
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-linear-to-r from-[#0369A1] to-[#0EA5E9] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-full text-center py-20">
                <div className="text-gray-300 mb-4">
                  <Droplets className="w-16 h-16 mx-auto opacity-40" />
                </div>
                <h3 className="text-xl font-light text-gray-600 dark:text-gray-400 mb-2">No products available</h3>
                <p className="text-gray-500 dark:text-gray-600">Check back soon for new products</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles for Performance Optimizations */}
      <style dangerouslySetInnerHTML={{
        __html: `
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