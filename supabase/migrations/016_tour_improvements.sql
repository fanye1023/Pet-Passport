-- Migration: Tour system improvements

-- Add columns to feature_tours for enhanced tracking
ALTER TABLE feature_tours
  ADD COLUMN IF NOT EXISTS never_show_again BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS last_step_viewed INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- Tour analytics table for detailed tracking
CREATE TABLE IF NOT EXISTS tour_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tour_id TEXT NOT NULL,
  step_id TEXT NOT NULL,
  step_index INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'view', 'next', 'prev', 'skip', 'complete', 'click_target'
  timestamp TIMESTAMPTZ DEFAULT now(),
  time_on_step_ms INTEGER,
  session_id UUID
);

ALTER TABLE tour_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own analytics"
  ON tour_analytics FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tour_analytics_tour
  ON tour_analytics(tour_id, step_index);

CREATE INDEX IF NOT EXISTS idx_tour_analytics_user
  ON tour_analytics(user_id, tour_id);

-- Feature usage tracking for progressive disclosure
CREATE TABLE IF NOT EXISTS feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_id TEXT NOT NULL,
  first_used_at TIMESTAMPTZ DEFAULT now(),
  use_count INTEGER DEFAULT 1,
  UNIQUE(user_id, feature_id)
);

ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own feature usage"
  ON feature_usage FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature
  ON feature_usage(user_id, feature_id);
