export type UserRole = 'admin' | 'reviewer' | 'residen';

export interface UserProfile {
  id: string;
  role: UserRole;
  nim_nip: string;
  full_name: string;
  email: string;
  phone?: string;
  program_ppds?: string;
  department?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  total_submissions?: number;
  active_reviews?: number;
  completed_reviews?: number;
}

export type SubmissionStatus = 'waiting' | 'in_review' | 'completed' | 'rejected';

export type JournalDecision = 'accepted' | 'revision' | 'rejected' | 'predatory' | null;

export interface SubmissionJournal {
  id?: string;
  submission_id?: string;
  journal_order: 1 | 2 | 3;
  journal_name: string;
  issn: string;
  quartile: string;
  journal_url?: string;
  decision?: JournalDecision;
  rejection_reasons?: string[];
  reviewer_comment?: string;
}

export interface Submission {
  id: string;
  code: string;
  request_token: string;
  resident_id: string;
  resident_name?: string;
  resident_nim?: string;
  program_ppds?: string;
  article_type: string;
  article_title: string;
  article_abstract: string;
  supervisor_name: string;
  status: SubmissionStatus;
  assigned_reviewer_id?: string | null;
  assigned_reviewer_name?: string | null;
  assignment_source?: string;
  assigned_at?: string | null;
  submitted_at: string;
  completed_at?: string | null;
  loa_generated_at?: string | null;
  loa_document_number?: string | null;
  journals: SubmissionJournal[];
  created_at: string;
  updated_at: string;
}

export interface RestrictedJournal {
  id: string;
  journal_name: string;
  issn: string;
  normalized_name: string;
  normalized_issn: string;
  source: string;
  source_reference?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  removed_at?: string | null;
}
