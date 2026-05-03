import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    const { action, event_type, product_id, visitor_id, session_id, customer_id, city } = body;

    // Handle Identity Merge
    if (action === "merge") {
      if (!visitor_id || !customer_id) {
        return new Response(JSON.stringify({ error: "Missing identity fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      
      const { error } = await supabaseClient
        .from("behavior_events")
        .update({ customer_id })
        .eq("visitor_id", visitor_id)
        .is("customer_id", null);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Handle Event Tracking
    if (!event_type || !product_id || !visitor_id || !session_id) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Server-side Throttle: reject if same visitor fired same event for same product within last 30s
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000).toISOString();
    const { count: throttleCount } = await supabaseClient
      .from("behavior_events")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", visitor_id)
      .eq("product_id", product_id)
      .eq("event_type", event_type)
      .gte("created_at", thirtySecondsAgo);

    if (throttleCount && throttleCount > 0) {
      return new Response(JSON.stringify({ success: false, reason: "throttled" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Bot filter: blocks visitor if they fired 10+ events in last 10s
    const tenSecondsAgo = new Date(Date.now() - 10 * 1000).toISOString();
    const { count: botCount } = await supabaseClient
      .from("behavior_events")
      .select("id", { count: "exact", head: true })
      .eq("visitor_id", visitor_id)
      .gte("created_at", tenSecondsAgo);

    if (botCount && botCount >= 10) {
      return new Response(JSON.stringify({ success: false, reason: "bot_detected" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Insert event
    const { error: insertError } = await supabaseClient
      .from("behavior_events")
      .insert([
        {
          event_type,
          product_id,
          visitor_id,
          session_id,
          customer_id,
          city,
        },
      ]);

    if (insertError) throw insertError;

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
