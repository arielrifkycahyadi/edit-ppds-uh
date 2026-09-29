'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { DataService } from '@/lib/data-service';
import { Submission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Inbox,
  Search,
  Eye,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  HandMetal
} from 'lucide-react';

export default function ReviewerPengajuanTersediaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(DataService.getCurrentUser());
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  const loadData = () => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);
    const all = DataService.getSubmissions();
    setSubmissions(all.filter((s) => s.status === 'waiting'));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = (subId: string) => {
    const success = DataService.assignReviewer(subId, currentUser.id, 'self_claimed');
    if (success) {
      router.push(`/reviewer/pemeriksaan-jurnal/${subId}`);
    }
  };

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
        title="Antrean Pengajuan Tersedia"
        subtitle="Daftar usulan naskah Residen yang belum memiliki Reviewer dan dapat Anda ambil untuk ditelaah"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3.5 shadow-sm">
          <Inbox className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <p className="font-bold text-amber-950">Pengambilan Naskah Secara Mandiri (Self-Claim):</p>
            <p className="mt-0.5">
              Klik tombol <strong>"Ambil Pemeriksaan"</strong> pada salah satu pengajuan untuk langsung menugaskan diri Anda sebagai penelaah resmi naskah tersebut.
            </p>
          </div>
        </div>

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
              Tersedia <span className="text-amber-700 font-bold">{filtered.length}</span> Pengajuan
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal</th>
                  <th className="py-3.5 px-4">Residen & Program</th>
                  <th className="py-3.5 px-4">Judul Naskah Artikel</th>
                  <th className="py-3.5 px-4">3 Target Jurnal</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                      <p className="font-semibold text-slate-600">Semua pengajuan telah diambil oleh Reviewer.</p>
                      <p className="text-[11px] text-slate-400">Tidak ada pengajuan yang menunggu saat ini.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#800000] text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          {sub.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(sub.submitted_at)}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{sub.resident_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{sub.resident_nim}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium inline-block mt-0.5">
                          {sub.program_ppds}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 line-clamp-2">{sub.article_title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pembimbing: {sub.supervisor_name}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-1 text-[11px] text-slate-600">
                          {sub.journals.map((j) => (
                            <p key={j.journal_order} className="truncate">
                              {j.journal_order}. {j.journal_name} ({j.quartile})
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedSub(sub)}
                            className="p-1.5 text-slate-500 hover:text-[#800000] hover:bg-red-50 rounded-lg transition-colors"
                            title="Lihat Abstrak & Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleClaim(sub.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1"
                          >
                            <span>Ambil Pemeriksaan</span>
                            <ArrowRight className="w-3.5 h-3.5" />
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
      {selectedSub && (
        <Modal
          isOpen={!!selectedSub}
          onClose={() => setSelectedSub(null)}
          title={`Detail Pengajuan: ${selectedSub.code}`}
          subtitle={`Diajukan oleh ${selectedSub.resident_name} (${selectedSub.resident_nim})`}
          maxWidth="3xl"
        >
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Judul Naskah</p>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{selectedSub.article_title}</h4>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Abstrak Artikel</p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1 p-3 rounded-xl bg-slate-50 border border-slate-100 text-justify">
                {selectedSub.article_abstract}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">3 Jurnal Kandidat Usulan</p>
              <div className="space-y-2">
                {selectedSub.journals.map((j) => (
                  <div key={j.journal_order} className="p-3 rounded-xl bg-white border border-slate-200">
                    <p className="font-bold text-slate-900">{j.journal_order}. {j.journal_name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ISSN: {j.issn} | Kuartil: {j.quartile}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSub(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => handleClaim(selectedSub.id)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#800000] hover:bg-[#6a020a] rounded-xl transition-colors shadow-md inline-flex items-center gap-1.5"
              >
                <span>Ambil Pemeriksaan Ini</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
