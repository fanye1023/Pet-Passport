-- Sitter Info & Share PIN Migration
-- Creates care_instructions and behavioral_notes tables,
-- adds PIN and visibility columns to share_links,
-- updates get_pet_by_share_token RPC, and creates new RPCs

-- ============================================
-- NEW TABLES
-- ============================================

-- Care instructions (one per pet)
CREATE TABLE IF NOT EXISTS care_instructions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL UNIQUE REFERENCES pets(id) ON DELETE CASCADE,
  house_access TEXT,
  food_storage TEXT,
  supplies_location TEXT,
  wifi_and_alarm TEXT,
  other_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_care_instructions_pet_id ON care_instructions(pet_id);

-- Behavioral notes (one per pet)
CREATE TABLE IF NOT EXISTS behavioral_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL UNIQUE REFERENCES pets(id) ON DELETE CASCADE,
  known_commands TEXT,
  fears_and_triggers TEXT,
  socialization TEXT,
  temperament TEXT,
  additional_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavioral_notes_pet_id ON behavioral_notes(pet_id);

-- Auto-update triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER care_instructions_updated_at
  BEFORE UPDATE ON care_instructions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER behavioral_notes_updated_at
  BEFORE UPDATE ON behavioral_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ALTER share_links
-- ============================================

ALTER TABLE share_links ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE share_links ADD COLUMN IF NOT EXISTS show_care_instructions BOOLEAN DEFAULT true;
ALTER TABLE share_links ADD COLUMN IF NOT EXISTS show_behavioral_notes BOOLEAN DEFAULT true;

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE care_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavioral_notes ENABLE ROW LEVEL SECURITY;

-- Care instructions policies
CREATE POLICY "Users can view accessible pet care instructions" ON care_instructions
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

CREATE POLICY "Editors can insert care instructions" ON care_instructions
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can update care instructions" ON care_instructions
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can delete care instructions" ON care_instructions
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Behavioral notes policies
CREATE POLICY "Users can view accessible pet behavioral notes" ON behavioral_notes
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

CREATE POLICY "Editors can insert behavioral notes" ON behavioral_notes
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can update behavioral notes" ON behavioral_notes
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can delete behavioral notes" ON behavioral_notes
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- ============================================
-- UPDATED RPC: get_pet_by_share_token
-- ============================================

CREATE OR REPLACE FUNCTION get_pet_by_share_token(share_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  link_record RECORD;
BEGIN
  -- Find and validate the share link
  SELECT * INTO link_record
  FROM share_links
  WHERE token = share_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- If PIN protected, return early with pin_required flag
  IF link_record.pin_hash IS NOT NULL THEN
    SELECT json_build_object(
      'pin_required', true,
      'pet_name', p.name
    ) INTO result
    FROM pets p
    WHERE p.id = link_record.pet_id;

    RETURN result;
  END IF;

  -- Update view count
  UPDATE share_links
  SET view_count = view_count + 1,
      last_viewed_at = NOW()
  WHERE id = link_record.id;

  -- Get pet profile with conditional sections based on visibility flags
  SELECT json_build_object(
    'pet', row_to_json(p),
    'vaccinations', CASE WHEN link_record.show_vaccinations THEN
      (SELECT COALESCE(json_agg(row_to_json(v)), '[]'::json) FROM vaccination_records v WHERE v.pet_id = p.id)
      ELSE '[]'::json END,
    'health_records', CASE WHEN link_record.show_health_records THEN
      (SELECT COALESCE(json_agg(row_to_json(h)), '[]'::json) FROM health_records h WHERE h.pet_id = p.id)
      ELSE '[]'::json END,
    'insurance', CASE WHEN link_record.show_insurance THEN
      (SELECT row_to_json(i) FROM pet_insurance i WHERE i.pet_id = p.id LIMIT 1)
      ELSE NULL END,
    'veterinarians', CASE WHEN link_record.show_vet_info THEN
      (SELECT COALESCE(json_agg(row_to_json(vet)), '[]'::json) FROM veterinarians vet WHERE vet.pet_id = p.id)
      ELSE '[]'::json END,
    'emergency_contacts', CASE WHEN link_record.show_emergency_contacts THEN
      (SELECT COALESCE(json_agg(row_to_json(ec)), '[]'::json) FROM emergency_contacts ec WHERE ec.pet_id = p.id)
      ELSE '[]'::json END,
    'food_preferences', CASE WHEN link_record.show_food THEN
      (SELECT row_to_json(fp) FROM food_preferences fp WHERE fp.pet_id = p.id LIMIT 1)
      ELSE NULL END,
    'daily_routines', CASE WHEN link_record.show_routines THEN
      (SELECT COALESCE(json_agg(row_to_json(dr)), '[]'::json) FROM daily_routines dr WHERE dr.pet_id = p.id)
      ELSE '[]'::json END,
    'care_instructions', CASE WHEN link_record.show_care_instructions THEN
      (SELECT row_to_json(ci) FROM care_instructions ci WHERE ci.pet_id = p.id)
      ELSE NULL END,
    'behavioral_notes', CASE WHEN link_record.show_behavioral_notes THEN
      (SELECT row_to_json(bn) FROM behavioral_notes bn WHERE bn.pet_id = p.id)
      ELSE NULL END,
    'documents', (SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json) FROM pet_documents d WHERE d.pet_id = p.id),
    'visibility', json_build_object(
      'vaccinations', link_record.show_vaccinations,
      'health_records', link_record.show_health_records,
      'insurance', link_record.show_insurance,
      'vet_info', link_record.show_vet_info,
      'emergency_contacts', link_record.show_emergency_contacts,
      'food', link_record.show_food,
      'routines', link_record.show_routines,
      'care_instructions', link_record.show_care_instructions,
      'behavioral_notes', link_record.show_behavioral_notes
    )
  ) INTO result
  FROM pets p
  WHERE p.id = link_record.pet_id;

  RETURN result;
END;
$$;

-- ============================================
-- NEW RPC: verify_share_pin
-- ============================================

CREATE OR REPLACE FUNCTION verify_share_pin(share_token TEXT, pin TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  link_record RECORD;
BEGIN
  -- Find and validate the share link
  SELECT * INTO link_record
  FROM share_links
  WHERE token = share_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Link not found or expired');
  END IF;

  -- Check PIN
  IF link_record.pin_hash IS NULL THEN
    RETURN json_build_object('error', 'This link does not require a PIN');
  END IF;

  IF link_record.pin_hash != extensions.crypt(pin, link_record.pin_hash) THEN
    RETURN json_build_object('error', 'Incorrect PIN');
  END IF;

  -- PIN is correct — increment view count
  UPDATE share_links
  SET view_count = view_count + 1,
      last_viewed_at = NOW()
  WHERE id = link_record.id;

  -- Return full pet data (same structure as get_pet_by_share_token)
  SELECT json_build_object(
    'pet', row_to_json(p),
    'vaccinations', CASE WHEN link_record.show_vaccinations THEN
      (SELECT COALESCE(json_agg(row_to_json(v)), '[]'::json) FROM vaccination_records v WHERE v.pet_id = p.id)
      ELSE '[]'::json END,
    'health_records', CASE WHEN link_record.show_health_records THEN
      (SELECT COALESCE(json_agg(row_to_json(h)), '[]'::json) FROM health_records h WHERE h.pet_id = p.id)
      ELSE '[]'::json END,
    'insurance', CASE WHEN link_record.show_insurance THEN
      (SELECT row_to_json(i) FROM pet_insurance i WHERE i.pet_id = p.id LIMIT 1)
      ELSE NULL END,
    'veterinarians', CASE WHEN link_record.show_vet_info THEN
      (SELECT COALESCE(json_agg(row_to_json(vet)), '[]'::json) FROM veterinarians vet WHERE vet.pet_id = p.id)
      ELSE '[]'::json END,
    'emergency_contacts', CASE WHEN link_record.show_emergency_contacts THEN
      (SELECT COALESCE(json_agg(row_to_json(ec)), '[]'::json) FROM emergency_contacts ec WHERE ec.pet_id = p.id)
      ELSE '[]'::json END,
    'food_preferences', CASE WHEN link_record.show_food THEN
      (SELECT row_to_json(fp) FROM food_preferences fp WHERE fp.pet_id = p.id LIMIT 1)
      ELSE NULL END,
    'daily_routines', CASE WHEN link_record.show_routines THEN
      (SELECT COALESCE(json_agg(row_to_json(dr)), '[]'::json) FROM daily_routines dr WHERE dr.pet_id = p.id)
      ELSE '[]'::json END,
    'care_instructions', CASE WHEN link_record.show_care_instructions THEN
      (SELECT row_to_json(ci) FROM care_instructions ci WHERE ci.pet_id = p.id)
      ELSE NULL END,
    'behavioral_notes', CASE WHEN link_record.show_behavioral_notes THEN
      (SELECT row_to_json(bn) FROM behavioral_notes bn WHERE bn.pet_id = p.id)
      ELSE NULL END,
    'documents', (SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json) FROM pet_documents d WHERE d.pet_id = p.id),
    'visibility', json_build_object(
      'vaccinations', link_record.show_vaccinations,
      'health_records', link_record.show_health_records,
      'insurance', link_record.show_insurance,
      'vet_info', link_record.show_vet_info,
      'emergency_contacts', link_record.show_emergency_contacts,
      'food', link_record.show_food,
      'routines', link_record.show_routines,
      'care_instructions', link_record.show_care_instructions,
      'behavioral_notes', link_record.show_behavioral_notes
    )
  ) INTO result
  FROM pets p
  WHERE p.id = link_record.pet_id;

  RETURN result;
END;
$$;

-- ============================================
-- NEW RPC: set_share_pin
-- ============================================

CREATE OR REPLACE FUNCTION set_share_pin(link_id UUID, pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  link_pet_id UUID;
BEGIN
  -- Get the pet_id for this share link
  SELECT pet_id INTO link_pet_id
  FROM share_links
  WHERE id = link_id;

  IF link_pet_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check user has editor access
  IF NOT user_has_pet_access(link_pet_id, 'editor') THEN
    RETURN FALSE;
  END IF;

  -- Set or clear the PIN
  IF pin IS NULL OR pin = '' THEN
    UPDATE share_links SET pin_hash = NULL WHERE id = link_id;
  ELSE
    UPDATE share_links
    SET pin_hash = extensions.crypt(pin, extensions.gen_salt('bf'))
    WHERE id = link_id;
  END IF;

  RETURN TRUE;
END;
$$;

-- ============================================
-- UPDATED RPC: get_pets_stats (add sitter_info count)
-- ============================================

DROP FUNCTION IF EXISTS get_pets_stats(uuid[]);

CREATE FUNCTION get_pets_stats(pet_ids UUID[])
RETURNS TABLE(
  pet_id UUID,
  vaccinations BIGINT,
  health_records BIGINT,
  insurance BIGINT,
  vets BIGINT,
  emergency_contacts BIGINT,
  food BIGINT,
  routines BIGINT,
  expiring_vaccinations BIGINT,
  expired_vaccinations BIGINT,
  sitter_info BIGINT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.id AS pet_id,
    (SELECT COUNT(*) FROM vaccination_records vr WHERE vr.pet_id = p.id)
      + (SELECT COUNT(*) FROM pet_documents pd WHERE pd.pet_id = p.id AND pd.category = 'vaccination')
      AS vaccinations,
    (SELECT COUNT(*) FROM health_records hr WHERE hr.pet_id = p.id)
      + (SELECT COUNT(*) FROM pet_documents pd2 WHERE pd2.pet_id = p.id AND pd2.category = 'health')
      AS health_records,
    (SELECT COUNT(*) FROM pet_insurance pi WHERE pi.pet_id = p.id) AS insurance,
    (SELECT COUNT(*) FROM veterinarians v WHERE v.pet_id = p.id) AS vets,
    (SELECT COUNT(*) FROM emergency_contacts ec WHERE ec.pet_id = p.id) AS emergency_contacts,
    (SELECT COUNT(*) FROM food_preferences fp WHERE fp.pet_id = p.id) AS food,
    (SELECT COUNT(*) FROM daily_routines dr WHERE dr.pet_id = p.id) AS routines,
    (SELECT COUNT(*) FROM vaccination_records vr2
      WHERE vr2.pet_id = p.id
        AND vr2.expiration_date > CURRENT_DATE
        AND vr2.expiration_date <= CURRENT_DATE + INTERVAL '30 days')
      AS expiring_vaccinations,
    (SELECT COUNT(*) FROM vaccination_records vr3
      WHERE vr3.pet_id = p.id
        AND vr3.expiration_date < CURRENT_DATE)
      AS expired_vaccinations,
    (SELECT COUNT(*) FROM care_instructions ci WHERE ci.pet_id = p.id)
      + (SELECT COUNT(*) FROM behavioral_notes bn WHERE bn.pet_id = p.id)
      AS sitter_info
  FROM unnest(pet_ids) WITH ORDINALITY AS u(id, ord)
  JOIN pets p ON p.id = u.id
  ORDER BY u.ord;
$$;
