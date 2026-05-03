import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function roundSignal(count: number): number {
  if (count <= 3) return count;
  if (count <= 9) return Math.floor(count / 5) * 5;
  if (count < 100) return Math.floor(count / 10) * 10;
  return Math.floor(count / 50) * 50;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const product_id = body.product_id;

    if (!product_id) {
      return new Response(JSON.stringify({ error: "Missing product_id" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const last5m = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // Run parallel count_distinct_visitors RPC calls
    const [views24h, carts24h, purchases24h, activeViewers] = await Promise.all([
      supabaseClient.rpc("count_distinct_visitors", { p_product_id: product_id, p_event_type: "product_view", p_since: last24h }),
      supabaseClient.rpc("count_distinct_visitors", { p_product_id: product_id, p_event_type: "add_to_cart", p_since: last24h }),
      supabaseClient.rpc("count_distinct_visitors", { p_product_id: product_id, p_event_type: "purchase", p_since: last24h }),
      supabaseClient.rpc("count_distinct_visitors", { p_product_id: product_id, p_event_type: "product_view", p_since: last5m }),
    ]);

    const rawMetrics = {
      views_24h: views24h.data || 0,
      carts_24h: carts24h.data || 0,
      purchases_24h: purchases24h.data || 0,
      active_viewers: activeViewers.data || 0,
    };

    // Upsert the result into product_metrics (cache)
    await supabaseClient
      .from("product_metrics")
      .upsert({
        product_id,
        ...rawMetrics,
        updated_at: new Date().toISOString()
      }, { onConflict: "product_id" });

    // Apply rounding for social proof
    const displayMetrics = {
      views_24h: roundSignal(rawMetrics.views_24h),
      carts_24h: roundSignal(rawMetrics.carts_24h),
      purchases_24h: roundSignal(rawMetrics.purchases_24h),
      active_viewers: rawMetrics.active_viewers, // Active viewers are usually kept exact unless very high, but can apply rounding if desired.
    };

    return new Response(JSON.stringify({ raw: rawMetrics, display: displayMetrics }), { 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
