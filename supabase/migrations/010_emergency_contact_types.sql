-- Add contact_type to emergency_contacts to differentiate owner from other contacts
ALTER TABLE emergency_contacts
ADD COLUMN IF NOT EXISTS contact_type TEXT DEFAULT 'other'
CHECK (contact_type IN ('owner', 'family', 'friend', 'neighbor', 'pet_sitter', 'veterinarian', 'other'));

-- Add is_primary flag to mark the main contact
ALTER TABLE emergency_contacts
ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_type ON emergency_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_primary ON emergency_contacts(is_primary) WHERE is_primary = true;

-- Update existing contacts: try to infer type from relationship field
UPDATE emergency_contacts
SET contact_type = CASE
  WHEN LOWER(relationship) LIKE '%owner%' THEN 'owner'
  WHEN LOWER(relationship) LIKE '%mom%' OR LOWER(relationship) LIKE '%dad%'
       OR LOWER(relationship) LIKE '%parent%' OR LOWER(relationship) LIKE '%spouse%'
       OR LOWER(relationship) LIKE '%wife%' OR LOWER(relationship) LIKE '%husband%'
       OR LOWER(relationship) LIKE '%partner%' OR LOWER(relationship) LIKE '%family%'
       OR LOWER(relationship) LIKE '%brother%' OR LOWER(relationship) LIKE '%sister%' THEN 'family'
  WHEN LOWER(relationship) LIKE '%friend%' THEN 'friend'
  WHEN LOWER(relationship) LIKE '%neighbor%' THEN 'neighbor'
  WHEN LOWER(relationship) LIKE '%sitter%' OR LOWER(relationship) LIKE '%walker%' THEN 'pet_sitter'
  WHEN LOWER(relationship) LIKE '%vet%' OR LOWER(relationship) LIKE '%doctor%' THEN 'veterinarian'
  ELSE 'other'
END
WHERE contact_type IS NULL OR contact_type = 'other';
