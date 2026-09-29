-- =========================================================
-- SIPATUJU PPDS FK UNHAS (PostgreSQL / Supabase Schema)
-- Sistem Informasi Pelayanan Administrasi Tugas Akhir & Publikasi Jurnal
-- Universitas Hasanuddin - Fakultas Kedokteran
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. ENUMS & TYPES
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'reviewer', 'residen');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE submission_status AS ENUM ('waiting', 'in_review', 'completed', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE journal_decision AS ENUM ('accepted', 'revision', 'rejected', 'predatory');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with Supabase Auth or Standalone profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL DEFAULT 'residen',
    nim_nip VARCHAR(64) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32),
    program_ppds VARCHAR(255),
    department VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(64) UNIQUE,
    request_token VARCHAR(64) UNIQUE NOT NULL DEFAULT md5(random()::text || clock_timestamp()::text),
    resident_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    article_type VARCHAR(64) NOT NULL,
    article_title TEXT NOT NULL,
    article_abstract TEXT NOT NULL,
    supervisor_name VARCHAR(255) NOT NULL,
    status submission_status NOT NULL DEFAULT 'waiting',
    assigned_reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assignment_source VARCHAR(32) DEFAULT 'unassigned',
    assigned_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    loa_generated_at TIMESTAMPTZ,
    loa_document_number VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SUBMISSION JOURNALS TABLE (3 Candidate Journals)
CREATE TABLE IF NOT EXISTS public.submission_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    journal_order SMALLINT NOT NULL CHECK (journal_order IN (1, 2, 3)),
    journal_name VARCHAR(255) NOT NULL,
    issn VARCHAR(32) NOT NULL,
    quartile VARCHAR(16) NOT NULL,
    journal_url TEXT,
    decision journal_decision,
    rejection_reasons TEXT[] DEFAULT '{}',
    reviewer_comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (submission_id, journal_order)
);

-- 6. RESTRICTED & PREDATORY JOURNALS TABLE
CREATE TABLE IF NOT EXISTS public.restricted_journals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journal_name VARCHAR(255) NOT NULL,
    issn VARCHAR(32) NOT NULL DEFAULT '',
    normalized_name VARCHAR(255) NOT NULL,
    normalized_issn VARCHAR(32) NOT NULL DEFAULT '',
    source VARCHAR(64) NOT NULL DEFAULT 'system',
    source_reference VARCHAR(255) NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    removed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    removed_at TIMESTAMPTZ
);

-- 7. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64),
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_nim_nip ON public.profiles(nim_nip);
CREATE INDEX IF NOT EXISTS idx_submissions_resident ON public.submissions(resident_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_reviewer ON public.submissions(assigned_reviewer_id);
CREATE INDEX IF NOT EXISTS idx_journals_sub_id ON public.submission_journals(submission_id);
CREATE INDEX IF NOT EXISTS idx_restricted_norm_name ON public.restricted_journals(normalized_name);
CREATE INDEX IF NOT EXISTS idx_restricted_norm_issn ON public.restricted_journals(normalized_issn);

-- HELPER FUNCTIONS FOR SECURITY DEFINER & NORMALIZATION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_reviewer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'reviewer'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.normalize_journal_name(val TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN regexp_replace(
        lower(unaccent(trim(coalesce(val, '')))),
        '[^a-z0-9 ]',
        '',
        'g'
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.normalize_issn(val TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN upper(regexp_replace(coalesce(val, ''), '[^0-9X]', '', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- TRIGGER TO AUTO-NORMALIZE RESTRICTED JOURNALS
CREATE OR REPLACE FUNCTION public.trg_restricted_journals_normalize()
RETURNS TRIGGER AS $$
BEGIN
    NEW.normalized_name := public.normalize_journal_name(NEW.journal_name);
    NEW.normalized_issn := public.normalize_issn(NEW.issn);
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_restricted_journals_norm ON public.restricted_journals;
CREATE TRIGGER trg_restricted_journals_norm
BEFORE INSERT OR UPDATE ON public.restricted_journals
FOR EACH ROW EXECUTE FUNCTION public.trg_restricted_journals_normalize();

-- TRIGGER TO AUTO-GENERATE SUBMISSION CODE
CREATE OR REPLACE FUNCTION public.trg_submissions_generate_code()
RETURNS TRIGGER AS $$
DECLARE
    seq_val INT;
    date_str VARCHAR(8);
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        date_str := to_char(NOW(), 'YYYYMMDD');
        SELECT COUNT(*) + 1 INTO seq_val FROM public.submissions WHERE to_char(created_at, 'YYYYMMDD') = date_str;
        NEW.code := 'SPJ-' || date_str || '-' || LPAD(seq_val::text, 4, '0');
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_submissions_code ON public.submissions;
CREATE TRIGGER trg_submissions_code
BEFORE INSERT ON public.submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_submissions_generate_code();

-- FUNCTION FOR PRE-CHECKING RESTRICTED JOURNALS
CREATE OR REPLACE FUNCTION public.check_restricted_journals(p_name TEXT, p_issn TEXT)
RETURNS TABLE (
    is_restricted BOOLEAN,
    matched_name VARCHAR(255),
    matched_issn VARCHAR(32),
    source VARCHAR(64),
    source_reference VARCHAR(255)
) AS $$
DECLARE
    norm_n TEXT := public.normalize_journal_name(p_name);
    norm_i TEXT := public.normalize_issn(p_issn);
BEGIN
    RETURN QUERY
    SELECT 
        true AS is_restricted,
        rj.journal_name AS matched_name,
        rj.issn AS matched_issn,
        rj.source,
        rj.source_reference
    FROM public.restricted_journals rj
    WHERE rj.is_active = true
      AND (
        (norm_n <> '' AND rj.normalized_name = norm_n)
        OR (norm_i <> '' AND rj.normalized_issn = norm_i)
      )
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROW LEVEL SECURITY (RLS) FIX (Avoid recursion)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Drop any previous conflicting policies
DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;
DROP POLICY IF EXISTS "User update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin full access profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles select" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles insert" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles update" ON public.profiles;
DROP POLICY IF EXISTS "Allow all profiles delete" ON public.profiles;

-- Open readable profiles for active session lookups & admin management
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow update profiles" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Allow insert profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete profiles" ON public.profiles FOR DELETE USING (true);

-- Drop previous submission policies
DROP POLICY IF EXISTS "Resident view own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Resident insert submission" ON public.submissions;
DROP POLICY IF EXISTS "Reviewer or Admin update submission" ON public.submissions;
DROP POLICY IF EXISTS "Admin delete submission" ON public.submissions;
DROP POLICY IF EXISTS "Allow select submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow update submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow delete submissions" ON public.submissions;

CREATE POLICY "Allow select submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Allow insert submissions" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update submissions" ON public.submissions FOR UPDATE USING (true);
CREATE POLICY "Allow delete submissions" ON public.submissions FOR DELETE USING (true);

-- Submission Journals Policies
DROP POLICY IF EXISTS "Allow view submission journals" ON public.submission_journals;
DROP POLICY IF EXISTS "Resident insert journals" ON public.submission_journals;
DROP POLICY IF EXISTS "Reviewer/Admin update journals" ON public.submission_journals;
DROP POLICY IF EXISTS "Allow select journals" ON public.submission_journals;
DROP POLICY IF EXISTS "Allow insert journals" ON public.submission_journals;
DROP POLICY IF EXISTS "Allow update journals" ON public.submission_journals;
DROP POLICY IF EXISTS "Allow delete journals" ON public.submission_journals;

CREATE POLICY "Allow select journals" ON public.submission_journals FOR SELECT USING (true);
CREATE POLICY "Allow insert journals" ON public.submission_journals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update journals" ON public.submission_journals FOR UPDATE USING (true);
CREATE POLICY "Allow delete journals" ON public.submission_journals FOR DELETE USING (true);

-- Restricted Journals Policies
DROP POLICY IF EXISTS "Allow select restricted journals" ON public.restricted_journals;
DROP POLICY IF EXISTS "Admin manage restricted journals" ON public.restricted_journals;
DROP POLICY IF EXISTS "Allow all restricted journals" ON public.restricted_journals;

CREATE POLICY "Allow select restricted journals" ON public.restricted_journals FOR SELECT USING (true);
CREATE POLICY "Allow insert restricted journals" ON public.restricted_journals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update restricted journals" ON public.restricted_journals FOR UPDATE USING (true);
CREATE POLICY "Allow delete restricted journals" ON public.restricted_journals FOR DELETE USING (true);

-- Audit Logs Policies
CREATE POLICY "Allow all audit logs select" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "Allow all audit logs insert" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- =========================================================
-- SEED DATA & INITIAL PROFILES
-- =========================================================

INSERT INTO public.profiles (id, role, nim_nip, full_name, email, phone, program_ppds, department, is_active)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin', '197805122005011002', 'Dr. dr. Andi Muhammad Fachry, Sp.PD-KGEH', 'admin.sipatuju@med.unhas.ac.id', '08114123456', NULL, 'Sekretariat PPDS FK UNHAS', true),
    ('22222222-2222-2222-2222-222222222221', 'reviewer', '198203152008121001', 'Prof. Dr. dr. Syahrul Rauf, Sp.OG(K)', 'syahrul.rauf@med.unhas.ac.id', '081242998877', NULL, 'Departemen Obstetri & Ginekologi', true),
    ('22222222-2222-2222-2222-222222222222', 'reviewer', '198511202010122003', 'Dr. dr. Ratna Dewi Artati, Sp.A(K)', 'ratnadewi@med.unhas.ac.id', '081355667788', NULL, 'Departemen Ilmu Kesehatan Anak', true),
    ('33333333-3333-3333-3333-333333333331', 'residen', 'C104212001', 'dr. Ahmad Fauzi Ramadhan', 'ahmad.fauzi@pasca.unhas.ac.id', '082188990011', 'Ilmu Penyakit Dalam', NULL, true),
    ('33333333-3333-3333-3333-333333333332', 'residen', 'C104212002', 'dr. Siti Nurhaliza Mansyur', 'siti.nurhaliza@pasca.unhas.ac.id', '085299443322', 'Anestesiologi dan Terapi Intensif', NULL, true),
    ('33333333-3333-3333-3333-333333333333', 'residen', 'C104212003', 'dr. Kevin Pratama Putra', 'kevin.pratama@pasca.unhas.ac.id', '081299112233', 'Obstetri dan Ginekologi', NULL, true)
ON CONFLICT (nim_nip) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    program_ppds = EXCLUDED.program_ppds;

-- Initial Restricted Journals (Beall's List / Predatory & Discontinued)
INSERT INTO public.restricted_journals (journal_name, issn, source, source_reference)
VALUES
    ('International Journal of Advance Medical Sciences', '2349-512X', 'Bealls List', 'Predatory publisher blacklist 2026'),
    ('Journal of Medical Case Studies and Research', '2277-4998', 'Discontinued Scopus', 'Scopus Discontinued list 2025'),
    ('Global Journal of Health Science & Clinical Practice', '1916-9736', 'Predatory Guard', 'Predatory journal criteria FK UNHAS'),
    ('Archives of Pharmacy and Biological Sciences', '2320-5679', 'Discontinued Scopus', 'Discontinued due to publication malpractice'),
    ('World Journal of Medical Research and Review', '2581-9984', 'Bealls List', 'Hijacked journal clone'),
    ('International Medical Journal of Advance Diagnostics', '1341-2051', 'Discontinued WoS', 'Suppressed from JCR'),
    ('Journal of Pharmaceutical Sciences and Research', '0975-1459', 'Discontinued Scopus', 'Discontinued Scopus 2023')
ON CONFLICT DO NOTHING;
