import { useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';
import type { ShopifyProduct } from '@/lib/shopify';
import useEmblaCarousel from 'embla-carousel-react';

interface ProductRowProps {
  title: string;
  products: ShopifyProduct[];
  viewMoreLink?: string;
}

export function ProductRow({ title, products, viewMoreLink }: ProductRowProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

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

  if (products.length === 0) return null;

  return (
    <section className="py-10 lg:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-end justify-between mb-6 lg:mb-8">
          <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground">{title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 hidden md:flex" onClick={scrollPrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full h-9 w-9 hidden md:flex" onClick={scrollNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="overflow-hidden mb-8" ref={emblaRef}>
          <div className="flex gap-4 lg:gap-6">
            {products.map((product) => (
              <div key={product.node.id} className="flex-[0_0_200px] lg:flex-[0_0_260px] min-w-0">
                <ProductCard product={product} source={title} />
              </div>
            ))}
          </div>
        </div>
        {viewMoreLink && (
          <div className="flex justify-center mt-8 lg:mt-10">
            <Link to={viewMoreLink}>
              <Button 
                variant="outline" 
                className="rounded-full px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 font-semibold"
              >
                View All {title.split('—').pop()?.trim() || 'Products'}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
