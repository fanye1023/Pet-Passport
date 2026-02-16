-- Pet Collaborators Database Schema
-- Implements multi-pet household and collaborative access features

-- ============================================
-- NEW TABLES
-- ============================================

-- User profiles for display names and avatars
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pet collaborators - links users to pets with roles
CREATE TABLE IF NOT EXISTS pet_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pet_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pet_collaborators_pet_id ON pet_collaborators(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_collaborators_user_id ON pet_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_collaborators_role ON pet_collaborators(role);

-- Pet invitations - pending invitations by email with tokens
CREATE TABLE IF NOT EXISTS pet_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('editor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pet_id, email, status)
);

CREATE INDEX IF NOT EXISTS idx_pet_invitations_token ON pet_invitations(token);
CREATE INDEX IF NOT EXISTS idx_pet_invitations_email ON pet_invitations(email);
CREATE INDEX IF NOT EXISTS idx_pet_invitations_pet_id ON pet_invitations(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_invitations_status ON pet_invitations(status);

-- Activity log - tracks who did what and when
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activity_log_pet_id ON activity_log(pet_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity_type ON activity_log(entity_type);

-- ============================================
-- ROW LEVEL SECURITY FOR NEW TABLES
-- ============================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view any profile" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Pet collaborators policies
-- Using user_has_pet_access function (SECURITY DEFINER) to avoid circular RLS dependency
CREATE POLICY "Users can view collaborators for accessible pets" ON pet_collaborators
  FOR SELECT USING (
    -- User can always see their own collaborator records
    user_id = auth.uid()
    -- Or use the SECURITY DEFINER function to check pet access
    OR user_has_pet_access(pet_id, 'viewer')
  );

CREATE POLICY "Owners can insert collaborators" ON pet_collaborators
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_collaborators.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM pets WHERE pets.id = pet_collaborators.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update collaborators" ON pet_collaborators
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_collaborators.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
  );

CREATE POLICY "Owners can delete non-owner collaborators" ON pet_collaborators
  FOR DELETE USING (
    pet_collaborators.role != 'owner'
    AND EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_collaborators.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
  );

-- Pet invitations policies
CREATE POLICY "Owners can view invitations" ON pet_invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_invitations.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM pets WHERE pets.id = pet_invitations.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert invitations" ON pet_invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_invitations.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM pets WHERE pets.id = pet_invitations.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update invitations" ON pet_invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_invitations.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM pets WHERE pets.id = pet_invitations.pet_id AND pets.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete invitations" ON pet_invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM pet_collaborators pc
      WHERE pc.pet_id = pet_invitations.pet_id
      AND pc.user_id = auth.uid()
      AND pc.role = 'owner'
    )
    OR EXISTS (
      SELECT 1 FROM pets WHERE pets.id = pet_invitations.pet_id AND pets.user_id = auth.uid()
    )
  );

-- Activity log policies (using user_has_pet_access function which is SECURITY DEFINER)
CREATE POLICY "Collaborators can view activity for their pets" ON activity_log
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

CREATE POLICY "System can insert activity" ON activity_log
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

-- ============================================
-- UPDATE RLS POLICIES FOR EXISTING TABLES TO SUPPORT COLLABORATORS
-- ============================================

-- Helper function to check if user has access to a pet
-- SECURITY DEFINER + row_security = off ensures this bypasses RLS to avoid circular dependencies
CREATE OR REPLACE FUNCTION user_has_pet_access(pet_uuid UUID, required_role TEXT DEFAULT 'viewer')
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  pet_owner_id UUID;
  user_role TEXT;
BEGIN
  -- Get the pet owner directly (bypassing RLS)
  SELECT user_id INTO pet_owner_id FROM pets WHERE id = pet_uuid;

  -- If pet doesn't exist, no access
  IF pet_owner_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user is the original owner
  IF pet_owner_id = auth.uid() THEN
    RETURN TRUE;
  END IF;

  -- Get user's role from collaborators
  SELECT role INTO user_role
  FROM pet_collaborators
  WHERE pet_id = pet_uuid AND user_id = auth.uid();

  -- If not a collaborator, no access
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check role permissions
  IF required_role = 'viewer' THEN
    RETURN user_role IN ('owner', 'editor', 'viewer');
  ELSIF required_role = 'editor' THEN
    RETURN user_role IN ('owner', 'editor');
  ELSIF required_role = 'owner' THEN
    RETURN user_role = 'owner';
  END IF;

  RETURN FALSE;
END;
$$;

-- Drop and recreate pets policies to include collaborator access
-- Using user_has_pet_access function (SECURITY DEFINER) to avoid circular RLS dependency
DROP POLICY IF EXISTS "Users can view own pets" ON pets;
CREATE POLICY "Users can view accessible pets" ON pets
  FOR SELECT USING (user_has_pet_access(id, 'viewer'));

-- Note: INSERT, UPDATE, DELETE on pets remain owner-only
-- The original owner (user_id) retains full control

-- Update vaccination_records policies
DROP POLICY IF EXISTS "Users can view own pet vaccinations" ON vaccination_records;
CREATE POLICY "Users can view accessible pet vaccinations" ON vaccination_records
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert vaccinations for own pets" ON vaccination_records;
CREATE POLICY "Editors can insert vaccinations" ON vaccination_records
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update vaccinations for own pets" ON vaccination_records;
CREATE POLICY "Editors can update vaccinations" ON vaccination_records
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete vaccinations for own pets" ON vaccination_records;
CREATE POLICY "Editors can delete vaccinations" ON vaccination_records
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update health_records policies
DROP POLICY IF EXISTS "Users can view own pet health records" ON health_records;
CREATE POLICY "Users can view accessible pet health records" ON health_records
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert health records for own pets" ON health_records;
CREATE POLICY "Editors can insert health records" ON health_records
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update health records for own pets" ON health_records;
CREATE POLICY "Editors can update health records" ON health_records
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete health records for own pets" ON health_records;
CREATE POLICY "Editors can delete health records" ON health_records
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update pet_insurance policies
DROP POLICY IF EXISTS "Users can view own pet insurance" ON pet_insurance;
CREATE POLICY "Users can view accessible pet insurance" ON pet_insurance
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert insurance for own pets" ON pet_insurance;
CREATE POLICY "Editors can insert insurance" ON pet_insurance
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update insurance for own pets" ON pet_insurance;
CREATE POLICY "Editors can update insurance" ON pet_insurance
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete insurance for own pets" ON pet_insurance;
CREATE POLICY "Editors can delete insurance" ON pet_insurance
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update veterinarians policies
DROP POLICY IF EXISTS "Users can view own pet vets" ON veterinarians;
CREATE POLICY "Users can view accessible pet vets" ON veterinarians
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert vets for own pets" ON veterinarians;
CREATE POLICY "Editors can insert vets" ON veterinarians
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update vets for own pets" ON veterinarians;
CREATE POLICY "Editors can update vets" ON veterinarians
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete vets for own pets" ON veterinarians;
CREATE POLICY "Editors can delete vets" ON veterinarians
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update emergency_contacts policies
DROP POLICY IF EXISTS "Users can view own pet emergency contacts" ON emergency_contacts;
CREATE POLICY "Users can view accessible pet emergency contacts" ON emergency_contacts
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert emergency contacts for own pets" ON emergency_contacts;
CREATE POLICY "Editors can insert emergency contacts" ON emergency_contacts
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update emergency contacts for own pets" ON emergency_contacts;
CREATE POLICY "Editors can update emergency contacts" ON emergency_contacts
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete emergency contacts for own pets" ON emergency_contacts;
CREATE POLICY "Editors can delete emergency contacts" ON emergency_contacts
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update food_preferences policies
DROP POLICY IF EXISTS "Users can view own pet food preferences" ON food_preferences;
CREATE POLICY "Users can view accessible pet food preferences" ON food_preferences
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert food preferences for own pets" ON food_preferences;
CREATE POLICY "Editors can insert food preferences" ON food_preferences
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update food preferences for own pets" ON food_preferences;
CREATE POLICY "Editors can update food preferences" ON food_preferences
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete food preferences for own pets" ON food_preferences;
CREATE POLICY "Editors can delete food preferences" ON food_preferences
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update pet_documents policies
DROP POLICY IF EXISTS "Users can view own pet documents" ON pet_documents;
CREATE POLICY "Users can view accessible pet documents" ON pet_documents
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert documents for own pets" ON pet_documents;
CREATE POLICY "Editors can insert documents" ON pet_documents
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update documents for own pets" ON pet_documents;
CREATE POLICY "Editors can update documents" ON pet_documents
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete documents for own pets" ON pet_documents;
CREATE POLICY "Editors can delete documents" ON pet_documents
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update daily_routines policies
DROP POLICY IF EXISTS "Users can view own pet routines" ON daily_routines;
CREATE POLICY "Users can view accessible pet routines" ON daily_routines
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert routines for own pets" ON daily_routines;
CREATE POLICY "Editors can insert routines" ON daily_routines
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update routines for own pets" ON daily_routines;
CREATE POLICY "Editors can update routines" ON daily_routines
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete routines for own pets" ON daily_routines;
CREATE POLICY "Editors can delete routines" ON daily_routines
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update share_links policies
DROP POLICY IF EXISTS "Users can view own share links" ON share_links;
CREATE POLICY "Users can view accessible share links" ON share_links
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert share links for own pets" ON share_links;
CREATE POLICY "Editors can insert share links" ON share_links
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update own share links" ON share_links;
CREATE POLICY "Editors can update share links" ON share_links
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete own share links" ON share_links;
CREATE POLICY "Editors can delete share links" ON share_links
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Update care_events policies
DROP POLICY IF EXISTS "Users can view own pet care events" ON care_events;
CREATE POLICY "Users can view accessible pet care events" ON care_events
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

DROP POLICY IF EXISTS "Users can insert care events for own pets" ON care_events;
CREATE POLICY "Editors can insert care events" ON care_events
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can update care events for own pets" ON care_events;
CREATE POLICY "Editors can update care events" ON care_events
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

DROP POLICY IF EXISTS "Users can delete care events for own pets" ON care_events;
CREATE POLICY "Editors can delete care events" ON care_events
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create owner collaborator when pet is created
CREATE OR REPLACE FUNCTION create_owner_collaborator()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO pet_collaborators (pet_id, user_id, role, invited_by, accepted_at)
  VALUES (NEW.id, NEW.user_id, 'owner', NEW.user_id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER pet_created_add_owner
  AFTER INSERT ON pets
  FOR EACH ROW
  EXECUTE FUNCTION create_owner_collaborator();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Update updated_at for user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_user_profiles_updated_at();

-- Activity logging triggers
CREATE OR REPLACE FUNCTION log_vaccination_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'created', 'vaccination', NEW.id,
      jsonb_build_object('vaccine_name', NEW.vaccine_name));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'updated', 'vaccination', NEW.id,
      jsonb_build_object('vaccine_name', NEW.vaccine_name));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (OLD.pet_id, auth.uid(), 'deleted', 'vaccination', OLD.id,
      jsonb_build_object('vaccine_name', OLD.vaccine_name));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_vaccination_changes
  AFTER INSERT OR UPDATE OR DELETE ON vaccination_records
  FOR EACH ROW
  EXECUTE FUNCTION log_vaccination_activity();

CREATE OR REPLACE FUNCTION log_health_record_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'created', 'health_record', NEW.id,
      jsonb_build_object('title', NEW.title, 'record_type', NEW.record_type));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'updated', 'health_record', NEW.id,
      jsonb_build_object('title', NEW.title, 'record_type', NEW.record_type));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (OLD.pet_id, auth.uid(), 'deleted', 'health_record', OLD.id,
      jsonb_build_object('title', OLD.title, 'record_type', OLD.record_type));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_health_record_changes
  AFTER INSERT OR UPDATE OR DELETE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION log_health_record_activity();

CREATE OR REPLACE FUNCTION log_care_event_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'created', 'care_event', NEW.id,
      jsonb_build_object('title', NEW.title, 'event_type', NEW.event_type));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'updated', 'care_event', NEW.id,
      jsonb_build_object('title', NEW.title, 'event_type', NEW.event_type));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (OLD.pet_id, auth.uid(), 'deleted', 'care_event', OLD.id,
      jsonb_build_object('title', OLD.title, 'event_type', OLD.event_type));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_care_event_changes
  AFTER INSERT OR UPDATE OR DELETE ON care_events
  FOR EACH ROW
  EXECUTE FUNCTION log_care_event_activity();

-- ============================================
-- FUNCTIONS
-- ============================================

-- Accept pet invitation (public function for invite flow)
CREATE OR REPLACE FUNCTION accept_pet_invitation(invitation_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  user_email TEXT;
  result JSON;
BEGIN
  -- Get current user's email
  SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Find and validate the invitation
  SELECT * INTO invite_record
  FROM pet_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > NOW()
    AND LOWER(email) = LOWER(user_email);

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Create collaborator record
  INSERT INTO pet_collaborators (pet_id, user_id, role, invited_by, accepted_at)
  VALUES (invite_record.pet_id, auth.uid(), invite_record.role, invite_record.invited_by, NOW())
  ON CONFLICT (pet_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    accepted_at = NOW();

  -- Update invitation status
  UPDATE pet_invitations
  SET status = 'accepted'
  WHERE id = invite_record.id;

  -- Log activity
  INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
  VALUES (invite_record.pet_id, auth.uid(), 'created', 'collaborator', NULL,
    jsonb_build_object('role', invite_record.role, 'action', 'accepted_invitation'));

  RETURN json_build_object('success', true, 'pet_id', invite_record.pet_id);
END;
$$;

-- Get invitation preview (public function for invite page)
CREATE OR REPLACE FUNCTION get_invitation_preview(invitation_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invite_record RECORD;
  pet_record RECORD;
  inviter_record RECORD;
BEGIN
  -- Find the invitation
  SELECT * INTO invite_record
  FROM pet_invitations
  WHERE token = invitation_token
    AND status = 'pending'
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false, 'error', 'Invalid or expired invitation');
  END IF;

  -- Get pet info
  SELECT id, name, species, breed, photo_url INTO pet_record
  FROM pets
  WHERE id = invite_record.pet_id;

  -- Get inviter info
  SELECT display_name, avatar_url INTO inviter_record
  FROM user_profiles
  WHERE id = invite_record.invited_by;

  RETURN json_build_object(
    'valid', true,
    'email', invite_record.email,
    'role', invite_record.role,
    'expires_at', invite_record.expires_at,
    'pet', json_build_object(
      'id', pet_record.id,
      'name', pet_record.name,
      'species', pet_record.species,
      'breed', pet_record.breed,
      'photo_url', pet_record.photo_url
    ),
    'inviter', json_build_object(
      'display_name', COALESCE(inviter_record.display_name, 'Unknown'),
      'avatar_url', inviter_record.avatar_url
    )
  );
END;
$$;

-- Get user's role for a pet
CREATE OR REPLACE FUNCTION get_user_pet_role(pet_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Check if user is the original owner
  IF EXISTS (SELECT 1 FROM pets WHERE id = pet_uuid AND user_id = auth.uid()) THEN
    RETURN 'owner';
  END IF;

  -- Get role from collaborators
  SELECT role INTO user_role
  FROM pet_collaborators
  WHERE pet_id = pet_uuid AND user_id = auth.uid();

  RETURN user_role;
END;
$$;

-- ============================================
-- BACKFILL: Create owner collaborators for existing pets
-- ============================================

INSERT INTO pet_collaborators (pet_id, user_id, role, invited_by, accepted_at)
SELECT id, user_id, 'owner', user_id, created_at
FROM pets
WHERE NOT EXISTS (
  SELECT 1 FROM pet_collaborators pc
  WHERE pc.pet_id = pets.id AND pc.user_id = pets.user_id
)
ON CONFLICT (pet_id, user_id) DO NOTHING;

-- Backfill user profiles for existing users
INSERT INTO user_profiles (id, display_name, created_at)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), created_at
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = auth.users.id
)
ON CONFLICT (id) DO NOTHING;
