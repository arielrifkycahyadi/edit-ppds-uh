'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge, DecisionBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { Submission, SubmissionStatus, UserProfile } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  UserCheck,
  Trash2,
  Eye,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [reviewers, setReviewers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modals state
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [assigningSubmission, setAssigningSubmission] = useState<Submission | null>(null);
  const [selectedReviewerId, setSelectedReviewerId] = useState('');
  const [deletingSubmission, setDeletingSubmission] = useState<Submission | null>(null);

  const loadData = () => {
    setSubmissions(DataService.getSubmissions());
    setReviewers(DataService.getUsers('reviewer').filter(r => r.is_active));
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.resident_name && sub.resident_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (sub.resident_nim && sub.resident_nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sub.article_title.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalSubmissions = submissions.length;
  const waitingCount = submissions.filter((s) => s.status === 'waiting').length;
  const inReviewCount = submissions.filter((s) => s.status === 'in_review').length;
  const completedCount = submissions.filter((s) => s.status === 'completed').length;

  const handleAssignReviewer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningSubmission || !selectedReviewerId) return;

    DataService.assignReviewer(assigningSubmission.id, selectedReviewerId, 'admin_assigned');
    setAssigningSubmission(null);
    setSelectedReviewerId('');
    loadData();
  };

  const handleDelete = () => {
    if (!deletingSubmission) return;
    DataService.deleteSubmission(deletingSubmission.id);
    setDeletingSubmission(null);
    loadData();
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Dashboard Administrator"
        subtitle="Sistem Informasi Pelayanan Administrasi Tugas Akhir & Publikasi Jurnal PPDS FK UNHAS"
        actions={
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Refresh Data</span>
          </button>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pengajuan</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-display">{totalSubmissions}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Semua usulan artikel</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#800000] flex items-center justify-center border border-red-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Menunggu Pemeriksaan</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1 font-display">{waitingCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Belum ada Reviewer</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Sedang Diperiksa</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1 font-display">{inReviewCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Ditangani Reviewer</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Selesai / LoA Terbit</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-display">{completedCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Telah disetujui</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Submissions Control Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari kode, nama residen, NIM, judul..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] focus:border-[#800000] outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-[#800000] outline-none"
              >
                <option value="all">Semua Status</option>
                <option value="waiting">Menunggu Pemeriksaan</option>
                <option value="in_review">Sedang Diperiksa</option>
                <option value="completed">Selesai</option>
                <option value="rejected">Tidak Layak</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Menampilkan <span className="text-slate-900 font-bold">{filteredSubmissions.length}</span> dari {totalSubmissions} pengajuan
            </div>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal</th>
                  <th className="py-3.5 px-4">Residen & Program</th>
                  <th className="py-3.5 px-4">Judul Artikel</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Reviewer</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data pengajuan yang cocok.</p>
                      <p className="text-[11px] text-slate-400">Silakan sesuaikan kata kunci pencarian atau filter status.</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#800000] text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          {sub.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(sub.submitted_at)}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{sub.resident_name || 'Residen'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{sub.resident_nim || '-'}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium inline-block mt-0.5">
                          {sub.program_ppds || '-'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 line-clamp-2" title={sub.article_title}>
                          {sub.article_title}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pembimbing: {sub.supervisor_name}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={sub.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        {sub.assigned_reviewer_name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {sub.assigned_reviewer_name[0]}
                            </span>
                            <span className="font-medium text-slate-700 text-xs line-clamp-1">
                              {sub.assigned_reviewer_name}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setAssigningSubmission(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px] hover:bg-amber-100 transition-colors shadow-sm"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Tugaskan Reviewer</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedSubmission(sub)}
                            title="Lihat Detail & 3 Jurnal Kandidat"
                            className="p-1.5 text-slate-500 hover:text-[#800000] hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {sub.status === 'waiting' && (
                            <button
                              onClick={() => setAssigningSubmission(sub)}
                              title="Tugaskan Reviewer"
                              className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => setDeletingSubmission(sub)}
                            title="Hapus Pengajuan Permanen"
                            className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={`Detail Pengajuan: ${selectedSubmission.code}`}
          subtitle={`Diajukan pada ${formatDate(selectedSubmission.submitted_at)}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Meta Resident */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Nama Mahasiswa</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedSubmission.resident_name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">NIM</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{selectedSubmission.resident_nim}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Program Studi</p>
                <p className="font-medium text-slate-800 mt-0.5">{selectedSubmission.program_ppds}</p>
              </div>
              <div>
                <p className="text-slate-400 font-bold uppercase text-[10px]">Status Pengajuan</p>
                <div className="mt-0.5">
                  <StatusBadge status={selectedSubmission.status} />
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Judul Naskah Artikel</p>
                <h4 className="text-base font-bold text-slate-900 mt-1">{selectedSubmission.article_title}</h4>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dosen Pembimbing</p>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">{selectedSubmission.supervisor_name}</p>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Abstrak Artikel</p>
                <p className="text-xs text-slate-600 leading-relaxed mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-justify">
                  {selectedSubmission.article_abstract}
                </p>
              </div>
            </div>

            {/* Candidate Journals (3 Jurnal) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#800000] flex items-center gap-1.5">
                  <Layers className="w-4 h-4" />
                  <span>Daftar 3 Jurnal Kandidat Usulan</span>
                </h5>
              </div>

              <div className="space-y-3">
                {selectedSubmission.journals.map((j) => (
                  <div key={j.journal_order} className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#800000] text-white font-bold text-[10px] flex items-center justify-center">
                            {j.journal_order}
                          </span>
                          <h6 className="font-bold text-slate-900 text-sm">{j.journal_name}</h6>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span>ISSN: <strong className="font-mono text-slate-700">{j.issn}</strong></span>
                          <span>•</span>
                          <span>Kuartil: <strong className="text-slate-700">{j.quartile}</strong></span>
                          {j.journal_url && (
                            <>
                              <span>•</span>
                              <a
                                href={j.journal_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                <span>Laman Resmi</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>

                      <DecisionBadge decision={j.decision} />
                    </div>

                    {j.reviewer_comment && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
                        <strong>Catatan Reviewer:</strong> "{j.reviewer_comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ASSIGN REVIEWER MODAL */}
      {assigningSubmission && (
        <Modal
          isOpen={!!assigningSubmission}
          onClose={() => setAssigningSubmission(null)}
          title="Penugasan Reviewer Jurnal"
          subtitle={`Kode Pengajuan: ${assigningSubmission.code}`}
          maxWidth="md"
        >
          <form onSubmit={handleAssignReviewer} className="space-y-4">
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
              Pengajuan ini akan langsung dialihkan ke status <strong>Sedang Diperiksa</strong> dan masuk ke daftar pemeriksaan Reviewer yang dipilih.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                Pilih Dosen / Reviewer Jurnal
              </label>
              <select
                required
                value={selectedReviewerId}
                onChange={(e) => setSelectedReviewerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
              >
                <option value="">-- Pilih Reviewer --</option>
                {reviewers.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.full_name} ({r.department || 'FK UNHAS'}) - Selesai: {r.completed_reviews || 0}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAssigningSubmission(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={!selectedReviewerId}
                className="px-4 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a020a] rounded-xl transition-colors shadow-md disabled:opacity-50"
              >
                Konfirmasi Penugasan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingSubmission && (
        <Modal
          isOpen={!!deletingSubmission}
          onClose={() => setDeletingSubmission(null)}
          title="Konfirmasi Hapus Pengajuan"
          subtitle={`Kode: ${deletingSubmission.code}`}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data pengajuan <strong>{deletingSubmission.code}</strong> milik{' '}
              <strong>{deletingSubmission.resident_name}</strong> secara permanen?
            </p>
            <p className="text-[11px] text-red-600 font-semibold">
              Tindakan ini bersifat permanen (hard delete) dan tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingSubmission(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-md"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
