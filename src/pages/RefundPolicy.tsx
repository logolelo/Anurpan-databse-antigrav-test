import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import SEO from '@/components/SEO';
import { Breadcrumbs } from '@/components/Breadcrumbs';

const RefundPolicy = () => {
  const seoTitle = "Refund Policy — Anurpan Jewellery";
  const seoDescription = "Our refund policy lasts 30 days. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.";
  const canonicalUrl = "https://anurpanjewellery.com/refund-policy";

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={canonicalUrl}
        ogImage="https://anurpanjewellery.com/Anurpan Jewellery Logo.png"
      />
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <Breadcrumbs steps={[{ label: 'Refund Policy', active: true }]} hideVisual={true} />
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
          <div className="prose prose-sm lg:prose lg:max-w-none text-muted-foreground max-w-4xl">
            <p className="mb-6">
              Our policy lasts <span className="font-semibold text-foreground underline decoration-primary/30 underline-offset-4">30 days</span>. If 30 days have gone by since your purchase, unfortunately we can't offer you a refund or exchange.
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">01</span>
                ELIGIBILITY FOR RETURNS
              </h2>
              <p className="mb-4">
                To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
              </p>
              <p className="mb-4 font-medium text-foreground">
                To complete your return, kindly drop us a mail at <a href="mailto:anurpanjewellery@gmail.com" className="text-primary hover:underline">anurpanjewellery@gmail.com</a> or a message on our website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">02</span>
                REFUNDS (if applicable)
              </h2>
              <p className="mb-4">
                Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. We will also notify you of the approval or rejection of your refund.
              </p>
              <p className="mb-4">
                If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">03</span>
                LATE OR MISSING REFUNDS (if applicable)
              </h2>
              <div className="space-y-4">
                <p>If you haven't received a refund yet, first check your bank account again.</p>
                <p>Then contact your credit card company, it may take some time before your refund is officially posted.</p>
                <p>Next contact your bank. There is often some processing time before a refund is posted.</p>
                <p className="font-medium text-foreground p-4 bg-muted/50 rounded-xl border border-border">
                  If you've done all of this and you still have not received your refund yet, please contact us at <a href="mailto:anrupanjewellery@gmail.com" className="text-primary hover:underline">anrupanjewellery@gmail.com</a>
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">04</span>
                EXCHANGES (if applicable)
              </h2>
              <p className="mb-4">
                We only replace items if they are defective or damaged. If you need to exchange it for the same item, send us an email at <a href="mailto:anrupanjewellery@gmail.com" className="text-primary hover:underline">anrupanjewellery@gmail.com</a> and send your item to:
              </p>
              <div className="p-6 bg-muted/50 rounded-2xl border border-border mb-4">
                <p className="font-bold text-foreground mb-1">Anurpan Jewellery</p>
                <p className="mb-1">Shop no. 111 Ashar enclave building</p>
                <p className="mb-1">Kolshet Road Dhokali next to D mart</p>
                <p>Thane Maharashtra 400607 india.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2 uppercase tracking-wide">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">05</span>
                SHIPPING
              </h2>
              <p className="mb-4">
                To return your product, you should mail your product to:
              </p>
              <div className="p-6 bg-muted/50 rounded-2xl border border-border mb-6">
                <p className="font-bold text-foreground mb-1">Anurpan Jewellery</p>
                <p className="mb-1">111 Ashar enclave building</p>
                <p className="mb-1">Kolshet Road Dhokali next to D mart</p>
                <p>Thane Maharashtra 400607 india.</p>
              </div>
              <div className="space-y-4">
                <p>
                  You will be responsible for paying for your own shipping costs for returning your item. <span className="font-semibold text-foreground">Shipping costs are non-refundable.</span> If you receive a refund, the cost of return shipping will be deducted from your refund.
                </p>
                <p className="italic text-sm">
                  Depending on where you live, the time it may take for your exchanged product to reach you, may vary.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RefundPolicy;
