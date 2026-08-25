-- Lead enrichment context for tool-driven signups.
--
-- The fee calculator captures far more than an email: the marketplace, category,
-- price point, and computed margin a visitor typed in before unlocking their
-- results. That payload is what makes a lead routable to the right referral
-- partner, so it is stored alongside the subscriber rather than discarded.

ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS context JSONB,
  ADD COLUMN IF NOT EXISTS primary_marketplace TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- `source` already exists and is set per capture surface (e.g.
-- 'fee-gate:fees/amazon/kitchen'). Indexing it lets us answer "which SEO pages
-- actually produce qualified leads" without a full scan.
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON public.subscribers(source);

-- Role is the routing key for referral partner handoff.
CREATE INDEX IF NOT EXISTS idx_subscribers_role ON public.subscribers(role);

-- GIN index so we can filter on enrichment fields, e.g. everyone who modelled
-- a Home & Garden product on Walmart.
CREATE INDEX IF NOT EXISTS idx_subscribers_context ON public.subscribers USING GIN (context);

-- No UPDATE policy is created: the two-step gate's enrichment update runs
-- through the admin client (service role), which bypasses RLS entirely. A
-- permissive UPDATE policy without a TO clause would apply to PUBLIC and let
-- browser clients rewrite subscriber rows — so its absence is the security
-- posture, not an omission.
DROP POLICY IF EXISTS "Allow service role to update" ON public.subscribers;
