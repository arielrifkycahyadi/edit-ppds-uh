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

-- 3. PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- HELPER FUNCTIONS FOR NORMALIZATION
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

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restricted_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- POLICIES: PROFILES
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full access profiles" ON public.profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- POLICIES: SUBMISSIONS
CREATE POLICY "Resident view own submissions" ON public.submissions FOR SELECT USING (
    resident_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR (assigned_reviewer_id = auth.uid())
    OR (status = 'waiting' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'reviewer'))
);

CREATE POLICY "Resident insert submission" ON public.submissions FOR INSERT WITH CHECK (
    resident_id = auth.uid()
);

CREATE POLICY "Reviewer or Admin update submission" ON public.submissions FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    OR (assigned_reviewer_id = auth.uid())
    OR (status = 'waiting' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'reviewer'))
);

CREATE POLICY "Admin delete submission" ON public.submissions FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- POLICIES: SUBMISSION JOURNALS
CREATE POLICY "Allow view submission journals" ON public.submission_journals FOR SELECT USING (true);
CREATE POLICY "Resident insert journals" ON public.submission_journals FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND resident_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Reviewer/Admin update journals" ON public.submission_journals FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'reviewer'))
);

-- POLICIES: RESTRICTED JOURNALS
CREATE POLICY "Allow select restricted journals" ON public.restricted_journals FOR SELECT USING (true);
CREATE POLICY "Admin manage restricted journals" ON public.restricted_journals FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- =========================================================
-- SEED DATA
-- =========================================================

-- Insert Initial Restricted Journals (Beall's List / Predatory & Discontinued sample)
INSERT INTO public.restricted_journals (journal_name, issn, source, source_reference)
VALUES
    ('International Journal of Advance Medical Sciences', '2349-512X', 'Bealls List', 'Predatory publisher blacklist 2026'),
    ('Journal of Medical Case Studies and Research', '2277-4998', 'Discontinued Scopus', 'Scopus Discontinued list 2025'),
    ('Global Journal of Health Science & Clinical Practice', '1916-9736', 'Predatory Guard', 'Predatory journal criteria'),
    ('Archives of Pharmacy and Biological Sciences', '2320-5679', 'Discontinued Scopus', 'Discontinued due to publication malpractice'),
    ('World Journal of Medical Research and Review', '2581-9984', 'Bealls List', 'Hijacked journal clone'),
    ('International Medical Journal of Advance Diagnostics', '1341-2051', 'Discontinued WoS', 'Suppressed from JCR'),
    ('Journal of Pharmaceutical Sciences and Research', '0975-1459', 'Discontinued Scopus', 'Discontinued Scopus 2023')
ON CONFLICT DO NOTHING;
