-- Pet Profiles Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES
-- ============================================

-- Core pet information
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birthday DATE,
  photo_url TEXT,
  microchip_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);

-- Vaccination records
CREATE TABLE IF NOT EXISTS vaccination_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  administered_date DATE NOT NULL,
  expiration_date DATE,
  veterinarian TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vaccination_records_pet_id ON vaccination_records(pet_id);

-- Health records
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  record_date DATE NOT NULL,
  document_url TEXT,
  veterinarian TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);

-- Pet insurance
CREATE TABLE IF NOT EXISTS pet_insurance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT,
  coverage_type TEXT,
  start_date DATE,
  end_date DATE,
  contact_phone TEXT,
  contact_email TEXT,
  document_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_insurance_pet_id ON pet_insurance(pet_id);

-- Veterinarians
CREATE TABLE IF NOT EXISTS veterinarians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  clinic_name TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  is_primary BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_veterinarians_pet_id ON veterinarians(pet_id);

-- Emergency contacts
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_pet_id ON emergency_contacts(pet_id);

-- Food preferences
CREATE TABLE IF NOT EXISTS food_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID UNIQUE NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  brand TEXT,
  food_type TEXT,
  portion_size TEXT,
  feeding_frequency TEXT,
  allergies TEXT[],
  treats TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_preferences_pet_id ON food_preferences(pet_id);

-- Pet Documents (standalone PDF uploads)
CREATE TABLE IF NOT EXISTS pet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- 'vaccination', 'health', 'insurance', 'other'
  name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  notes TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_documents_pet_id ON pet_documents(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_documents_category ON pet_documents(category);

-- Daily routines
CREATE TABLE IF NOT EXISTS daily_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  routine_type TEXT NOT NULL,
  time_of_day TEXT, -- Stores time of day labels like 'morning', 'afternoon', or custom times
  duration_minutes INTEGER,
  description TEXT,
  days_of_week TEXT[],
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_routines_pet_id ON daily_routines(pet_id);

-- Share links with customizable visibility
CREATE TABLE IF NOT EXISTS share_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  name TEXT,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  -- Visibility flags
  show_vaccinations BOOLEAN DEFAULT true,
  show_health_records BOOLEAN DEFAULT true,
  show_insurance BOOLEAN DEFAULT true,
  show_vet_info BOOLEAN DEFAULT true,
  show_emergency_contacts BOOLEAN DEFAULT true,
  show_food BOOLEAN DEFAULT true,
  show_routines BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(token);
CREATE INDEX IF NOT EXISTS idx_share_links_pet_id ON share_links(pet_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE veterinarians ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;

-- Pets policies
CREATE POLICY "Users can view own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- Vaccination records policies
CREATE POLICY "Users can view own pet vaccinations" ON vaccination_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert vaccinations for own pets" ON vaccination_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update vaccinations for own pets" ON vaccination_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete vaccinations for own pets" ON vaccination_records
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = vaccination_records.pet_id AND pets.user_id = auth.uid())
  );

-- Health records policies
CREATE POLICY "Users can view own pet health records" ON health_records
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert health records for own pets" ON health_records
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update health records for own pets" ON health_records
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete health records for own pets" ON health_records
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = health_records.pet_id AND pets.user_id = auth.uid())
  );

-- Pet insurance policies
CREATE POLICY "Users can view own pet insurance" ON pet_insurance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_insurance.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert insurance for own pets" ON pet_insurance
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_insurance.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update insurance for own pets" ON pet_insurance
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_insurance.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete insurance for own pets" ON pet_insurance
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_insurance.pet_id AND pets.user_id = auth.uid())
  );

-- Veterinarians policies
CREATE POLICY "Users can view own pet vets" ON veterinarians
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = veterinarians.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert vets for own pets" ON veterinarians
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = veterinarians.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update vets for own pets" ON veterinarians
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = veterinarians.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete vets for own pets" ON veterinarians
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = veterinarians.pet_id AND pets.user_id = auth.uid())
  );

-- Emergency contacts policies
CREATE POLICY "Users can view own pet emergency contacts" ON emergency_contacts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = emergency_contacts.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert emergency contacts for own pets" ON emergency_contacts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = emergency_contacts.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update emergency contacts for own pets" ON emergency_contacts
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = emergency_contacts.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete emergency contacts for own pets" ON emergency_contacts
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = emergency_contacts.pet_id AND pets.user_id = auth.uid())
  );

-- Food preferences policies
CREATE POLICY "Users can view own pet food preferences" ON food_preferences
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = food_preferences.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert food preferences for own pets" ON food_preferences
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = food_preferences.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update food preferences for own pets" ON food_preferences
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = food_preferences.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete food preferences for own pets" ON food_preferences
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = food_preferences.pet_id AND pets.user_id = auth.uid())
  );

-- Pet documents policies
CREATE POLICY "Users can view own pet documents" ON pet_documents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_documents.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert documents for own pets" ON pet_documents
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_documents.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update documents for own pets" ON pet_documents
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_documents.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete documents for own pets" ON pet_documents
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = pet_documents.pet_id AND pets.user_id = auth.uid())
  );

-- Daily routines policies
CREATE POLICY "Users can view own pet routines" ON daily_routines
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = daily_routines.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert routines for own pets" ON daily_routines
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = daily_routines.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update routines for own pets" ON daily_routines
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = daily_routines.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete routines for own pets" ON daily_routines
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = daily_routines.pet_id AND pets.user_id = auth.uid())
  );

-- Share links policies
CREATE POLICY "Users can view own share links" ON share_links
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = share_links.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can insert share links for own pets" ON share_links
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = share_links.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can update own share links" ON share_links
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = share_links.pet_id AND pets.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own share links" ON share_links
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = share_links.pet_id AND pets.user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get pet data via share token (bypasses RLS)
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
    'visibility', json_build_object(
      'vaccinations', link_record.show_vaccinations,
      'health_records', link_record.show_health_records,
      'insurance', link_record.show_insurance,
      'vet_info', link_record.show_vet_info,
      'emergency_contacts', link_record.show_emergency_contacts,
      'food', link_record.show_food,
      'routines', link_record.show_routines
    )
  ) INTO result
  FROM pets p
  WHERE p.id = link_record.pet_id;

  RETURN result;
END;
$$;

-- ============================================
-- STORAGE BUCKETS (run in Storage section of Supabase dashboard)
-- ============================================
--
-- Create these buckets manually in Supabase Dashboard > Storage:
--
-- 1. pet-photos
--    - Public bucket: Yes
--    - File size limit: 5MB
--    - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
--
-- 2. pet-documents
--    - Public bucket: No
--    - File size limit: 10MB
--    - Allowed MIME types: application/pdf, image/jpeg, image/png
