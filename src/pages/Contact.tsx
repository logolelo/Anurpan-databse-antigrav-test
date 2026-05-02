import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import SEO from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const Contact = () => {
  const seoTitle = "Contact Us — Anurpan Jewellery";
  const seoDescription = "Get in touch with Anurpan Jewellery for inquiries about our Silver 925 and Imitation jewellery collections.";
  const canonicalUrl = "https://anurpanjewellery.com/contact";

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": seoTitle,
    "description": seoDescription,
    "mainEntity": {
      "@type": "Store",
      "name": "Anurpan Jewellery",
      "email": "anurpanjewellery@gmail.com",
      "telephone": ["+91 9152520710", "+91 7039036583"],
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Shop no 111 Ashar enclave building, Kolshet Road Dhokali Next to D mart",
        "addressLocality": "Thane",
        "addressRegion": "Maharashtra",
        "postalCode": "400607",
        "addressCountry": "IN"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        ogImage="https://anurpanjewellery.com/Anurpan Jewellery Logo.png"
        jsonLd={contactJsonLd}
      />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs steps={[{ label: 'Contact Us', active: true }]} hideVisual={true} />
            <div className="text-center mb-12 lg:mb-16">
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-foreground mb-4">Contact Us</h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Have a question about our collections or an existing order? We're here to help you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
              {/* Email Card */}
              <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">Email Us</h3>
                <p className="text-muted-foreground mb-4">For general inquiries and support</p>
                <a href="mailto:anurpanjewellery@gmail.com" className="text-primary font-medium hover:underline break-all block">
                  anurpanjewellery@gmail.com
                </a>
              </div>

              {/* Phone Card */}
              <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Phone className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">Call Us</h3>
                <p className="text-muted-foreground mb-4">Available during support hours</p>
                <div className="space-y-1">
                  <a href="tel:+919152520710" className="text-primary font-medium hover:underline block">
                    +91 9152520710
                  </a>
                  <a href="tel:+917039036583" className="text-primary font-medium hover:underline block">
                    +91 7039036583
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Visit Card */}
              <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">Our Location</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Shop no 111 Ashar enclave building, Kolshet Road Dhokali Next to D mart, Thane, Maharashtra 400607.
                </p>
              </div>

              {/* Support Card */}
              <div className="p-8 bg-muted/30 rounded-3xl border border-border hover:border-secondary/50 transition-colors group">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">Support Hours</h3>
                <p className="text-muted-foreground mb-1">Monday — Saturday</p>
                <p className="font-medium text-foreground">10 AM – 7 PM IST</p>
              </div>
            </div>

            <div className="mt-12 p-10 bg-primary rounded-3xl text-primary-foreground text-center overflow-hidden relative">
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 max-w-xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-display font-bold mb-4">Need Faster Assistance?</h2>
                <p className="text-primary-foreground/80 text-lg">
                  Reach out to us directly via phone or email. For order inquiries, please mention your Order ID for a quicker response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
