import { useProductSignals } from '@/hooks/useProductSignals';
import { Eye, ShoppingCart, Users } from 'lucide-react';

export const ProductSignals = ({ productId }: { productId: string }) => {
  const signals = useProductSignals(productId);

  if (!signals) return null;

  const displaySignals = [];

  // Priority 1: Active viewers
  if (signals.activeViewers > 0) {
    displaySignals.push(
      <div key="active" className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full font-medium">
        <Users className="w-4 h-4 animate-pulse" />
        {signals.activeViewers} {signals.activeViewers === 1 ? 'person viewing right now' : 'people viewing right now'}
      </div>
    );
  }

  // Priority 2: Added to cart today
  if (signals.carts24h > 0 && displaySignals.length < 2) {
    displaySignals.push(
      <div key="carts" className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 dark:bg-blue-950/30 px-3 py-1.5 rounded-full font-medium">
        <ShoppingCart className="w-4 h-4" />
        {signals.carts24h}+ added to cart today
      </div>
    );
  }

  // Priority 3: Views in 24h
  if (signals.views24h >= 3 && displaySignals.length < 2) {
    displaySignals.push(
      <div key="views" className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium">
        <Eye className="w-4 h-4" />
        {signals.views24h}+ people viewed this in 24h
      </div>
    );
  }

  if (displaySignals.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 mt-4 mb-2">
      {displaySignals}
    </div>
  );
};
