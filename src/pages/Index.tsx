import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroCarousel } from '@/components/HeroCarousel';
import { CategoriesSection } from '@/components/CategoriesSection';
import { ProductRow } from '@/components/ProductRow';
import { PromoBanner } from '@/components/PromoBanner';
import { FeaturesMarquee } from '@/components/FeaturesMarquee';
import { useProducts } from '@/hooks/useProducts';
import { Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';

const Index = () => {
  const { data: products, isLoading } = useProducts();

  const hasTag = (p: { node: { tags: string[] } }, tag: string) =>
    (p.node.tags || []).some((t) => (t || "").toLowerCase() === tag.toLowerCase());

  const bestSellers =
    products?.filter((p) => hasTag(p, 'Best Sellers')).slice(0, 10) || [];
  const newArrivals =
    products?.filter((p) => hasTag(p, 'New Arrivals')).slice(0, 10) || [];
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "Anurpan Jewellery",
        "url": "https://anurpanjewellery.com",
        "logo": "https://anurpanjewellery.com/Anurpan Jewellery Logo.png",
        "contactPoint": [
          {
            "@type": "ContactPoint",
            "telephone": "+91 9152520710",
            "contactType": "customer service",
            "email": "anurpanjewellery@gmail.com",
            "areaServed": "IN",
            "availableLanguage": ["en"]
          }
        ],
        "sameAs": [
          "https://www.instagram.com/anurpan_jewellery/",
          "https://www.facebook.com/people/Anurpan-Jewellery/100086367500000/"
        ]
      },
      {
        "@type": "WebSite",
        "name": "Anurpan Jewellery",
        "url": "https://anurpanjewellery.com/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://anurpanjewellery.com/products?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Anurpan Jewellery — Silver 925 & Imitation Jewellery"
        description="Discover exquisite Silver 925 and imitation jewellery at Anurpan. Shop our curated collections for festive, wedding, everyday, office, and party wear. Free shipping & 7-day returns."
        canonical="https://anurpanjewellery.com/"
        ogImage="https://anurpanjewellery.com/Anurpan Jewellery Logo.png"
        jsonLd={homeJsonLd}
      />
      <Navbar />

      <main className="flex-1">
        <HeroCarousel />
        <CategoriesSection />

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products && products.length > 0 ? (
          <>
            <ProductRow title="Best Sellers" products={bestSellers} viewMoreLink="/products?special=Best+Sellers" />
            <PromoBanner />
            <ProductRow title="New Arrivals" products={newArrivals} viewMoreLink="/products?special=New+Arrivals" />
          </>
        ) : (
          <section className="py-20 text-center">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">No Products Yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Products will appear here once they're added to the store. Tell us what products you'd like to sell!
              </p>
            </div>
          </section>
        )}

        <FeaturesMarquee />
      </main>

      <Footer />
    </div>
  );
};

export default Index;
