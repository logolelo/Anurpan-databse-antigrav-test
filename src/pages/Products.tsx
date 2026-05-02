import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { useAllProducts, useProducts } from '@/hooks/useProducts';
import { Loader2, Filter, ChevronDown, X, Check } from 'lucide-react';
import { CATEGORIES, COLLECTIONS, type MainCategory } from '@/lib/constants';
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import SEO from '@/components/SEO';
import { Breadcrumbs, type BreadcrumbStep } from '@/components/Breadcrumbs';

type SortOption = 'price-low' | 'price-high' | 'alpha-asc' | 'alpha-desc' | 'newest' | 'best-sellers' | 'new-arrivals';

const SORT_LABELS: Record<SortOption, string> = {
  'newest': 'Newest Arrivals',
  'price-low': 'Price: Low to High',
  'price-high': 'Price: High to Low',
  'alpha-asc': 'Alphabetical (A-Z)',
  'alpha-desc': 'Alphabetical (Z-A)',
  'best-sellers': 'Best Sellers',
  'new-arrivals': 'New Arrivals',
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  const sub = searchParams.get('sub');
  const collection = searchParams.get('collection');
  const special = searchParams.get('special');
  const q = searchParams.get('q');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const updateSort = (option: SortOption) => {
    setSortBy(option);
    if (option === 'best-sellers') {
      updateFilter('special', 'Best Sellers');
    } else if (option === 'new-arrivals') {
      updateFilter('special', 'New Arrivals');
    } else {
      updateFilter('special', null);
    }
  };

  // Build a Shopify search query from filters
  const shopifyQuery = useMemo(() => {
    const parts = [];
    if (q) parts.push(q);
    if (category) parts.push(`tag:"${category}"`);
    if (sub) parts.push(`product_type:"${sub}"`);
    if (collection) parts.push(`tag:"${collection}"`);
    if (special) parts.push(`tag:"${special}"`);
    return parts.join(' ') || undefined;
  }, [q, category, sub, collection, special]);

  const { data: products, isLoading } = useProducts(shopifyQuery);
  const { data: allProducts, isLoading: isCountsLoading } = useAllProducts();

  const sortedProducts = useMemo(() => {
    if (!products) return [];
    
    // Strict client-side filtering to match sidebar counts exactly
    const items = products.filter((p) => {
      if (category && !p.node.tags.includes(category)) return false;
      if (sub && p.node.productType !== sub) return false;
      if (collection && !p.node.tags.includes(collection)) return false;
      if (special) {
        const hasSpecial = p.node.tags.some(
          (t) => t.toLowerCase() === special.toLowerCase()
        );
        if (!hasSpecial) return false;
      }
      return true;
    });
    
    switch (sortBy) {
      case 'price-low':
        return [...items].sort((a, b) => 
          parseFloat(a.node.priceRange.minVariantPrice.amount) - 
          parseFloat(b.node.priceRange.minVariantPrice.amount)
        );
      case 'price-high':
        return [...items].sort((a, b) => 
          parseFloat(b.node.priceRange.minVariantPrice.amount) - 
          parseFloat(a.node.priceRange.minVariantPrice.amount)
        );
      case 'alpha-asc':
        return [...items].sort((a, b) => a.node.title.localeCompare(b.node.title));
      case 'alpha-desc':
        return [...items].sort((a, b) => b.node.title.localeCompare(a.node.title));
      default:
        return items;
    }
  }, [products, sortBy, category, sub, collection, special]);

  const totalProductsInStore = allProducts?.length ?? 0;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const source = allProducts ?? [];

    Object.keys(CATEGORIES).forEach((cat) => {
      counts[cat] = source.filter((product) => product.node.tags.includes(cat)).length;
    });

    return counts;
  }, [allProducts]);

  const productTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (!category) return counts;
    const source = allProducts ?? [];
    const categoryScoped = source.filter((product) => product.node.tags.includes(category));

    Object.values(CATEGORIES[category as MainCategory] || {}).forEach((items) => {
      items.forEach((item) => {
        counts[item] = categoryScoped.filter((product) => product.node.productType === item).length;
      });
    });

    return counts;
  }, [allProducts, category]);

  const collectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const source = allProducts ?? [];

    COLLECTIONS.forEach((coll) => {
      counts[coll] = source.filter((product) => product.node.tags.includes(coll)).length;
    });

    return counts;
  }, [allProducts]);

  const specialCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const source = allProducts ?? [];
    const tags = ['Best Sellers', 'New Arrivals'];

    tags.forEach((t) => {
      counts[t] = source.filter((product) => 
        product.node.tags.some(tag => tag.toLowerCase() === t.toLowerCase())
      ).length;
    });

    return counts;
  }, [allProducts]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // If changing category, reset subcategory
    if (key === 'category') newParams.delete('sub');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const pageTitle = special || collection || (category && sub ? `${category} — ${sub}` : category || sub || (q ? `Search: "${q}"` : 'All Products'));
  const seoTitle = `${pageTitle} — Anurpan Jewellery`;
  const seoDescription = `Browse our collection of ${pageTitle.toLowerCase()} at Anurpan Jewellery. Find exquisite Silver 925 and imitation jewellery.`;
  const canonicalUrl = "https://anurpanjewellery.com/products";
  const hasActiveFilters = Boolean(category || sub || collection || special || q);
  
  // Build Breadcrumb steps
  const breadcrumbSteps: BreadcrumbStep[] = [
    { label: 'Products', href: '/products', active: !hasActiveFilters }
  ];

  if (category) {
    breadcrumbSteps.push({ 
      label: category, 
      href: `/products?category=${encodeURIComponent(category)}`,
      active: !sub
    });
  }

  if (sub) {
    breadcrumbSteps.push({ 
      label: sub, 
      active: true 
    });
  } else if (collection) {
    breadcrumbSteps.push({ 
      label: collection, 
      active: true 
    });
  } else if (special) {
    breadcrumbSteps.push({ 
      label: special, 
      active: true 
    });
  } else if (q) {
    breadcrumbSteps.push({ 
      label: `Search: ${q}`, 
      active: true 
    });
  }

  const FilterContent = () => (
    <div className="space-y-8">
      <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Products In Store</p>
        <p className="font-display text-2xl font-bold text-foreground">
          {isCountsLoading ? '...' : totalProductsInStore}
        </p>
      </div>

      {/* Category Filter */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Category</h3>
        <div className="flex flex-wrap gap-2">
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', category === cat ? null : cat)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                category === cat 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-border text-foreground hover:border-primary'
              }`}
            >
              {cat} ({categoryCounts[cat] ?? 0})
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Filter (only if category is selected) */}
      {category && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Product Type</h3>
          <div className="space-y-4">
            {Object.entries(CATEGORIES[category as MainCategory] || {}).map(([group, items]) => (
              <div key={group}>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {items.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateFilter('sub', sub === s ? null : s)}
                      className={`px-4 py-2 rounded-full text-sm border transition-all ${
                        sub === s 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'border-border text-foreground hover:border-primary'
                      }`}
                    >
                      {s} ({productTypeCounts[s] ?? 0})
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collections Filter */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Collections</h3>
        <div className="flex flex-wrap gap-2">
          {COLLECTIONS.map((coll) => (
            <button
              key={coll}
              onClick={() => updateFilter('collection', collection === coll ? null : coll)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                collection === coll 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'border-border text-foreground hover:border-primary'
              }`}
            >
              {coll} ({collectionCounts[coll] ?? 0})
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        ogImage="https://anurpanjewellery.com/Anurpan Jewellery Logo.png"
        noindex={hasActiveFilters}
      />
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <Breadcrumbs steps={breadcrumbSteps} className="mb-2" />
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile Filter Trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden gap-2">
                    <Filter className="h-4 w-4" /> Filters
                    {(category || sub || collection || special) && (
                      <span className="bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                        {[category, sub, collection, special].filter(Boolean).length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="flex items-center justify-between">
                      Filters
                      {(category || sub || collection || special) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8">
                          Clear All
                        </Button>
                      )}
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-120px)] pr-4">
                    <FilterContent />
                  </ScrollArea>
                </SheetContent>
              </Sheet>

              {/* Sort Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 min-w-[160px] justify-between">
                    <span className="truncate">
                      {sortBy === 'newest' ? 'Sort & Highlights' : SORT_LABELS[sortBy]}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuItem onClick={() => updateSort('newest')} className="flex items-center justify-between">
                    Reset Sort {sortBy === 'newest' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <div className="h-px bg-border my-1" />
                  <DropdownMenuItem onClick={() => updateSort('best-sellers')} className="flex items-center justify-between">
                    Best Sellers ({specialCounts['Best Sellers'] ?? 0})
                    {sortBy === 'best-sellers' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSort('new-arrivals')} className="flex items-center justify-between">
                    New Arrivals ({specialCounts['New Arrivals'] ?? 0})
                    {sortBy === 'new-arrivals' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSort('price-low')} className="flex items-center justify-between">
                    Price: Low to High {sortBy === 'price-low' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSort('price-high')} className="flex items-center justify-between">
                    Price: High to Low {sortBy === 'price-high' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSort('alpha-asc')} className="flex items-center justify-between">
                    Alphabetical (A-Z) {sortBy === 'alpha-asc' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => updateSort('alpha-desc')} className="flex items-center justify-between">
                    Alphabetical (Z-A) {sortBy === 'alpha-desc' && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Desktop Sidebar Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-bold">Filters</h2>
                  {(category || sub || collection || special) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs h-8 px-2 hover:bg-transparent hover:text-primary">
                      <X className="h-3 w-3 mr-1" /> Clear All
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[calc(100vh-11rem)] pr-3">
                  <FilterContent />
                </ScrollArea>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground animate-pulse">Loading amazing collection...</p>
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 lg:gap-8">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.node.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-muted/30 rounded-3xl border border-dashed border-border">
                  <div className="bg-background w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Filter className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">No items match your filters</h2>
                  <p className="text-muted-foreground mb-6">Try adjusting your filters or search terms.</p>
                  <Button onClick={clearFilters} variant="default" className="rounded-full px-8">
                    Reset All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
