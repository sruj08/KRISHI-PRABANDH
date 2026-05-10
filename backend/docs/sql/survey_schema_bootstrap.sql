-- Reference DDL for survey-centric KRISHI-PRABANDH (adjust types/constraints in Supabase).
-- Enable PostGIS in Supabase: create extension if not exists postgis;
--
-- PREREQUISITE: create hierarchy tables (states → divisions → districts → talukas → circles → villages)
-- before `users`, or drop the FK clauses below until hierarchy exists.

-- Hierarchy (already aligned with your product model)
-- states, divisions, districts, talukas, circles, villages

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  role text NOT NULL,
  state_id uuid REFERENCES states(id),
  division_id uuid REFERENCES divisions(id),
  district_id uuid REFERENCES districts(id),
  taluka_id uuid REFERENCES talukas(id),
  circle_id uuid REFERENCES circles(id),
  village_id uuid REFERENCES villages(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farmer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  full_name text,
  phone text,
  village_id uuid REFERENCES villages(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_profile_id uuid NOT NULL REFERENCES farmer_profiles(id),
  village_id uuid REFERENCES villages(id),
  area_hectares double precision,
  geom geometry(Polygon, 4326),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS schemes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  title text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES farms(id),
  scheme_id uuid NOT NULL REFERENCES schemes(id),
  status text NOT NULL DEFAULT 'DRAFT',
  title text,
  attrs jsonb,
  created_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  mime_type text,
  notes text,
  uploaded_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_ai_interviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  transcript jsonb,
  model text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS survey_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  approver_id uuid NOT NULL REFERENCES users(id),
  decision text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weather_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id),
  recorded_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS satellite_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id uuid REFERENCES districts(id),
  recorded_at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS compensation_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  survey_id uuid NOT NULL REFERENCES surveys(id),
  amount numeric,
  status text,
  pfms_reference text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_surveys_farm ON surveys(farm_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_survey_evidence_survey ON survey_evidence(survey_id);
