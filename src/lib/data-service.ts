import { UserProfile, Submission, RestrictedJournal, JournalDecision } from './types';
import { normalizeJournalName, normalizeISSN, generateSubmissionCode } from './utils';
import { supabase, isSupabaseConfigured } from './supabase/client';

// Initial Mock / Seed State
const SEED_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    role: 'admin',
    nim_nip: '197805122005011002',
    full_name: 'Dr. dr. Andi Muhammad Fachry, Sp.PD-KGEH',
    email: 'admin.sipatuju@med.unhas.ac.id',
    phone: '08114123456',
    department: 'Sekretariat PPDS FK UNHAS',
    is_active: true,
    last_login_at: new Date().toISOString(),
    created_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-rev-01',
    role: 'reviewer',
    nim_nip: '198203152008121001',
    full_name: 'Prof. Dr. dr. Syahrul Rauf, Sp.OG(K)',
    email: 'syahrul.rauf@med.unhas.ac.id',
    phone: '081242998877',
    department: 'Departemen Obstetri & Ginekologi',
    is_active: true,
    last_login_at: '2026-09-28T14:20:00Z',
    created_at: '2026-01-15T09:00:00Z',
    active_reviews: 1,
    completed_reviews: 14,
  },
  {
    id: 'usr-rev-02',
    role: 'reviewer',
    nim_nip: '198511202010122003',
    full_name: 'Dr. dr. Ratna Dewi Artati, Sp.A(K)',
    email: 'ratnadewi@med.unhas.ac.id',
    phone: '081355667788',
    department: 'Departemen Ilmu Kesehatan Anak',
    is_active: true,
    last_login_at: '2026-09-29T10:15:00Z',
    created_at: '2026-02-01T10:00:00Z',
    active_reviews: 0,
    completed_reviews: 9,
  },
  {
    id: 'usr-res-01',
    role: 'residen',
    nim_nip: 'C104212001',
    full_name: 'dr. Ahmad Fauzi Ramadhan',
    email: 'ahmad.fauzi@pasca.unhas.ac.id',
    phone: '082188990011',
    program_ppds: 'Ilmu Penyakit Dalam',
    is_active: true,
    last_login_at: new Date().toISOString(),
    created_at: '2026-02-15T11:00:00Z',
    total_submissions: 2,
  },
  {
    id: 'usr-res-02',
    role: 'residen',
    nim_nip: 'C104212002',
    full_name: 'dr. Siti Nurhaliza Mansyur',
    email: 'siti.nurhaliza@pasca.unhas.ac.id',
    phone: '085299443322',
    program_ppds: 'Anestesiologi dan Terapi Intensif',
    is_active: true,
    last_login_at: '2026-09-27T16:45:00Z',
    created_at: '2026-02-20T13:00:00Z',
    total_submissions: 1,
  },
  {
    id: 'usr-res-03',
    role: 'residen',
    nim_nip: 'C104212003',
    full_name: 'dr. Kevin Pratama Putra',
    email: 'kevin.pratama@pasca.unhas.ac.id',
    phone: '081299112233',
    program_ppds: 'Obstetri dan Ginekologi',
    is_active: true,
    last_login_at: '2026-09-29T08:30:00Z',
    created_at: '2026-03-01T09:00:00Z',
    total_submissions: 1,
  }
];

const SEED_RESTRICTED_JOURNALS: RestrictedJournal[] = [
  {
    id: 'rj-01',
    journal_name: 'International Journal of Advance Medical Sciences',
    issn: '2349-512X',
    normalized_name: normalizeJournalName('International Journal of Advance Medical Sciences'),
    normalized_issn: normalizeISSN('2349-512X'),
    source: 'Bealls List',
    source_reference: 'Predatory publisher blacklist 2026',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'rj-02',
    journal_name: 'Journal of Medical Case Studies and Research',
    issn: '2277-4998',
    normalized_name: normalizeJournalName('Journal of Medical Case Studies and Research'),
    normalized_issn: normalizeISSN('2277-4998'),
    source: 'Discontinued Scopus',
    source_reference: 'Scopus Discontinued list 2025',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'rj-03',
    journal_name: 'Global Journal of Health Science & Clinical Practice',
    issn: '1916-9736',
    normalized_name: normalizeJournalName('Global Journal of Health Science & Clinical Practice'),
    normalized_issn: normalizeISSN('1916-9736'),
    source: 'Predatory Guard',
    source_reference: 'Predatory journal criteria FK UNHAS',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'rj-04',
    journal_name: 'Archives of Pharmacy and Biological Sciences',
    issn: '2320-5679',
    normalized_name: normalizeJournalName('Archives of Pharmacy and Biological Sciences'),
    normalized_issn: normalizeISSN('2320-5679'),
    source: 'Discontinued Scopus',
    source_reference: 'Discontinued due to publication malpractice',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  },
  {
    id: 'rj-05',
    journal_name: 'World Journal of Medical Research and Review',
    issn: '2581-9984',
    normalized_name: normalizeJournalName('World Journal of Medical Research and Review'),
    normalized_issn: normalizeISSN('2581-9984'),
    source: 'Bealls List',
    source_reference: 'Hijacked journal clone',
    is_active: true,
    created_at: '2026-01-01T00:00:00Z'
  }
];

const SEED_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-01',
    code: 'SPJ-20260920-1042',
    request_token: 'tok-9f8e7d6c5b4a',
    resident_id: 'usr-res-01',
    resident_name: 'dr. Ahmad Fauzi Ramadhan',
    resident_nim: 'C104212001',
    program_ppds: 'Ilmu Penyakit Dalam',
    article_type: 'Original Article',
    article_title: 'Korelasi Kadar Serum Ferritin dan Interleukin-6 dengan Tingkat Keparahan Pasien Sepsis di RSUP Dr. Wahidin Sudirohusodo',
    article_abstract: 'Sepsis merupakan sindrom klinis yang mengancam jiwa dengan respons disregulasi terhadap infeksi. Penelitian observasional analitik potong lintang ini bertujuan untuk menganalisis hubungan kadar serum ferritin dan IL-6 terhadap skor SOFA pada 84 pasien sepsis dewasa. Hasil penelitian menunjukkan korelasi positif yang signifikan (p < 0.001) antara peningkatan biomarker inflamasi dengan mortalitas 28 hari.',
    supervisor_name: 'Prof. Dr. dr. H. Haerani Rasyid, M.Kes, Sp.PD-KGH, Sp.GK, FINASIM',
    status: 'completed',
    assigned_reviewer_id: 'usr-rev-01',
    assigned_reviewer_name: 'Prof. Dr. dr. Syahrul Rauf, Sp.OG(K)',
    assignment_source: 'self_claimed',
    assigned_at: '2026-09-21T10:00:00Z',
    submitted_at: '2026-09-20T14:30:00Z',
    completed_at: '2026-09-22T11:15:00Z',
    loa_generated_at: '2026-09-22T11:15:00Z',
    loa_document_number: '1042/UN4.6.8/PPDS/LOA/2026',
    created_at: '2026-09-20T14:30:00Z',
    updated_at: '2026-09-22T11:15:00Z',
    journals: [
      {
        journal_order: 1,
        journal_name: 'Indonesian Journal of Internal Medicine (Acta Medica Indonesiana)',
        issn: '0125-9326',
        quartile: 'Q2',
        journal_url: 'https://actamedindones.org',
        decision: 'accepted',
        rejection_reasons: [],
        reviewer_comment: 'Jurnal bereputasi tinggi, terindeks Scopus Q2. Scope dan metodologi artikel sangat relevan dengan edisi terbitan mendatang.'
      },
      {
        journal_order: 2,
        journal_name: 'Medical Journal of Indonesia',
        issn: '2252-8083',
        quartile: 'Q3',
        journal_url: 'https://mji.ui.ac.id',
        decision: 'accepted',
        rejection_reasons: [],
        reviewer_comment: 'Sesuai dengan kriteria tugas akhir PPDS FK UNHAS, reputasi terpercaya.'
      },
      {
        journal_order: 3,
        journal_name: 'Bali Medical Journal',
        issn: '2089-1180',
        quartile: 'Q4',
        journal_url: 'https://balimedicaljournal.org',
        decision: 'revision',
        rejection_reasons: [],
        reviewer_comment: 'Disarankan melakukan penyempurnaan format referensi Vancouver sebelum pengiriman naskah.'
      }
    ]
  },
  {
    id: 'sub-02',
    code: 'SPJ-20260927-1043',
    request_token: 'tok-1a2b3c4d5e6f',
    resident_id: 'usr-res-02',
    resident_name: 'dr. Siti Nurhaliza Mansyur',
    resident_nim: 'C104212002',
    program_ppds: 'Anestesiologi dan Terapi Intensif',
    article_type: 'Systematic Review / Meta-Analysis',
    article_title: 'Efektivitas Penggunaan Dexmedetomidine terhadap Hemodinamik Pasca Kraniotomi: Tinjauan Sistematis dan Meta-Analisis',
    article_abstract: 'Stabilitas hemodinamik perioperatif sangat penting untuk meminimalkan komplikasi sekunder pada bedah saraf. Meta-analisis ini meninjau 12 uji klinis acak (RCT) yang melibatkan 920 pasien untuk membandingkan luaran kontrol tekanan darah rata-rata dan kebutuhan opioid pascaoperasi.',
    supervisor_name: 'Dr. dr. Syafri Kamsul Arif, Sp.An-KIC, KAO',
    status: 'in_review',
    assigned_reviewer_id: 'usr-rev-01',
    assigned_reviewer_name: 'Prof. Dr. dr. Syahrul Rauf, Sp.OG(K)',
    assignment_source: 'admin_assigned',
    assigned_at: '2026-09-28T09:00:00Z',
    submitted_at: '2026-09-27T11:20:00Z',
    created_at: '2026-09-27T11:20:00Z',
    updated_at: '2026-09-28T09:00:00Z',
    journals: [
      {
        journal_order: 1,
        journal_name: 'Journal of Neuroanaesthesiology and Critical Care',
        issn: '2348-0548',
        quartile: 'Q3',
        journal_url: 'https://www.thieme-connect.com/products/ejournals/journal/10.1055/s-00028723',
        decision: null,
      },
      {
        journal_order: 2,
        journal_name: 'Anaesthesia, Pain & Intensive Care',
        issn: '1607-8322',
        quartile: 'Q4',
        journal_url: 'https://apicareonline.com',
        decision: null,
      },
      {
        journal_order: 3,
        journal_name: 'Jurnal Anestesiologi Indonesia',
        issn: '2085-7802',
        quartile: 'Sinta 2',
        journal_url: 'https://ejournal.undip.ac.id/index.php/janesti',
        decision: null,
      }
    ]
  },
  {
    id: 'sub-03',
    code: 'SPJ-20260929-1044',
    request_token: 'tok-7a8b9c0d1e2f',
    resident_id: 'usr-res-03',
    resident_name: 'dr. Kevin Pratama Putra',
    resident_nim: 'C104212003',
    program_ppds: 'Obstetri dan Ginekologi',
    article_type: 'Case Report',
    article_title: 'Tatalaksana Konservatif Kehamilan Abdominal Sekunder Usia Gestasi 24 Minggu dengan Kelahiran Janin Viabel',
    article_abstract: 'Kehamilan abdominal merupakan entitas langka dari kehamilan ektopik dengan morbiditas maternal yang sangat tinggi. Laporan kasus ini mendeskripsikan diagnosis antenatal menggunakan ultrasonografi resolusi tinggi dan MRI serta keberhasilan tatalaksana multidisiplin.',
    supervisor_name: 'Dr. dr. Nugraha Utama Pelupessy, Sp.OG, Subsp. Obginsos',
    status: 'waiting',
    assigned_reviewer_id: null,
    submitted_at: '2026-09-29T08:30:00Z',
    created_at: '2026-09-29T08:30:00Z',
    updated_at: '2026-09-29T08:30:00Z',
    journals: [
      {
        journal_order: 1,
        journal_name: 'Case Reports in Obstetrics and Gynecology',
        issn: '2090-6684',
        quartile: 'Scopus',
        journal_url: 'https://www.hindawi.com/journals/criog/',
        decision: null,
      },
      {
        journal_order: 2,
        journal_name: 'International Journal of Surgery Case Reports',
        issn: '2210-2612',
        quartile: 'Q3',
        journal_url: 'https://www.sciencedirect.com/journal/international-journal-of-surgery-case-reports',
        decision: null,
      },
      {
        journal_order: 3,
        journal_name: 'Indonesian Journal of Obstetrics and Gynecology',
        issn: '2338-6401',
        quartile: 'Sinta 1',
        journal_url: 'https://inajog.com',
        decision: null,
      }
    ]
  }
];

// In-Memory / LocalStorage Storage Keys
const STORAGE_KEY_USER = 'sipatuju_current_user_v2';
const STORAGE_KEY_SUBMISSIONS = 'sipatuju_submissions_v2';
const STORAGE_KEY_USERS = 'sipatuju_users_v2';
const STORAGE_KEY_RESTRICTED = 'sipatuju_restricted_journals_v2';

export class DataService {
  private static isBrowser = typeof window !== 'undefined';

  // Current User Session
  static getCurrentUser(): UserProfile {
    if (!this.isBrowser) return SEED_USERS[0]; // default admin for SSR
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    // Default to admin initially
    this.setCurrentUser(SEED_USERS[0]);
    return SEED_USERS[0];
  }

  static setCurrentUser(user: UserProfile): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    }
  }

  static switchUserByRole(role: 'admin' | 'reviewer' | 'residen'): UserProfile {
    const users = this.getUsers();
    const found = users.find(u => u.role === role && u.is_active);
    if (found) {
      this.setCurrentUser(found);
      return found;
    }
    return this.getCurrentUser();
  }

  // Submissions Data
  static getSubmissions(): Submission[] {
    if (!this.isBrowser) return SEED_SUBMISSIONS;
    const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(SEED_SUBMISSIONS));
    return SEED_SUBMISSIONS;
  }

  static getSubmissionById(id: string): Submission | undefined {
    const subs = this.getSubmissions();
    return subs.find(s => s.id === id || s.code === id);
  }

  static createSubmission(data: {
    resident_id: string;
    resident_name: string;
    resident_nim: string;
    program_ppds: string;
    article_type: string;
    article_title: string;
    article_abstract: string;
    supervisor_name: string;
    journals: {
      journal_name: string;
      issn: string;
      quartile: string;
      journal_url?: string;
    }[];
  }): Submission {
    const subs = this.getSubmissions();
    const newCode = generateSubmissionCode();
    const now = new Date().toISOString();

    const newSub: Submission = {
      id: 'sub-' + Date.now(),
      code: newCode,
      request_token: 'tok-' + Math.random().toString(36).substring(2, 12),
      resident_id: data.resident_id,
      resident_name: data.resident_name,
      resident_nim: data.resident_nim,
      program_ppds: data.program_ppds,
      article_type: data.article_type,
      article_title: data.article_title,
      article_abstract: data.article_abstract,
      supervisor_name: data.supervisor_name,
      status: 'waiting',
      assigned_reviewer_id: null,
      submitted_at: now,
      created_at: now,
      updated_at: now,
      journals: data.journals.map((j, idx) => ({
        journal_order: (idx + 1) as 1 | 2 | 3,
        journal_name: j.journal_name,
        issn: j.issn,
        quartile: j.quartile,
        journal_url: j.journal_url || '',
        decision: null,
        rejection_reasons: [],
        reviewer_comment: ''
      }))
    };

    const updated = [newSub, ...subs];
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(updated));
    }

    // Update resident submission count
    const users = this.getUsers();
    const uIdx = users.findIndex(u => u.id === data.resident_id);
    if (uIdx !== -1) {
      users[uIdx].total_submissions = (users[uIdx].total_submissions || 0) + 1;
      this.saveUsers(users);
    }

    return newSub;
  }

  static assignReviewer(submissionId: string, reviewerId: string, source: 'admin_assigned' | 'self_claimed' = 'admin_assigned'): boolean {
    const subs = this.getSubmissions();
    const users = this.getUsers();
    const reviewer = users.find(u => u.id === reviewerId);
    if (!reviewer) return false;

    const sIdx = subs.findIndex(s => s.id === submissionId);
    if (sIdx === -1) return false;

    subs[sIdx].assigned_reviewer_id = reviewer.id;
    subs[sIdx].assigned_reviewer_name = reviewer.full_name;
    subs[sIdx].assignment_source = source;
    subs[sIdx].assigned_at = new Date().toISOString();
    subs[sIdx].status = 'in_review';
    subs[sIdx].updated_at = new Date().toISOString();

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subs));
    }
    return true;
  }

  static submitReview(
    submissionId: string,
    reviewerId: string,
    decisions: {
      journal_order: 1 | 2 | 3;
      decision: JournalDecision;
      rejection_reasons?: string[];
      reviewer_comment: string;
    }[]
  ): boolean {
    const subs = this.getSubmissions();
    const sIdx = subs.findIndex(s => s.id === submissionId);
    if (sIdx === -1) return false;

    const sub = subs[sIdx];
    const now = new Date().toISOString();

    // Update candidate journals decisions
    decisions.forEach(d => {
      const jIdx = sub.journals.findIndex(j => j.journal_order === d.journal_order);
      if (jIdx !== -1) {
        sub.journals[jIdx].decision = d.decision;
        sub.journals[jIdx].rejection_reasons = d.rejection_reasons || [];
        sub.journals[jIdx].reviewer_comment = d.reviewer_comment;
      }
    });

    // Determine overall status
    const hasAccepted = decisions.some(d => d.decision === 'accepted' || d.decision === 'revision');
    sub.status = hasAccepted ? 'completed' : 'rejected';
    sub.completed_at = now;
    sub.updated_at = now;
    if (hasAccepted) {
      sub.loa_generated_at = now;
      sub.loa_document_number = `${Math.floor(1000 + Math.random() * 9000)}/UN4.6.8/PPDS/LOA/${new Date().getFullYear()}`;
    }

    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(subs));
    }

    // Update reviewer completed count
    const users = this.getUsers();
    const rIdx = users.findIndex(u => u.id === reviewerId);
    if (rIdx !== -1) {
      users[rIdx].completed_reviews = (users[rIdx].completed_reviews || 0) + 1;
      this.saveUsers(users);
    }

    return true;
  }

  static deleteSubmission(submissionId: string): boolean {
    const subs = this.getSubmissions();
    const filtered = subs.filter(s => s.id !== submissionId);
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(filtered));
    }
    return true;
  }

  // Users Management
  static getUsers(role?: 'admin' | 'reviewer' | 'residen'): UserProfile[] {
    let users = SEED_USERS;
    if (this.isBrowser) {
      const stored = localStorage.getItem(STORAGE_KEY_USERS);
      if (stored) {
        try {
          users = JSON.parse(stored);
        } catch (e) {
          console.error(e);
        }
      } else {
        localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(SEED_USERS));
      }
    }
    if (role) {
      return users.filter(u => u.role === role);
    }
    return users;
  }

  private static saveUsers(users: UserProfile[]): void {
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
    }
  }

  static saveUser(user: Partial<UserProfile> & { nim_nip: string; full_name: string; email: string; role: 'residen' | 'reviewer' }): UserProfile {
    const users = this.getUsers();
    const now = new Date().toISOString();
    
    if (user.id) {
      // Edit
      const idx = users.findIndex(u => u.id === user.id);
      if (idx !== -1) {
        users[idx] = {
          ...users[idx],
          ...user,
        };
        this.saveUsers(users);
        return users[idx];
      }
    }

    // New
    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      role: user.role,
      nim_nip: user.nim_nip,
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      program_ppds: user.program_ppds || '',
      department: user.department || '',
      is_active: user.is_active !== undefined ? user.is_active : true,
      created_at: now,
      total_submissions: 0,
      active_reviews: 0,
      completed_reviews: 0,
    };
    users.unshift(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static toggleUserActive(userId: string): boolean {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].is_active = !users[idx].is_active;
      this.saveUsers(users);
      return true;
    }
    return false;
  }

  static deleteUser(userId: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== userId);
    this.saveUsers(filtered);
    return true;
  }

  // Restricted Journals Guard
  static getRestrictedJournals(): RestrictedJournal[] {
    if (!this.isBrowser) return SEED_RESTRICTED_JOURNALS;
    const stored = localStorage.getItem(STORAGE_KEY_RESTRICTED);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error(e);
      }
    }
    localStorage.setItem(STORAGE_KEY_RESTRICTED, JSON.stringify(SEED_RESTRICTED_JOURNALS));
    return SEED_RESTRICTED_JOURNALS;
  }

  static addRestrictedJournal(journal_name: string, issn: string, source: string = 'Manual Admin', source_reference?: string): RestrictedJournal {
    const list = this.getRestrictedJournals();
    const newEntry: RestrictedJournal = {
      id: 'rj-' + Date.now(),
      journal_name,
      issn,
      normalized_name: normalizeJournalName(journal_name),
      normalized_issn: normalizeISSN(issn),
      source,
      source_reference: source_reference || 'Didaftarkan oleh Tim Admin PPDS',
      is_active: true,
      created_at: new Date().toISOString()
    };
    const updated = [newEntry, ...list];
    if (this.isBrowser) {
      localStorage.setItem(STORAGE_KEY_RESTRICTED, JSON.stringify(updated));
    }
    return newEntry;
  }

  static toggleRestrictedJournal(id: string): boolean {
    const list = this.getRestrictedJournals();
    const idx = list.findIndex(r => r.id === id);
    if (idx !== -1) {
      list[idx].is_active = !list[idx].is_active;
      if (!list[idx].is_active) {
        list[idx].removed_at = new Date().toISOString();
      } else {
        list[idx].removed_at = null;
      }
      if (this.isBrowser) {
        localStorage.setItem(STORAGE_KEY_RESTRICTED, JSON.stringify(list));
      }
      return true;
    }
    return false;
  }

  static checkPredatoryJournal(name: string, issn: string): { isRestricted: boolean; match?: RestrictedJournal } {
    const list = this.getRestrictedJournals().filter(r => r.is_active);
    const normName = normalizeJournalName(name);
    const normIssn = normalizeISSN(issn);

    const match = list.find(r => {
      const matchName = normName && r.normalized_name && (r.normalized_name === normName || normName.includes(r.normalized_name) || r.normalized_name.includes(normName));
      const matchIssn = normIssn && r.normalized_issn && r.normalized_issn === normIssn;
      return matchName || matchIssn;
    });

    return {
      isRestricted: !!match,
      match
    };
  }
}
