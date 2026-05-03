import { useProductSignals } from '@/hooks/useProductSignals';
import { Eye, ShoppingCart, Users, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ProductSignals = ({ productId, className }: { productId: string; className?: string }) => {
  const signals = useProductSignals(productId);

  if (!signals) return null;

  const displaySignals = [];

  // Priority 1: Active viewers
  if (signals.activeViewers > 0) {
    displaySignals.push(
      <div 
        key="active" 
        className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-700 bg-amber-50/50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 px-2.5 py-1 rounded-full font-medium transition-all hover:bg-amber-100/50 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        {signals.activeViewers} {signals.activeViewers === 1 ? 'person viewing right now' : 'people viewing right now'}
      </div>
    );
  }

  // Priority 2: Added to cart today
  if (signals.carts24h > 0 && displaySignals.length < 2) {
    displaySignals.push(
      <div 
        key="carts" 
        className="flex items-center gap-1.5 text-[11px] sm:text-xs text-blue-700 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 px-2.5 py-1 rounded-full font-medium transition-all hover:bg-blue-100/50 animate-in fade-in slide-in-from-bottom-2 duration-700 fill-mode-both"
      >
        <Flame className="w-3.5 h-3.5 text-blue-500" />
        {signals.carts24h}+ added to cart today
      </div>
    );
  }

  // Priority 3: Views in 24h
  if (signals.views24h >= 3 && displaySignals.length < 2) {
    displaySignals.push(
      <div 
        key="views" 
        className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-700 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-full font-medium transition-all hover:bg-slate-100/50 animate-in fade-in slide-in-from-bottom-2 duration-1000 fill-mode-both"
      >
        <Eye className="w-3.5 h-3.5 text-slate-500" />
        {signals.views24h}+ people viewed this in 24h
      </div>
    );
  }

  const hasSignals = displaySignals.length > 0;

  return (
    <div className={cn(
      "grid transition-all duration-500 ease-in-out",
      hasSignals ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      className
    )}>
      <div className="overflow-hidden">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          {displaySignals}
        </div>
      </div>
    </div>
  );
};
