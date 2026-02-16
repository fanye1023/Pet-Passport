-- Calendar Feed Tokens Migration
-- Implements ICS/iCal feed subscription for calendar apps

-- ============================================
-- NEW TABLE: calendar_feed_tokens
-- ============================================

CREATE TABLE IF NOT EXISTS calendar_feed_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  name TEXT,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,  -- NULL = all pets
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_accessed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_calendar_feed_tokens_token ON calendar_feed_tokens(token);
CREATE INDEX IF NOT EXISTS idx_calendar_feed_tokens_user_id ON calendar_feed_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_feed_tokens_pet_id ON calendar_feed_tokens(pet_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE calendar_feed_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own calendar feed tokens
CREATE POLICY "Users can view own calendar feed tokens" ON calendar_feed_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own calendar feed tokens
CREATE POLICY "Users can insert own calendar feed tokens" ON calendar_feed_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own calendar feed tokens
CREATE POLICY "Users can update own calendar feed tokens" ON calendar_feed_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own calendar feed tokens
CREATE POLICY "Users can delete own calendar feed tokens" ON calendar_feed_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECURITY DEFINER FUNCTION: Get feed data by token
-- Used by the public API endpoint (no auth required)
-- ============================================

CREATE OR REPLACE FUNCTION get_calendar_feed_data(feed_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  token_record RECORD;
  result JSON;
  pet_ids UUID[];
BEGIN
  -- Find and validate the token
  SELECT * INTO token_record
  FROM calendar_feed_tokens
  WHERE token = feed_token
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Update last_accessed_at
  UPDATE calendar_feed_tokens
  SET last_accessed_at = NOW()
  WHERE id = token_record.id;

  -- Determine which pets to include
  IF token_record.pet_id IS NOT NULL THEN
    -- Single pet feed
    pet_ids := ARRAY[token_record.pet_id];
  ELSE
    -- All pets the user has access to
    SELECT array_agg(DISTINCT pet_id) INTO pet_ids
    FROM (
      -- Pets user owns
      SELECT id as pet_id FROM pets WHERE user_id = token_record.user_id
      UNION
      -- Pets user collaborates on
      SELECT pet_id FROM pet_collaborators WHERE user_id = token_record.user_id
    ) accessible_pets;
  END IF;

  -- If no pets, return empty result
  IF pet_ids IS NULL OR array_length(pet_ids, 1) IS NULL THEN
    RETURN json_build_object(
      'token_name', token_record.name,
      'pets', '[]'::json,
      'care_events', '[]'::json,
      'vaccination_records', '[]'::json
    );
  END IF;

  -- Build the result with all necessary data
  SELECT json_build_object(
    'token_name', token_record.name,
    'pets', (
      SELECT COALESCE(json_agg(row_to_json(p)), '[]'::json)
      FROM pets p
      WHERE p.id = ANY(pet_ids)
    ),
    'care_events', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', ce.id,
          'pet_id', ce.pet_id,
          'pet_name', p.name,
          'event_type', ce.event_type,
          'title', ce.title,
          'description', ce.description,
          'event_date', ce.event_date,
          'event_time', ce.event_time,
          'is_recurring', ce.is_recurring,
          'recurrence_pattern', ce.recurrence_pattern,
          'recurrence_day_of_month', ce.recurrence_day_of_month,
          'recurrence_day_of_week', ce.recurrence_day_of_week,
          'recurrence_start_date', ce.recurrence_start_date,
          'recurrence_end_date', ce.recurrence_end_date,
          'location', ce.location,
          'notes', ce.notes
        )
      ), '[]'::json)
      FROM care_events ce
      JOIN pets p ON p.id = ce.pet_id
      WHERE ce.pet_id = ANY(pet_ids)
    ),
    'vaccination_records', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'id', vr.id,
          'pet_id', vr.pet_id,
          'pet_name', p.name,
          'vaccine_name', vr.vaccine_name,
          'expiration_date', vr.expiration_date,
          'notes', vr.notes
        )
      ), '[]'::json)
      FROM vaccination_records vr
      JOIN pets p ON p.id = vr.pet_id
      WHERE vr.pet_id = ANY(pet_ids)
        AND vr.expiration_date IS NOT NULL
    )
  ) INTO result;

  RETURN result;
END;
$$;

-- ============================================
-- ACTIVITY LOGGING
-- ============================================

CREATE OR REPLACE FUNCTION log_calendar_feed_token_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Only log if user has access to a pet (for activity log pet_id requirement)
    -- Use the token's pet_id if set, or pick first accessible pet
    DECLARE
      target_pet_id UUID;
    BEGIN
      IF NEW.pet_id IS NOT NULL THEN
        target_pet_id := NEW.pet_id;
      ELSE
        SELECT id INTO target_pet_id FROM pets WHERE user_id = NEW.user_id LIMIT 1;
      END IF;

      IF target_pet_id IS NOT NULL THEN
        INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
        VALUES (target_pet_id, auth.uid(), 'created', 'calendar_feed', NEW.id,
          jsonb_build_object('name', NEW.name, 'pet_specific', NEW.pet_id IS NOT NULL));
      END IF;
    END;
  ELSIF TG_OP = 'DELETE' THEN
    DECLARE
      target_pet_id UUID;
    BEGIN
      IF OLD.pet_id IS NOT NULL THEN
        target_pet_id := OLD.pet_id;
      ELSE
        SELECT id INTO target_pet_id FROM pets WHERE user_id = OLD.user_id LIMIT 1;
      END IF;

      IF target_pet_id IS NOT NULL THEN
        INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
        VALUES (target_pet_id, auth.uid(), 'deleted', 'calendar_feed', OLD.id,
          jsonb_build_object('name', OLD.name));
      END IF;
    END;
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_calendar_feed_token_changes
  AFTER INSERT OR DELETE ON calendar_feed_tokens
  FOR EACH ROW
  EXECUTE FUNCTION log_calendar_feed_token_activity();
