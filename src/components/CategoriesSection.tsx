import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, type MainCategory } from '@/lib/constants';
import { useAllProducts } from '@/hooks/useProducts';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductRow } from '@/components/ProductRow';
import useEmblaCarousel from 'embla-carousel-react';

export function CategoriesSection() {
  const [selectedCategory, setSelectedCategory] = useState<MainCategory>('Silver 925');
  const [selectedSub, setSelectedSub] = useState<string | null>('Earrings & Pendant Set');
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  });

  useEffect(() => {
    if (!emblaApi) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        if (e.deltaX > 0 || e.deltaY > 0) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollPrev();
        }
        e.preventDefault();
      }
    };

    const emblaNode = emblaApi.rootNode();
    emblaNode.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      emblaNode.removeEventListener('wheel', onWheel);
    };
  }, [emblaApi]);

  const subcategoryGroups = CATEGORIES[selectedCategory];
  const subcategories = Object.values(subcategoryGroups).flat();
  
  const { data: allProducts = [], isLoading: isPreviewLoading, isFetching: isPreviewFetching } = useAllProducts();

  // Strict client-side filtering from the full product list (matching sidebar counts exactly)
  const previewProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter((p) => {
      // Must match the main category (tag)
      if (selectedCategory && !p.node.tags.includes(selectedCategory)) return false;
      // Must match the subcategory (product type)
      if (selectedSub && p.node.productType !== selectedSub) return false;
      return true;
    }).slice(0, 12);
  }, [allProducts, selectedCategory, selectedSub]);

  return (
    <>
      <section className="pt-10 lg:pt-16 pb-0">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-center text-foreground mb-8">Shop by Category</h2>
          <div className="flex justify-center gap-3 mb-8">
            {(Object.keys(CATEGORIES) as MainCategory[]).map((cat) => {
              const active = cat === selectedCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap px-6 py-2 rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    active
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
          <div className="-mx-4 overflow-hidden" ref={emblaRef}>
            <div className="flex flex-nowrap gap-2 lg:gap-3 px-4 lg:justify-center">
              {subcategories.map((sub) => {
                const active = selectedSub === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => setSelectedSub(sub)}
                    className={`shrink-0 inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      active
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {selectedSub && (
        <div className="relative">
          {isPreviewLoading ? (
            <div className="container mx-auto px-4 py-16 flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className={`transition-opacity duration-300 ${isPreviewFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              {previewProducts.length > 0 ? (
                <ProductRow
                  title={`${selectedCategory} — ${selectedSub}`}
                  products={previewProducts.slice(0, 12)}
                  viewMoreLink={`/products?category=${encodeURIComponent(selectedCategory)}&sub=${encodeURIComponent(selectedSub)}`}
                />
              ) : (
                <div className="container mx-auto px-4 py-16">
                  <div className="flex flex-col items-center mb-8">
                    <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-4">
                      {selectedCategory} — {selectedSub}
                    </h3>
                  </div>
                  <div className="min-h-[320px] lg:min-h-[380px] flex items-center justify-center border rounded-3xl bg-muted/30 mb-8">
                    <div className="text-center">
                      <Sparkles className="mx-auto h-6 w-6 text-secondary mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No items found for <span className="font-semibold">{selectedCategory} — {selectedSub}</span>. Try another type.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <Link
                      to={`/products?category=${encodeURIComponent(selectedCategory)}&sub=${encodeURIComponent(selectedSub)}`}
                    >
                      <Button 
                        variant="outline" 
                        className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold"
                      >
                        Explore all {selectedSub}
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          {isPreviewFetching && !isPreviewLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px] rounded-xl z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
    </>
  );
}
