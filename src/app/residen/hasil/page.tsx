'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge, DecisionBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { Submission } from '@/lib/types';
import { formatDate, formatDateOnly } from '@/lib/utils';
import { generateLoAPDF } from '@/components/pdf/LoAGenerator';
import {
  FileCheck2,
  Download,
  Eye,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowLeft,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ResidenHasilPemeriksaanPage() {
  const [currentUser, setCurrentUser] = useState(DataService.getCurrentUser());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [downloadingLoA, setDownloadingLoA] = useState(false);

  useEffect(() => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);
    const all = DataService.getSubmissions();
    const my = all.filter((s) => s.resident_id === user.id || s.resident_nim === user.nim_nip);
    setSubmissions(my);
  }, []);

  const handleDownloadPDF = async (sub: Submission) => {
    setDownloadingLoA(true);
    try {
      await generateLoAPDF(sub);
    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan Surat Persetujuan PDF.');
    } finally {
      setDownloadingLoA(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.article_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Hasil Pemeriksaan & Verifikasi Jurnal"
        subtitle="Pantau keputusan tim telaah dan unduh Surat Keterangan Kelayakan Publikasi (LoA)"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Table Card */}
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
                  placeholder="Cari kode pengajuan atau judul naskah..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
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
                <option value="completed">Selesai / Layak</option>
                <option value="rejected">Tidak Layak</option>
              </select>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Total <span className="text-slate-900 font-bold">{filtered.length}</span> Pengajuan
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal</th>
                  <th className="py-3.5 px-4">Judul Naskah Artikel</th>
                  <th className="py-3.5 px-4">Status Pengajuan</th>
                  <th className="py-3.5 px-4">Keputusan 3 Jurnal</th>
                  <th className="py-3.5 px-4 text-right">Surat & Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada data hasil pemeriksaan.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => {
                    const isCompleted = sub.status === 'completed';

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="font-mono font-bold text-[#800000] text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                            {sub.code}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1">{formatDate(sub.submitted_at)}</p>
                        </td>

                        <td className="py-3.5 px-4 max-w-md">
                          <p className="font-bold text-slate-900 line-clamp-2">{sub.article_title}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Pembimbing: {sub.supervisor_name}</p>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <StatusBadge status={sub.status} />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {sub.journals.map((j) => (
                              <div key={j.journal_order} className="flex items-center gap-1.5 text-[11px]">
                                <span className="font-bold text-slate-400">J{j.journal_order}:</span>
                                <span className="truncate max-w-[140px] text-slate-700">{j.journal_name}</span>
                                <DecisionBadge decision={j.decision} className="text-[10px] py-0 px-1.5" />
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {isCompleted && (
                              <button
                                onClick={() => handleDownloadPDF(sub)}
                                disabled={downloadingLoA}
                                title="Unduh Surat Persetujuan (LoA) Resmi PDF"
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Unduh Surat (PDF)</span>
                              </button>
                            )}

                            <button
                              onClick={() => setSelectedSub(sub)}
                              title="Lihat Detail Telaah"
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#800000] font-bold text-xs transition-colors inline-flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Detail</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* DETAIL MODAL */}
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Hasil Telaah: ${selectedSub.code}`}
          subtitle={`Tanggal Pengajuan: ${formatDate(selectedSub.submitted_at)}`}
          maxWidth="4xl"
        >
          <div className="space-y-6">
            {/* Status Header */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Status Keseluruhan</p>
                <div className="mt-1">
                  <StatusBadge status={selectedSub.status} />
                </div>
              </div>
              {selectedSub.status === 'completed' && (
                <button
                  onClick={() => handleDownloadPDF(selectedSub)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-md inline-flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Surat Keterangan (PDF)</span>
                </button>
              )}
            </div>

            {/* Article Info */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase">Judul Naskah</p>
              <h4 className="text-base font-bold text-slate-900">{selectedSub.article_title}</h4>
              <p className="text-xs text-slate-600">Dosen Pembimbing: <strong>{selectedSub.supervisor_name}</strong></p>
            </div>

            {/* 3 Candidate Journals Decisions */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-[#800000] mb-3 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>Keputusan Kelayakan Tiap Jurnal</span>
              </h5>

              <div className="space-y-3">
                {selectedSub.journals.map((j) => (
                  <div
                    key={j.journal_order}
                    className={`p-4 rounded-2xl border transition-all ${
                      j.decision === 'accepted' || j.decision === 'revision'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : j.decision === 'rejected' || j.decision === 'predatory'
                        ? 'bg-rose-50/50 border-rose-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#800000] text-white font-bold text-[10px] flex items-center justify-center">
                            {j.journal_order}
                          </span>
                          <h6 className="font-bold text-slate-900 text-sm">{j.journal_name}</h6>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 font-mono">
                          ISSN: <strong>{j.issn}</strong> | Kuartil: <strong>{j.quartile}</strong>
                        </p>
                      </div>

                      <DecisionBadge decision={j.decision} />
                    </div>

                    {j.reviewer_comment ? (
                      <div className="mt-3 p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 italic">
                        <strong className="text-slate-900 not-italic">Catatan Telaah Reviewer:</strong> "{j.reviewer_comment}"
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-slate-400 italic">Belum ada catatan telaah.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
