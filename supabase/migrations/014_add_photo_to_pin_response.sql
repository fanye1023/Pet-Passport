-- Include photo_url in PIN-protected share link responses for OG previews
-- The photo itself isn't sensitive; the care info is what's protected

CREATE OR REPLACE FUNCTION get_pet_by_share_token(share_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
  link_record RECORD;
  v_user_id UUID;
  v_has_saved BOOLEAN;
BEGIN
  -- Get current user (may be NULL if not logged in)
  v_user_id := auth.uid();

  -- Find and validate the share link
  SELECT * INTO link_record
  FROM share_links
  WHERE token = share_token
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Check if user has saved this link (bypass PIN if so)
  v_has_saved := FALSE;
  IF v_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM saved_share_links
      WHERE user_id = v_user_id AND share_link_id = link_record.id
    ) INTO v_has_saved;
  END IF;

  -- If PIN protected AND user hasn't saved it, return early with pin_required flag
  -- Include photo_url for Open Graph previews (photo isn't sensitive)
  IF link_record.pin_hash IS NOT NULL AND NOT v_has_saved THEN
    SELECT json_build_object(
      'pin_required', true,
      'pet_name', p.name,
      'pet_photo_url', p.photo_url
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

  -- Update last_accessed_at for saved links
  IF v_has_saved THEN
    UPDATE saved_share_links
    SET last_accessed_at = NOW()
    WHERE user_id = v_user_id AND share_link_id = link_record.id;
  END IF;

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
