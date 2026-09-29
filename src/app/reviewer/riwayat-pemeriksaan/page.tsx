'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge, DecisionBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { Submission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  History,
  Search,
  Eye,
  CheckCircle2,
  ExternalLink,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ReviewerRiwayatPemeriksaanPage() {
  const [currentUser, setCurrentUser] = useState(DataService.getCurrentUser());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  useEffect(() => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);
    const all = DataService.getSubmissions();
    setSubmissions(
      all.filter(
        (s) =>
          (s.status === 'completed' || s.status === 'rejected') &&
          s.assigned_reviewer_id === user.id
      )
    );
  }, []);

  const filtered = submissions.filter((s) => {
    return (
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.resident_name && s.resident_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.resident_nim && s.resident_nim.toLowerCase().includes(searchQuery.toLowerCase())) ||
      s.article_title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Riwayat Pemeriksaan Selesai"
        subtitle="Arsip seluruh penelaahan jurnal yang telah selesai Anda telaah dan terbitkan keputusannya"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kode, nama residen, atau judul..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
              />
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Total <span className="text-emerald-700 font-bold">{filtered.length}</span> Naskah Telah Selesai
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal Selesai</th>
                  <th className="py-3.5 px-4">Residen & Program</th>
                  <th className="py-3.5 px-4">Judul Naskah Artikel</th>
                  <th className="py-3.5 px-4">Keputusan 3 Jurnal</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Belum ada riwayat penelaahan selesai.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#800000] text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          {sub.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(sub.completed_at || sub.updated_at)}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{sub.resident_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{sub.resident_nim}</p>
                        <p className="text-[10px] text-slate-400">{sub.program_ppds}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 line-clamp-2">{sub.article_title}</p>
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
                        <button
                          onClick={() => setSelectedSub(sub)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#800000] font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Detail Telaah</span>
                        </button>
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
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Detail Hasil Telaah: ${selectedSub.code}`}
          subtitle={`Diselesaikan pada ${formatDate(selectedSub.completed_at || selectedSub.updated_at)}`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Judul Naskah</p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedSub.article_title}</h4>
              <p className="text-slate-500 mt-0.5">Residen: {selectedSub.resident_name} ({selectedSub.resident_nim})</p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Keputusan Telaah 3 Jurnal</p>
              <div className="space-y-2">
                {selectedSub.journals.map((j) => (
                  <div key={j.journal_order} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-900">{j.journal_order}. {j.journal_name}</p>
                      <DecisionBadge decision={j.decision} />
                    </div>
                    {j.reviewer_comment && (
                      <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                        "{j.reviewer_comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
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
