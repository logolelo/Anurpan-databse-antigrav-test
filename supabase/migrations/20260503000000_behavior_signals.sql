-- Create raw event log table
CREATE TABLE IF NOT EXISTS behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT NOT NULL CHECK (event_type IN ('product_view', 'add_to_cart', 'purchase')),
  product_id TEXT NOT NULL,
  visitor_id UUID NOT NULL,
  customer_id TEXT,
  session_id UUID NOT NULL,
  city TEXT
);

-- Index for fast queries
CREATE INDEX IF NOT EXISTS idx_behavior_events_product_event_created 
ON behavior_events(product_id, event_type, created_at);

CREATE INDEX IF NOT EXISTS idx_behavior_events_visitor_id 
ON behavior_events(visitor_id);

-- Create cached metrics table
CREATE TABLE IF NOT EXISTS product_metrics (
  product_id TEXT PRIMARY KEY,
  views_24h INT NOT NULL DEFAULT 0,
  carts_24h INT NOT NULL DEFAULT 0,
  purchases_24h INT NOT NULL DEFAULT 0,
  active_viewers INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Set up Row Level Security
ALTER TABLE behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_metrics ENABLE ROW LEVEL SECURITY;

-- Product metrics are publicly readable
CREATE POLICY "Public read access to product_metrics" 
ON product_metrics FOR SELECT USING (true);

-- No public write access. Only service_role (Edge Functions) can insert/update.
-- behavior_events has NO public policies because clients use Edge Functions to write.

-- Postgres function for fast distinct counts
CREATE OR REPLACE FUNCTION count_distinct_visitors(
  p_product_id TEXT, 
  p_event_type TEXT, 
  p_since TIMESTAMPTZ
) RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT COALESCE(COUNT(DISTINCT visitor_id)::int, 0)
  FROM behavior_events
  WHERE product_id = p_product_id
    AND event_type = p_event_type
    AND created_at >= p_since;
$$;
