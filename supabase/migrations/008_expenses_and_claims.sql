-- Expenses and Insurance Claims Migration
-- Implements expense tracking and insurance claim management

-- ============================================
-- NEW TABLE: insurance_claims (created first for FK)
-- ============================================

CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  claim_number TEXT,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'not_submitted'
    CHECK (status IN ('not_submitted', 'submitted', 'pending', 'approved', 'denied', 'paid')),
  submitted_date DATE,
  resolved_date DATE,
  claimed_amount DECIMAL(10,2) NOT NULL,
  approved_amount DECIMAL(10,2),
  reimbursement_amount DECIMAL(10,2),
  reimbursement_date DATE,
  claim_document_url TEXT,
  notes TEXT,
  denial_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_insurance_claims_pet_id ON insurance_claims(pet_id);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_status ON insurance_claims(status);
CREATE INDEX IF NOT EXISTS idx_insurance_claims_submitted_date ON insurance_claims(submitted_date DESC);

-- ============================================
-- NEW TABLE: pet_expenses
-- ============================================

CREATE TABLE IF NOT EXISTS pet_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  expense_type TEXT NOT NULL
    CHECK (expense_type IN ('vet_visit', 'medication', 'grooming', 'food', 'supplies', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  vendor_name TEXT,
  receipt_url TEXT,
  claim_id UUID REFERENCES insurance_claims(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_expenses_pet_id ON pet_expenses(pet_id);
CREATE INDEX IF NOT EXISTS idx_pet_expenses_expense_type ON pet_expenses(expense_type);
CREATE INDEX IF NOT EXISTS idx_pet_expenses_expense_date ON pet_expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_pet_expenses_claim_id ON pet_expenses(claim_id);

-- ============================================
-- AUTO-UPDATE TRIGGERS FOR updated_at
-- ============================================

CREATE TRIGGER insurance_claims_updated_at
  BEFORE UPDATE ON insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER pet_expenses_updated_at
  BEFORE UPDATE ON pet_expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE pet_expenses ENABLE ROW LEVEL SECURITY;

-- Insurance Claims policies (using user_has_pet_access)
CREATE POLICY "Users can view accessible pet claims" ON insurance_claims
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

CREATE POLICY "Editors can insert claims" ON insurance_claims
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can update claims" ON insurance_claims
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can delete claims" ON insurance_claims
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- Pet Expenses policies (using user_has_pet_access)
CREATE POLICY "Users can view accessible pet expenses" ON pet_expenses
  FOR SELECT USING (user_has_pet_access(pet_id, 'viewer'));

CREATE POLICY "Editors can insert expenses" ON pet_expenses
  FOR INSERT WITH CHECK (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can update expenses" ON pet_expenses
  FOR UPDATE USING (user_has_pet_access(pet_id, 'editor'));

CREATE POLICY "Editors can delete expenses" ON pet_expenses
  FOR DELETE USING (user_has_pet_access(pet_id, 'editor'));

-- ============================================
-- ACTIVITY LOGGING TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION log_expense_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'created', 'expense', NEW.id,
      jsonb_build_object('title', NEW.title, 'expense_type', NEW.expense_type, 'amount', NEW.amount));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'updated', 'expense', NEW.id,
      jsonb_build_object('title', NEW.title, 'expense_type', NEW.expense_type, 'amount', NEW.amount));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (OLD.pet_id, auth.uid(), 'deleted', 'expense', OLD.id,
      jsonb_build_object('title', OLD.title, 'expense_type', OLD.expense_type, 'amount', OLD.amount));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_expense_changes
  AFTER INSERT OR UPDATE OR DELETE ON pet_expenses
  FOR EACH ROW
  EXECUTE FUNCTION log_expense_activity();

CREATE OR REPLACE FUNCTION log_claim_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'created', 'insurance_claim', NEW.id,
      jsonb_build_object('title', NEW.title, 'status', NEW.status, 'claimed_amount', NEW.claimed_amount));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (NEW.pet_id, auth.uid(), 'updated', 'insurance_claim', NEW.id,
      jsonb_build_object('title', NEW.title, 'status', NEW.status, 'claimed_amount', NEW.claimed_amount,
        'old_status', OLD.status, 'new_status', NEW.status));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO activity_log (pet_id, user_id, action, entity_type, entity_id, details)
    VALUES (OLD.pet_id, auth.uid(), 'deleted', 'insurance_claim', OLD.id,
      jsonb_build_object('title', OLD.title, 'status', OLD.status, 'claimed_amount', OLD.claimed_amount));
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER log_claim_changes
  AFTER INSERT OR UPDATE OR DELETE ON insurance_claims
  FOR EACH ROW
  EXECUTE FUNCTION log_claim_activity();

-- ============================================
-- HELPER FUNCTION: Get expense summary for a pet
-- ============================================

CREATE OR REPLACE FUNCTION get_pet_expense_summary(target_pet_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Check access
  IF NOT user_has_pet_access(target_pet_id, 'viewer') THEN
    RETURN NULL;
  END IF;

  SELECT json_build_object(
    'total_expenses', COALESCE(SUM(amount), 0),
    'expense_count', COUNT(*),
    'this_month_total', COALESCE(SUM(CASE
      WHEN expense_date >= date_trunc('month', CURRENT_DATE) THEN amount
      ELSE 0
    END), 0),
    'this_year_total', COALESCE(SUM(CASE
      WHEN expense_date >= date_trunc('year', CURRENT_DATE) THEN amount
      ELSE 0
    END), 0),
    'by_type', (
      SELECT COALESCE(json_agg(
        json_build_object(
          'expense_type', expense_type,
          'total', total_amount,
          'count', expense_count
        )
      ), '[]'::json)
      FROM (
        SELECT expense_type, SUM(amount) as total_amount, COUNT(*) as expense_count
        FROM pet_expenses
        WHERE pet_id = target_pet_id
        GROUP BY expense_type
        ORDER BY total_amount DESC
      ) by_type
    ),
    'claims_summary', (
      SELECT json_build_object(
        'total_claimed', COALESCE(SUM(claimed_amount), 0),
        'total_approved', COALESCE(SUM(approved_amount), 0),
        'total_reimbursed', COALESCE(SUM(reimbursement_amount), 0),
        'pending_count', COUNT(*) FILTER (WHERE status IN ('submitted', 'pending')),
        'approved_count', COUNT(*) FILTER (WHERE status = 'approved'),
        'paid_count', COUNT(*) FILTER (WHERE status = 'paid'),
        'denied_count', COUNT(*) FILTER (WHERE status = 'denied')
      )
      FROM insurance_claims
      WHERE pet_id = target_pet_id
    )
  ) INTO result
  FROM pet_expenses
  WHERE pet_id = target_pet_id;

  RETURN result;
END;
$$;

-- ============================================
-- UPDATE get_pets_stats to include expenses
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
  sitter_info BIGINT,
  expenses BIGINT,
  pending_claims BIGINT
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
      AS sitter_info,
    (SELECT COUNT(*) FROM pet_expenses pe WHERE pe.pet_id = p.id) AS expenses,
    (SELECT COUNT(*) FROM insurance_claims ic
      WHERE ic.pet_id = p.id
        AND ic.status IN ('submitted', 'pending'))
      AS pending_claims
  FROM unnest(pet_ids) WITH ORDINALITY AS u(id, ord)
  JOIN pets p ON p.id = u.id
  ORDER BY u.ord;
$$;
