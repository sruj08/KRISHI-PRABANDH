-- survey_evidence: OCR pipeline + verification + risk (reference / migration)
-- Apply after `backend/docs/sql/survey_schema_bootstrap.sql` (or adjust FK names).

-- New / extended columns for OCR intelligence pipeline
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS farmer_id uuid REFERENCES farmer_profiles(id);
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS filename text;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS document_type text DEFAULT 'unknown';
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS ocr_raw_text text;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS ocr_fields jsonb DEFAULT '{}'::jsonb;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS ocr_engine_used text;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS ocr_confidence double precision DEFAULT 0.0;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS verification_result jsonb DEFAULT '{}'::jsonb;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'unknown';
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS risk_factors jsonb DEFAULT '[]'::jsonb;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS requires_manual_review boolean DEFAULT false;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id);
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS reviewed_at timestamptz;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS review_action text;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS review_notes text;
ALTER TABLE survey_evidence ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- storage_path may be populated with inline/placeholder URIs from OCR pipeline
ALTER TABLE survey_evidence ALTER COLUMN storage_path DROP NOT NULL;

ALTER TABLE survey_evidence DROP CONSTRAINT IF EXISTS survey_evidence_risk_score_check;
ALTER TABLE survey_evidence ADD CONSTRAINT survey_evidence_risk_score_check
  CHECK (risk_score >= 0 AND risk_score <= 100);

CREATE INDEX IF NOT EXISTS idx_evidence_risk_score ON survey_evidence(risk_score DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_survey ON survey_evidence(survey_id);
CREATE INDEX IF NOT EXISTS idx_evidence_manual_review ON survey_evidence(requires_manual_review)
  WHERE requires_manual_review = true;

-- RLS (defense in depth — API still enforces RBAC with service role)
ALTER TABLE survey_evidence ENABLE ROW LEVEL SECURITY;

-- Fresh-install variant (only when table does not yet exist)
CREATE TABLE IF NOT EXISTS survey_evidence_full_template (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id             uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
    farmer_id             uuid REFERENCES farmer_profiles(id),
    filename              text NOT NULL,
    document_type         text NOT NULL,
    storage_path          text,
    ocr_raw_text          text,
    ocr_fields            jsonb DEFAULT '{}'::jsonb,
    ocr_engine_used       text,
    ocr_confidence        double precision DEFAULT 0.0,
    verification_result   jsonb DEFAULT '{}'::jsonb,
    risk_score            integer DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_level            text DEFAULT 'unknown',
    risk_factors          jsonb DEFAULT '[]'::jsonb,
    requires_manual_review boolean DEFAULT false,
    reviewed_by           uuid REFERENCES users(id),
    reviewed_at           timestamptz,
    review_action         text,
    review_notes          text,
    mime_type             text,
    notes                 text,
    uploaded_by           uuid REFERENCES users(id),
    created_at            timestamptz DEFAULT now(),
    updated_at            timestamptz DEFAULT now()
);

COMMENT ON TABLE survey_evidence_full_template IS
  'Template only — use ALTER survey_evidence … in production; drop template if unused.';
