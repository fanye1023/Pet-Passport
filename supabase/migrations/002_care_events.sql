-- Care Events Database Schema
-- Stores vet appointments, grooming appointments, and medication cycles

-- ============================================
-- TABLES
-- ============================================

CREATE TABLE IF NOT EXISTS care_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('vet_appointment', 'grooming', 'medication')),
  title TEXT NOT NULL,
  description TEXT,

  -- One-time events
  event_date DATE,
  event_time TIME,

  -- Recurring events
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
  recurrence_day_of_month INTEGER CHECK (recurrence_day_of_month IS NULL OR (recurrence_day_of_month >= 1 AND recurrence_day_of_month <= 31)),
  recurrence_day_of_week TEXT CHECK (recurrence_day_of_week IS NULL OR recurrence_day_of_week IN ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
  recurrence_start_date DATE,
  recurrence_end_date DATE,

  -- Metadata
  location TEXT,
  veterinarian_id UUID REFERENCES veterinarians(id) ON DELETE SET NULL,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_care_events_pet_id ON care_events(pet_id);
CREATE INDEX IF NOT EXISTS idx_care_events_event_date ON care_events(event_date);
CREATE INDEX IF NOT EXISTS idx_care_events_event_type ON care_events(event_type);
CREATE INDEX IF NOT EXISTS idx_care_events_is_recurring ON care_events(is_recurring);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE care_events ENABLE ROW LEVEL SECURITY;

-- Users can view their own pet's care events
CREATE POLICY "Users can view own pet care events" ON care_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = care_events.pet_id AND pets.user_id = auth.uid())
  );

-- Users can insert care events for their own pets
CREATE POLICY "Users can insert care events for own pets" ON care_events
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = care_events.pet_id AND pets.user_id = auth.uid())
  );

-- Users can update care events for their own pets
CREATE POLICY "Users can update care events for own pets" ON care_events
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = care_events.pet_id AND pets.user_id = auth.uid())
  );

-- Users can delete care events for their own pets
CREATE POLICY "Users can delete care events for own pets" ON care_events
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM pets WHERE pets.id = care_events.pet_id AND pets.user_id = auth.uid())
  );

-- ============================================
-- TRIGGERS
-- ============================================

-- Update updated_at timestamp on changes
CREATE OR REPLACE FUNCTION update_care_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER care_events_updated_at
  BEFORE UPDATE ON care_events
  FOR EACH ROW
  EXECUTE FUNCTION update_care_events_updated_at();
