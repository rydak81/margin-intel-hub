-- New news_sources rows (verified 2026-10-17 from the box: each feed returned items dated within the last 30 days).
-- NOT executed. Additive only: ON CONFLICT DO NOTHING, and skips any feed_url already present.
-- Run in the Supabase SQL editor after the fix branch is merged (concurrent stalest-first fetching
-- is what lets ~90 sources fit in the 60s aggregate run).

INSERT INTO public.news_sources (name, slug, source_type, url, feed_url, category, platform, is_active, priority_score, fetch_frequency_minutes, metadata)
SELECT v.name, v.slug, 'rss', v.url, v.feed_url, v.category, v.platform, true, v.priority_score, 120, v.metadata
FROM (VALUES
  ('eBay Inc. News', 'ebay-inc-news', 'https://www.ebayinc.com/stories/news/', 'https://www.ebayinc.com/stories/news/rss/', 'ecommerce', ARRAY['ebay']::text[], 86, '{"lane":"official_platform","added":"2026-10-17","note":"replaces eBay Seller Center Blog (community moved, 0 items)"}'::jsonb),
  ('Google News - Retail TouchPoints', 'gn-retail-touchpoints', 'https://www.retailtouchpoints.com', 'https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=site:retailtouchpoints.com+when:30d', 'ecommerce', ARRAY['general']::text[], 70, '{"lane":"industry_context","added":"2026-10-17","note":"replaces direct feed (403 to bots)"}'::jsonb),
  ('Google News - Search Engine Land (commerce)', 'gn-search-engine-land-commerce', 'https://searchengineland.com', 'https://news.google.com/rss/search?hl=en-US&gl=US&ceid=US:en&q=site:searchengineland.com+(shopping+OR+amazon+OR+%22retail+media%22)+when:30d', 'advertising', ARRAY['amazon', 'general']::text[], 72, '{"lane":"growth","added":"2026-10-17","note":"direct feed 403 to bots"}'::jsonb),
  ('Marketplace Universe', 'marketplace-universe', 'https://marketplace-universe.com', 'https://marketplace-universe.com/feed/', 'ecommerce', ARRAY['amazon', 'general']::text[], 78, '{"lane":"analyst_intelligence","added":"2026-10-17","note":"EU/global marketplace news"}'::jsonb),
  ('Ecommerce News Europe', 'ecommerce-news-eu', 'https://ecommercenews.eu', 'https://ecommercenews.eu/feed/', 'ecommerce', ARRAY['amazon', 'general']::text[], 70, '{"lane":"industry_context","added":"2026-10-17"}'::jsonb),
  ('RetailDetail EU', 'retaildetail-eu', 'https://www.retaildetail.eu', 'https://www.retaildetail.eu/feed/', 'ecommerce', ARRAY['general']::text[], 62, '{"lane":"industry_context","added":"2026-10-17","note":"high volume (~30/day)"}'::jsonb),
  ('PYMNTS - eCommerce', 'pymnts-ecommerce', 'https://www.pymnts.com/category/commerce/ecommerce/', 'https://www.pymnts.com/category/commerce/ecommerce/feed/', 'ecommerce', ARRAY['amazon', 'walmart', 'shopify', 'general']::text[], 72, '{"lane":"payments_commerce","added":"2026-10-17"}'::jsonb),
  ('Supply Chain Dive', 'supply-chain-dive', 'https://www.supplychaindive.com', 'https://www.supplychaindive.com/feeds/news/', 'logistics', ARRAY['general']::text[], 80, '{"lane":"logistics","added":"2026-10-17"}'::jsonb),
  ('The Loadstar', 'the-loadstar', 'https://theloadstar.com', 'https://theloadstar.com/feed/', 'logistics', ARRAY['general']::text[], 76, '{"lane":"logistics","added":"2026-10-17","note":"freight forwarding, air/ocean"}'::jsonb),
  ('DC Velocity', 'dc-velocity', 'https://www.dcvelocity.com', 'https://www.dcvelocity.com/feeds/article.rss', 'logistics', ARRAY['general']::text[], 72, '{"lane":"logistics","added":"2026-10-17","note":"warehousing/fulfillment"}'::jsonb),
  ('Post & Parcel', 'post-and-parcel', 'https://postandparcel.info', 'https://postandparcel.info/feed/', 'logistics', ARRAY['general']::text[], 74, '{"lane":"logistics","added":"2026-10-17","note":"parcel carriers, USPS/UPS/FedEx rates"}'::jsonb),
  ('FreightCaviar', 'freightcaviar', 'https://www.freightcaviar.com', 'https://www.freightcaviar.com/rss', 'logistics', ARRAY['general']::text[], 68, '{"lane":"logistics","added":"2026-10-17","note":"trucking/freight fraud"}'::jsonb),
  ('Freightos Blog (FBX rates)', 'freightos-blog', 'https://www.freightos.com/blog/', 'https://www.freightos.com/feed/', 'logistics', ARRAY['general']::text[], 74, '{"lane":"logistics","added":"2026-10-17","note":"weekly ocean/air rate updates"}'::jsonb),
  ('DAT Freight & Analytics Blog', 'dat-blog', 'https://www.dat.com/blog', 'https://www.dat.com/blog/feed', 'logistics', ARRAY['general']::text[], 70, '{"lane":"logistics","added":"2026-10-17","note":"truckload rate trends"}'::jsonb),
  ('Air Cargo News', 'air-cargo-news', 'https://www.aircargonews.net', 'https://www.aircargonews.net/feed/', 'logistics', ARRAY['general']::text[], 66, '{"lane":"logistics","added":"2026-10-17","note":"cross-border ecommerce air freight"}'::jsonb),
  ('Journal of Commerce (JOC)', 'joc', 'https://www.joc.com', 'https://www.joc.com/rssfeed', 'logistics', ARRAY['general']::text[], 72, '{"lane":"logistics","added":"2026-10-17","note":"many articles paywalled; RSS gives headline+summary"}'::jsonb),
  ('Digiday', 'digiday', 'https://digiday.com', 'https://digiday.com/feed/', 'advertising', ARRAY['amazon', 'walmart', 'general']::text[], 74, '{"lane":"growth","added":"2026-10-17","note":"metered paywall"}'::jsonb),
  ('AdExchanger', 'adexchanger', 'https://www.adexchanger.com', 'https://www.adexchanger.com/feed/', 'advertising', ARRAY['amazon', 'walmart', 'general']::text[], 78, '{"lane":"growth","added":"2026-10-17","note":"retail media / commerce media"}'::jsonb),
  ('PPC Land', 'ppc-land', 'https://ppc.land', 'https://ppc.land/rss/', 'advertising', ARRAY['amazon', 'general']::text[], 76, '{"lane":"growth","added":"2026-10-17","note":"Google/Amazon/Meta ads platform changes; high volume"}'::jsonb),
  ('Google Ads & Commerce Blog', 'google-ads-commerce-blog', 'https://blog.google/products/ads-commerce/', 'https://blog.google/products/ads-commerce/rss/', 'advertising', ARRAY['general']::text[], 80, '{"lane":"official_platform","added":"2026-10-17","note":"Google Shopping / Merchant Center"}'::jsonb),
  ('Meta Newsroom', 'meta-newsroom', 'https://about.fb.com/news/', 'https://about.fb.com/feed/', 'advertising', ARRAY['general']::text[], 66, '{"lane":"official_platform","added":"2026-10-17","note":"Meta ads/commerce announcements; broad"}'::jsonb),
  ('Marketing Dive', 'marketing-dive', 'https://www.marketingdive.com', 'https://www.marketingdive.com/feeds/news/', 'advertising', ARRAY['general']::text[], 62, '{"lane":"growth","added":"2026-10-17"}'::jsonb),
  ('Retail Media Breakfast Club', 'retail-media-breakfast-club', 'https://retailmediabreakfastclub.substack.com', 'https://retailmediabreakfastclub.substack.com/feed', 'advertising', ARRAY['amazon', 'walmart', 'target']::text[], 70, '{"lane":"analyst_intelligence","added":"2026-10-17","note":"Kiri Masters; retail media analysis"}'::jsonb),
  ('Payments Dive', 'payments-dive', 'https://www.paymentsdive.com', 'https://www.paymentsdive.com/feeds/news/', 'profitability', ARRAY['general']::text[], 72, '{"lane":"payments_commerce","added":"2026-10-17"}'::jsonb),
  ('Stripe Blog', 'stripe-blog', 'https://stripe.com/blog', 'https://stripe.com/blog/feed.rss', 'tools', ARRAY['shopify', 'general']::text[], 68, '{"lane":"payments_commerce","added":"2026-10-17"}'::jsonb),
  ('PayPal Newsroom', 'paypal-newsroom', 'https://newsroom.paypal-corp.com', 'https://newsroom.paypal-corp.com/news?pagetemplate=rss', 'profitability', ARRAY['ebay', 'general']::text[], 64, '{"lane":"payments_commerce","added":"2026-10-17","note":"low volume"}'::jsonb)
) AS v(name, slug, url, feed_url, category, platform, priority_score, metadata)
WHERE NOT EXISTS (SELECT 1 FROM public.news_sources s WHERE s.feed_url = v.feed_url)
ON CONFLICT (slug) DO NOTHING;

-- Deactivate dead DB-only feeds (sets is_active = false; deletes nothing, keeps their articles).
-- Feeds that live in DEFAULT_RSS_SOURCES are retired in code instead, since the aggregate run re-syncs them.
UPDATE public.news_sources SET is_active = false,
  metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('retired', '2026-10-17', 'retired_reason', 'dead feed (see PR)')
WHERE feed_url IN (
  'https://www.shopify.com/blogs/news.atom',          -- Shopify Blog (Atom): 404
  'https://www.webretailer.com/feed/',                -- WebRetailer: 404, no feed on site
  'https://carbon6.io/blog/feed/',                    -- Carbon6 Blog: 404, no feed on site
  'https://www.retailtouchpoints.com/feed',           -- Retail TouchPoints: 403 to bots (replaced by gn-retail-touchpoints)
  'https://community.ebay.com/t5/Announcements/bg-p/Announcements/rss-board', -- eBay Seller Center Blog: 0 items (replaced by ebay-inc-news)
  'https://www.helium10.com/blog/feed/',              -- Helium 10 Blog: times out
  'https://www.junglescout.com/blog/feed/'            -- Jungle Scout Blog: newest item Mar 2024
);

-- Check afterwards:
-- SELECT is_active, count(*) FROM public.news_sources GROUP BY 1;
