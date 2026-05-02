import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, ShieldCheck, Heart, Zap } from 'lucide-react';
import SEO from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const AboutUs = () => {
  const seoTitle = "About Anurpan Jewellery";
  const seoDescription = "Learn about Anurpan Jewellery, specializing in lightweight, anti-tarnish, and anti-allergic Silver 925 and Imitation jewellery for the modern woman.";
  const canonicalUrl = "https://anurpanjewellery.com/about-us";

  const aboutUsJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": seoTitle,
    "description": seoDescription,
    "publisher": {
      "@type": "Organization",
      "name": "Anurpan Jewellery",
      "logo": "https://anurpanjewellery.com/Anurpan Jewellery Logo.png"
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        ogImage="https://anurpanjewellery.com/Anurpan Jewellery Logo.png"
        jsonLd={aboutUsJsonLd}
      />
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Hero Section */}
        <section className="relative py-12 lg:py-20 overflow-hidden bg-primary text-primary-foreground">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl opacity-50"></div>
          <div className="container mx-auto px-4 relative z-10">
            <Breadcrumbs 
              steps={[{ label: 'About Us', active: true }]} 
              hideVisual={true}
            />
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="font-display text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Crafting Elegance for the <span className="text-secondary">Modern Woman</span>
              </h1>
              <p className="text-base lg:text-lg text-primary-foreground/80 leading-relaxed">
                At Anurpan Jewellery, we believe jewellery is more than an accessory — it is a reflection of confidence, individuality, and timeless elegance.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Philosophy */}
        <section className="py-16 lg:py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-6">Our Brand Philosophy</h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Anurpan was born from a passion for designing pieces that celebrate modern femininity while honoring fine craftsmanship. We understand that today's woman needs jewellery that moves with her lifestyle — from the boardroom to a casual evening out.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Lightweight</h3>
                  <p className="text-muted-foreground">Designed for all-day comfort without compromising on style.</p>
                </div>
                <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Anti-Tarnish</h3>
                  <p className="text-muted-foreground">Long-lasting shine that stays as bright as your ambition.</p>
                </div>
                <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Sparkles className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Anti-Allergic</h3>
                  <p className="text-muted-foreground">Skin-friendly materials safe for even the most sensitive skin.</p>
                </div>
                <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                  <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Heart className="h-6 w-6 text-secondary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">Long-Lasting</h3>
                  <p className="text-muted-foreground">Meticulous attention to detail ensures durable quality.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Specialization */}
        <section className="py-16 bg-muted/20 border-y border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-12">
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold text-foreground">Our Mission</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our mission is to empower women with jewellery that feels as good as it looks — comfortable, durable, and beautifully designed. We specialize in Silver 925 and high-quality Imitation jewellery specifically curated for the modern office-going woman.
                </p>
              </div>
              
              <div className="h-px w-24 bg-secondary/30 mx-auto"></div>
              
              <div className="space-y-4">
                <h2 className="font-display text-3xl font-bold text-foreground">Our Specialization</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Whether you're in a boardroom meeting, at a formal event, or out for a casual evening, Anurpan Jewellery complements your look effortlessly. We blend contemporary designs with subtle sophistication, making our pieces perfect for daily wear while maintaining a refined, elegant appeal.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final Quote - Minimal Version */}
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <div className="inline-block w-12 h-1 bg-secondary/30 mb-8 rounded-full"></div>
              <h3 className="font-display text-2xl lg:text-3xl font-medium text-foreground italic leading-relaxed">
                "Anurpan Jewellery — Designed for the Modern Woman. Crafted for Everyday Elegance."
              </h3>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutUs;
