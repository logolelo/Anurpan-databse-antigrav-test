import * as React from 'react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";

export interface BreadcrumbStep {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  steps: BreadcrumbStep[];
  className?: string;
  variant?: 'light' | 'dark';
  hideVisual?: boolean;
}

export function Breadcrumbs({ steps, className, variant = 'light', hideVisual = false }: BreadcrumbsProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = React.useState(false);
  const [showRightFade, setShowRightFade] = React.useState(false);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftFade(scrollLeft > 10);
      setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  // Auto-scroll to the end on mobile when steps change
  React.useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
      checkScroll();
    }
  }, [steps, checkScroll]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  // Generate JSON-LD for breadcrumbs
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": steps.map((step, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": step.label,
      "item": step.href ? `https://anurpanjewellery.com${step.href}` : undefined,
    })),
  };

  const isDark = variant === 'dark';

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
      {!hideVisual && (
        <div className={cn("relative mb-6 group", className)}>
          {/* Left Fade Indicator */}
          <div className={cn(
            "absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 sm:hidden",
            showLeftFade ? "opacity-100" : "opacity-0"
          )} />
          
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
          >
            <Breadcrumb>
              <BreadcrumbList className={cn(
                "flex-nowrap whitespace-nowrap py-1",
                isDark ? "text-primary-foreground/60" : "text-muted-foreground"
              )}>
                <BreadcrumbItem className="flex-shrink-0">
                  <BreadcrumbLink asChild>
                    <Link to="/" className={cn(
                      "flex items-center gap-1",
                      isDark ? "hover:text-secondary" : "hover:text-primary"
                    )}>
                      <Home className="h-3.5 w-3.5" />
                      <span className="sr-only">Home</span>
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {steps.map((step, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbSeparator className={cn("flex-shrink-0", isDark ? "text-primary-foreground/40" : "")}>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem className="flex-shrink-0">
                      {step.active || !step.href ? (
                        <BreadcrumbPage className={cn(
                          "max-w-[200px] truncate sm:max-w-none",
                          isDark ? "text-primary-foreground" : "text-foreground"
                        )}>
                          {step.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link 
                            to={step.href} 
                            className={cn(
                              "transition-colors",
                              isDark ? "hover:text-secondary" : "hover:text-primary"
                            )}
                          >
                            {step.label}
                          </Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right Fade Indicator */}
          <div className={cn(
            "absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-300 sm:hidden",
            showRightFade ? "opacity-100" : "opacity-0"
          )} />
        </div>
      )}
    </>
  );
}
