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
        <div className={cn("mb-6", className)}>
          <Breadcrumb>
            <BreadcrumbList className={cn(
              isDark ? "text-primary-foreground/60" : "text-muted-foreground"
            )}>
              <BreadcrumbItem>
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
                <div key={index} className="flex items-center gap-1.5 sm:gap-2.5">
                  <BreadcrumbSeparator className={isDark ? "text-primary-foreground/40" : ""}>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </BreadcrumbSeparator>
                  <BreadcrumbItem>
                    {step.active || !step.href ? (
                      <BreadcrumbPage className={cn(
                        "max-w-[150px] truncate md:max-w-none",
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
                </div>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      )}
    </>
  );
}
