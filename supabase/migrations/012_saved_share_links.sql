-- Saved Share Links (Caretaker Bookmarks)
-- Allows users to save share links to their account for easy access

CREATE TABLE saved_share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  share_link_id UUID NOT NULL REFERENCES share_links(id) ON DELETE CASCADE,
  custom_name TEXT, -- optional custom name for the bookmark
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ,
  UNIQUE(user_id, share_link_id)
);

-- Index for fast lookups by user
CREATE INDEX idx_saved_share_links_user_id ON saved_share_links(user_id);

-- RLS Policies
ALTER TABLE saved_share_links ENABLE ROW LEVEL SECURITY;

-- Users can view their own saved links
CREATE POLICY "Users can view own saved links"
  ON saved_share_links FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own saved links
CREATE POLICY "Users can save links"
  ON saved_share_links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own saved links
CREATE POLICY "Users can update own saved links"
  ON saved_share_links FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own saved links
CREATE POLICY "Users can delete own saved links"
  ON saved_share_links FOR DELETE
  USING (auth.uid() = user_id);

-- Function to save a share link to user's account
CREATE OR REPLACE FUNCTION save_share_link(
  p_share_token TEXT,
  p_custom_name TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_share_link_id UUID;
  v_pet_name TEXT;
  v_result JSON;
BEGIN
  -- Get current user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  -- Find the share link and verify it's active
  SELECT sl.id, p.name INTO v_share_link_id, v_pet_name
  FROM share_links sl
  JOIN pets p ON sl.pet_id = p.id
  WHERE sl.token = p_share_token
    AND sl.is_active = true
    AND (sl.expires_at IS NULL OR sl.expires_at > NOW());

  IF v_share_link_id IS NULL THEN
    RETURN json_build_object('error', 'Share link not found or expired');
  END IF;

  -- Insert or update the saved link
  INSERT INTO saved_share_links (user_id, share_link_id, custom_name, saved_at)
  VALUES (v_user_id, v_share_link_id, COALESCE(p_custom_name, v_pet_name), NOW())
  ON CONFLICT (user_id, share_link_id)
  DO UPDATE SET
    custom_name = COALESCE(EXCLUDED.custom_name, saved_share_links.custom_name),
    saved_at = NOW();

  RETURN json_build_object(
    'success', true,
    'pet_name', v_pet_name
  );
END;
$$;

-- Function to get saved share links with pet details
CREATE OR REPLACE FUNCTION get_saved_share_links()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('error', 'Not authenticated');
  END IF;

  SELECT json_agg(
    json_build_object(
      'id', ssl.id,
      'custom_name', ssl.custom_name,
      'saved_at', ssl.saved_at,
      'last_accessed_at', ssl.last_accessed_at,
      'share_token', sl.token,
      'is_active', sl.is_active AND (sl.expires_at IS NULL OR sl.expires_at > NOW()),
      'pet', json_build_object(
        'name', p.name,
        'species', p.species,
        'breed', p.breed,
        'photo_url', p.photo_url
      )
    )
    ORDER BY ssl.saved_at DESC
  )
  INTO v_result
  FROM saved_share_links ssl
  JOIN share_links sl ON ssl.share_link_id = sl.id
  JOIN pets p ON sl.pet_id = p.id
  WHERE ssl.user_id = v_user_id;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Function to remove a saved share link
CREATE OR REPLACE FUNCTION remove_saved_share_link(p_saved_link_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM saved_share_links
  WHERE id = p_saved_link_id AND user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Saved link not found');
  END IF;

  RETURN json_build_object('success', true);
END;
$$;

-- Function to update last accessed time
CREATE OR REPLACE FUNCTION update_saved_link_accessed(p_share_token TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE saved_share_links ssl
  SET last_accessed_at = NOW()
  FROM share_links sl
  WHERE ssl.share_link_id = sl.id
    AND sl.token = p_share_token
    AND ssl.user_id = auth.uid();
END;
$$;
