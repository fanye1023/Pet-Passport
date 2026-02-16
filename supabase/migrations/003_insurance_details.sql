-- Add additional insurance policy details
-- These fields store coverage information extracted from insurance PDFs

ALTER TABLE pet_insurance
  ADD COLUMN IF NOT EXISTS deductible TEXT,
  ADD COLUMN IF NOT EXISTS annual_limit TEXT,
  ADD COLUMN IF NOT EXISTS reimbursement_rate TEXT,
  ADD COLUMN IF NOT EXISTS covered_services TEXT[],
  ADD COLUMN IF NOT EXISTS excluded_services TEXT[],
  ADD COLUMN IF NOT EXISTS preventative_care TEXT[],
  ADD COLUMN IF NOT EXISTS waiting_periods TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;
