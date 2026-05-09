-- Supabase Migration: Hardening the Schema

-- 1. Add Foreign Key constraints
ALTER TABLE applications
ADD CONSTRAINT fk_applications_mandal
FOREIGN KEY (mandal_id) REFERENCES mandals(mandal_id)
ON DELETE SET NULL;

ALTER TABLE applications
ADD CONSTRAINT fk_applications_sahayak
FOREIGN KEY (sahayak_id) REFERENCES sahayaks(sahayak_id)
ON DELETE SET NULL;

ALTER TABLE sahayaks
ADD CONSTRAINT fk_sahayaks_mandal
FOREIGN KEY (mandal_id) REFERENCES mandals(mandal_id)
ON DELETE CASCADE;

ALTER TABLE vistar_sessions
ADD CONSTRAINT fk_vistar_mandal
FOREIGN KEY (mandal_id) REFERENCES mandals(mandal_id)
ON DELETE CASCADE;

ALTER TABLE vistar_sessions
ADD CONSTRAINT fk_vistar_sahayak
FOREIGN KEY (sahayak_id) REFERENCES sahayaks(sahayak_id)
ON DELETE CASCADE;

-- 2. Optimize Indexes for frequent queries
CREATE INDEX idx_applications_mandal_id ON applications(mandal_id);
CREATE INDEX idx_applications_sahayak_id ON applications(sahayak_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_sahayaks_mandal_id ON sahayaks(mandal_id);
CREATE INDEX idx_vistar_mandal_id ON vistar_sessions(mandal_id);

-- 3. Row Level Security (Optional Enablement)
-- ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Officers can read their mandal applications" 
-- ON applications FOR SELECT 
-- USING (auth.jwt() ->> 'mandal_id' = mandal_id);
