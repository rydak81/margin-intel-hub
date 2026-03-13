-- ============================================================================
-- Community Forum Tables for Margin Intel Hub
-- ============================================================================

-- Community Users Table (for forum members)
CREATE TABLE IF NOT EXISTS public.community_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('brand_seller', 'agency', 'saas_tech', 'service_provider', 'investor')),
  company TEXT,
  bio TEXT CHECK (char_length(bio) <= 200),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  reputation_score INTEGER DEFAULT 0,
  post_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_admin BOOLEAN DEFAULT FALSE,
  avatar_url TEXT
);

-- Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES public.community_users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'announcements',
    'general',
    'amazon',
    'other-marketplaces',
    'profitability',
    'advertising',
    'logistics',
    'tools',
    'reviews',
    'deals',
    'wins',
    'help'
  )),
  post_type TEXT NOT NULL DEFAULT 'discussion' CHECK (post_type IN (
    'question',
    'discussion',
    'deal',
    'case_study',
    'resource'
  )),
  platform_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  reply_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT TRUE,
  is_reported BOOLEAN DEFAULT FALSE,
  view_count INTEGER DEFAULT 0,
  -- Special fields for Deals & Partnerships posts
  deal_type TEXT CHECK (deal_type IN (
    'partnership',
    'service_needed',
    'service_offered',
    'business_for_sale',
    'jv_opportunity'
  )),
  looking_for TEXT[] DEFAULT '{}',
  contact_method TEXT
);

-- Replies Table
CREATE TABLE IF NOT EXISTS public.replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_id UUID REFERENCES public.community_users(id) ON DELETE SET NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE
);

-- Votes Table (to track who voted on what)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.community_users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT vote_target CHECK (
    (post_id IS NOT NULL AND reply_id IS NULL) OR 
    (post_id IS NULL AND reply_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, reply_id)
);

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.community_users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Reports Table (for moderation)
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.community_users(id) ON DELETE SET NULL,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES public.replies(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES public.community_users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_posts_category ON public.posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_upvotes ON public.posts(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_posts_approved ON public.posts(is_approved);
CREATE INDEX IF NOT EXISTS idx_replies_post ON public.replies(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_created ON public.replies(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_user ON public.votes(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_users_email ON public.community_users(email);

-- Enable Row Level Security
ALTER TABLE public.community_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_users
CREATE POLICY "Anyone can view community users" ON public.community_users
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create community user" ON public.community_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own profile" ON public.community_users
  FOR UPDATE USING (true);

-- RLS Policies for posts
CREATE POLICY "Anyone can view approved posts" ON public.posts
  FOR SELECT USING (is_approved = true OR author_id IS NOT NULL);

CREATE POLICY "Anyone can create posts" ON public.posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authors can update their posts" ON public.posts
  FOR UPDATE USING (true);

CREATE POLICY "Authors can delete their posts" ON public.posts
  FOR DELETE USING (true);

-- RLS Policies for replies
CREATE POLICY "Anyone can view replies" ON public.replies
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create replies" ON public.replies
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authors can update their replies" ON public.replies
  FOR UPDATE USING (true);

CREATE POLICY "Authors can delete their replies" ON public.replies
  FOR DELETE USING (true);

-- RLS Policies for votes
CREATE POLICY "Anyone can view votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Users can create votes" ON public.votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their votes" ON public.votes
  FOR DELETE USING (true);

-- RLS Policies for bookmarks
CREATE POLICY "Users can view their bookmarks" ON public.bookmarks
  FOR SELECT USING (true);

CREATE POLICY "Users can create bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their bookmarks" ON public.bookmarks
  FOR DELETE USING (true);

-- RLS Policies for reports
CREATE POLICY "Anyone can create reports" ON public.reports
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view reports" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (true);

-- Function to update post reply count
CREATE OR REPLACE FUNCTION update_post_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET reply_count = reply_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET reply_count = reply_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reply count
DROP TRIGGER IF EXISTS trigger_update_reply_count ON public.replies;
CREATE TRIGGER trigger_update_reply_count
  AFTER INSERT OR DELETE ON public.replies
  FOR EACH ROW EXECUTE FUNCTION update_post_reply_count();

-- Function to update user reputation and post count
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF TG_TABLE_NAME = 'posts' THEN
      UPDATE public.community_users SET post_count = post_count + 1 WHERE id = NEW.author_id;
    ELSIF TG_TABLE_NAME = 'votes' AND NEW.vote_type = 'up' THEN
      -- Give reputation to the content author
      IF NEW.post_id IS NOT NULL THEN
        UPDATE public.community_users SET reputation_score = reputation_score + 1 
        WHERE id = (SELECT author_id FROM public.posts WHERE id = NEW.post_id);
      ELSIF NEW.reply_id IS NOT NULL THEN
        UPDATE public.community_users SET reputation_score = reputation_score + 1 
        WHERE id = (SELECT author_id FROM public.replies WHERE id = NEW.reply_id);
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'posts' THEN
      UPDATE public.community_users SET post_count = post_count - 1 WHERE id = OLD.author_id;
    ELSIF TG_TABLE_NAME = 'votes' AND OLD.vote_type = 'up' THEN
      IF OLD.post_id IS NOT NULL THEN
        UPDATE public.community_users SET reputation_score = reputation_score - 1 
        WHERE id = (SELECT author_id FROM public.posts WHERE id = OLD.post_id);
      ELSIF OLD.reply_id IS NOT NULL THEN
        UPDATE public.community_users SET reputation_score = reputation_score - 1 
        WHERE id = (SELECT author_id FROM public.replies WHERE id = OLD.reply_id);
      END IF;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers for user stats
DROP TRIGGER IF EXISTS trigger_update_user_posts ON public.posts;
CREATE TRIGGER trigger_update_user_posts
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

DROP TRIGGER IF EXISTS trigger_update_user_reputation ON public.votes;
CREATE TRIGGER trigger_update_user_reputation
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();
