import { useEffect, useState } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductRow } from '@/components/ProductRow';
import { useProductByHandle, useProducts } from '@/hooks/useProducts';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Minus, Plus, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES, type MainCategory } from '@/lib/constants';
import SEO from '@/components/SEO';
import { Breadcrumbs, type BreadcrumbStep } from '@/components/Breadcrumbs';
import { ProductReviews } from '@/components/ProductReviews';
import { trackEvent } from '@/lib/tracking';
import { ProductSignals } from '@/components/ProductSignals';

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const source = location.state?.from as string | undefined;

  const { data: product, isLoading, error } = useProductByHandle(handle || '');
  const { data: catalogProducts } = useProducts();
  const { data: allProducts } = useProducts(
    product?.productType ? `product_type:"${product.productType}"` : undefined
  );
  const addItem = useCartStore(state => state.addItem);
  const cartLoading = useCartStore(state => state.isLoading);

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  useEffect(() => {
    if (!handle || product || isLoading || !catalogProducts) return;

    const decodedHandle = decodeURIComponent(handle).trim();
    const normalizedRequested = normalizeSlug(decodedHandle);

    const matchByHandle = catalogProducts.find(
      p => p.node.handle.toLowerCase() === decodedHandle.toLowerCase()
    );
    if (matchByHandle) {
      const canonicalPath = `/product/${encodeURIComponent(matchByHandle.node.handle)}`;
      if (canonicalPath !== `/product/${handle}`) {
        navigate(canonicalPath, { replace: true });
      }
      return;
    }

    const matchByTitle = catalogProducts.find(
      p => normalizeSlug(p.node.title) === normalizedRequested
    );
    if (matchByTitle) {
      navigate(`/product/${encodeURIComponent(matchByTitle.node.handle)}`, { replace: true });
    }
  }, [catalogProducts, handle, isLoading, navigate, product]);

  useEffect(() => {
    if (product?.id) {
      trackEvent('product_view', product.id);
    }
  }, [product?.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Product Not Found</h1>
            <Link to="/products" className="text-primary hover:underline">Browse all products</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.images.edges;
  const variants = product.variants.edges;
  const selectedVariant = variants[selectedVariantIndex]?.node;
  const price = selectedVariant ? parseFloat(selectedVariant.price.amount) : 0;
  const priceCurrency = selectedVariant?.price.currencyCode || 'INR'; // Assuming INR as default currency
  const availability = selectedVariant?.availableForSale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock';

  // Find the category (Silver 925 or Imitation) from tags
  const productCategory = Object.keys(CATEGORIES).find(cat =>
    product.tags.some(tag => tag.toLowerCase() === cat.toLowerCase())
  );
  const categoryLabel = productCategory || product.productType || 'jewellery';
  const priceLabel = price > 0 ? `₹${price.toFixed(0)}` : 'best price';
  const generatedSeoDescription = `Buy ${product.title} at ${priceLabel}. Premium ${categoryLabel} from Anurpan Jewellery.`;

  // SEO data extraction
  const seoTitle = `${product.title} — Anurpan Jewellery`;
  const seoDescription = generatedSeoDescription;
  const canonicalUrl = `https://anurpanjewellery.com/product/${product.handle}`;
  const ogImage = product.images.edges[0]?.node.url || "https://anurpanjewellery.com/Anurpan Jewellery Logo.png";
  const productDetailsText = product.description?.trim() || [
    `A premium ${categoryLabel.toLowerCase()} piece designed for everyday elegance.`,
    `Crafted for comfort and style, this ${product.title} pairs beautifully with both Indian and Western wear.`,
    'Shop authentic Anurpan Jewellery with secure checkout and trusted delivery.',
  ].join('\n');

  const productJsonLd = {
    "@type": "Product",
    "name": product.title,
    "image": ogImage,
    "description": seoDescription,
    "sku": selectedVariant?.sku,
    "offers": {
      "@type": "Offer",
      "url": canonicalUrl,
      "priceCurrency": priceCurrency,
      "price": price.toFixed(2),
      "itemCondition": "https://schema.org/NewCondition",
      "availability": availability,
    },
    "brand": {
      "@type": "Brand",
      "name": "Anurpan Jewellery"
    }
  };

  const seoJsonLd = {
    "@context": "https://schema.org",
    "@graph": [productJsonLd]
  };

  // Build Breadcrumb steps
  const breadcrumbSteps: BreadcrumbStep[] = [
    { label: 'Products', href: '/products' }
  ];

  if (productCategory) {
    breadcrumbSteps.push({ 
      label: productCategory, 
      href: `/products?category=${encodeURIComponent(productCategory)}` 
    });
  }

  // Add subcategory if available (using productType as it often maps to our subcategories)
  const productSubcategory = product.productType;
  if (productSubcategory && productSubcategory !== productCategory) {
    breadcrumbSteps.push({ 
      label: productSubcategory, 
      href: `/products?${new URLSearchParams({
        ...(productCategory ? { category: productCategory } : {}),
        sub: productSubcategory
      }).toString()}`
    });
  }

  breadcrumbSteps.push({ label: product.title, active: true });

  const compareAt = selectedVariant?.compareAtPrice ? parseFloat(selectedVariant.compareAtPrice.amount) : null;
  const hasDiscount = !!(compareAt && compareAt > price && compareAt > 0);

  const maxStock = selectedVariant?.quantityAvailable ?? 0;
  const inStock = selectedVariant?.availableForSale ?? false;
  const lowStock = inStock && maxStock > 0 && maxStock <= 10;
  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty < 1) return;
    if (maxStock && newQty > maxStock) {
      toast.error(`Only ${maxStock} available in stock`);
      return;
    }
    setQuantity(newQty);
  };

  const similarProducts = allProducts?.filter(p => 
    p.node.handle !== product.handle && 
    p.node.productType === product.productType
  ).slice(0, 10) || [];

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    await addItem({
      product: { node: product },
      variantId: selectedVariant.id,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions || [],
      quantityAvailable: selectedVariant.quantityAvailable ?? null,
    });
    trackEvent('add_to_cart', product.id);
    toast.success('Added to cart', { description: `${product.title} × ${quantity}`, position: 'top-center' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        ogImage={ogImage}
        jsonLd={seoJsonLd}
      />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          <Breadcrumbs steps={breadcrumbSteps} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-2xl overflow-hidden bg-muted mb-4">
                {images[selectedImageIndex]?.node ? (
                  <img
                    src={images[selectedImageIndex].node.url}
                    alt={images[selectedImageIndex].node.altText || product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition-all ${i === selectedImageIndex ? 'border-primary' : 'border-border hover:border-primary/50'}`}
                    >
                      <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {productCategory && (
                  <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full bg-primary/10 text-primary font-bold">
                    {productCategory}
                  </span>
                )}
                {product.productType && (
                  <span className="inline-block px-3 py-1 text-[10px] uppercase tracking-wider rounded-full bg-secondary/15 text-secondary font-bold">
                    {product.productType}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-2">{product.title}</h1>
              
              <div className="flex flex-col gap-3 mb-6">
                <ProductSignals productId={product.id} />
                {selectedVariant?.sku && (
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">SKU: {selectedVariant.sku}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-foreground">₹{price.toFixed(0)}</span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-muted-foreground line-through">₹{compareAt.toFixed(0)}</span>
                    <span className="text-sm font-semibold text-secondary">-{Math.round((1 - price / compareAt) * 100)}% OFF</span>
                  </>
                )}
              </div>

              {/* Availability */}
              <div className="flex items-center gap-2 mb-6">
                {selectedVariant?.availableForSale ? (
                  <>
                    <Check className={`h-4 w-4 ${lowStock ? 'text-amber-600' : 'text-green-600'}`} />
                    <span className={`text-sm font-medium ${lowStock ? 'text-amber-600' : 'text-green-600'}`}>
                      {lowStock ? `In stock — only ${maxStock} left` : 'In Stock'}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-destructive font-medium">Out of Stock</span>
                )}
              </div>

              {/* Variants */}
              {product.options.filter(o => o.name !== 'Title' || o.values[0] !== 'Default Title').map((option) => (
                <div key={option.name} className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-2">{option.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const variantIdx = variants.findIndex(v =>
                        v.node.selectedOptions.some(o => o.name === option.name && o.value === value)
                      );
                      const isSelected = variantIdx === selectedVariantIndex;
                      return (
                        <button
                          key={value}
                          onClick={() => { setSelectedVariantIndex(variantIdx >= 0 ? variantIdx : 0); }}
                          className={`px-4 py-2 rounded-lg text-sm border-2 transition-all ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary'}`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Quantity */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-sm font-medium text-foreground">Quantity</p>
                  {maxStock > 0 && quantity >= maxStock && (
                    <span className="text-xs font-medium text-destructive animate-pulse">Max stock reached</span>
                  )}
                </div>
                <div className="flex items-center gap-4 bg-muted/30 w-fit p-1.5 rounded-xl border border-border">
                  <Button variant="outline" size="icon" className="rounded-lg h-9 w-9" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-lg h-9 w-9" 
                    onClick={() => handleQuantityChange(1)}
                    disabled={maxStock ? quantity >= maxStock : false}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                onClick={handleAddToCart}
                disabled={cartLoading || !selectedVariant?.availableForSale}
                size="lg"
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-lg font-semibold py-6"
              >
                {cartLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShoppingCart className="h-5 w-5 mr-2" />Add to Cart</>}
              </Button>

              {/* Tabs */}
              <Tabs defaultValue="details" className="mt-8">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Product Details</TabsTrigger>
                  <TabsTrigger value="refund" className="flex-1">Refund Policy</TabsTrigger>
                  <TabsTrigger value="delivery" className="flex-1">Delivery Info</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-4">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {productDetailsText}
                  </p>
                </TabsContent>
                <TabsContent value="refund" className="mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    We offer a 7-day return policy on all products. Items must be returned in their original condition with tags attached. Refunds are processed within 5-7 business days.
                  </p>
                </TabsContent>
                <TabsContent value="delivery" className="mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    Free shipping on orders above ₹999. Standard delivery takes 5-7 business days. Express delivery available at checkout for select locations.
                  </p>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <ProductReviews productId={product.id} />
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <ProductRow 
            title="Similar Products" 
            products={similarProducts} 
            viewMoreLink={`/products?category=${encodeURIComponent(productCategory || '')}&sub=${encodeURIComponent(product.productType || '')}`} 
          />
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
