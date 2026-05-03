import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProductSignals {
  views24h: number;
  carts24h: number;
  activeViewers: number;
}

export function useProductSignals(productId: string) {
  const [signals, setSignals] = useState<ProductSignals | null>(null);

  useEffect(() => {
    if (!productId) return;

    let mounted = true;

    const fetchSignals = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('product-signals', {
          method: 'GET',
          query: { product_id: productId }
        });

        if (error) throw error;

        if (mounted && data?.display) {
          setSignals({
            views24h: data.display.views_24h || 0,
            carts24h: data.display.carts_24h || 0,
            activeViewers: data.display.active_viewers || 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch product signals', err);
      }
    };

    fetchSignals();

    // Poll every 60 seconds
    const interval = setInterval(fetchSignals, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [productId]);

  return signals;
}
