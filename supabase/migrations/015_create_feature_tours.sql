-- Migration: Create feature_tours table to track tour completion per user

CREATE TABLE feature_tours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tour_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, tour_id)
);

-- Enable Row Level Security
ALTER TABLE feature_tours ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own tour progress
CREATE POLICY "Users can manage own tour progress"
  ON feature_tours FOR ALL USING (auth.uid() = user_id);

-- Add index for faster lookups
CREATE INDEX idx_feature_tours_user_tour ON feature_tours(user_id, tour_id);
