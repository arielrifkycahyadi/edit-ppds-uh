'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/ui/Badge';
import { DataService } from '@/lib/data-service';
import { Submission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  Inbox,
  ClipboardList,
  History,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  Building2
} from 'lucide-react';

export default function ReviewerDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);
    setSubmissions(DataService.getSubmissions());

    DataService.syncSubmissionsFromSupabase().then((subs) => {
      setSubmissions(subs);
    });
  }, []);

  if (!currentUser) return null;

  const availableCount = submissions.filter((s) => s.status === 'waiting').length;
  const myActiveReviews = submissions.filter(
    (s) => s.status === 'in_review' && s.assigned_reviewer_id === currentUser.id
  );
  const myCompletedReviews = submissions.filter(
    (s) => s.status === 'completed' && s.assigned_reviewer_id === currentUser.id
  );

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Dashboard Reviewer Jurnal"
        subtitle="Panel Verifikasi & Penelaahan Kelayakan Jurnal PPDS Fakultas Kedokteran UNHAS"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Reviewer Profile Banner */}
        <div className="bg-gradient-to-r from-[#800000] via-[#5c0000] to-[#400000] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-inner shrink-0">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Tim Penelaah / Verifikator Jurnal</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold font-display">{currentUser.full_name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-red-200">
                  <span>NIP: <strong className="font-mono text-white">{currentUser.nim_nip}</strong></span>
                  <span>•</span>
                  <span>{currentUser.department || 'Departemen FK UNHAS'}</span>
                </div>
              </div>
            </div>

            <Link
              href="/reviewer/pengajuan-tersedia"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#5c0000] hover:bg-red-50 font-bold text-sm transition-all shadow-lg shrink-0"
            >
              <Inbox className="w-4 h-4 text-[#800000]" />
              <span>Ambil Pengajuan Baru ({availableCount})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Pengajuan Tersedia</p>
              <p className="text-2xl font-extrabold text-amber-700 mt-1 font-display">{availableCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Belum diambil Reviewer</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Inbox className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pemeriksaan Aktif Saya</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1 font-display">{myActiveReviews.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sedang dalam proses</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Riwayat Selesai</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-display">{myCompletedReviews.length}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Total telah ditelaah</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Active Reviews Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#800000]" />
              <span>Naskah Yang Sedang Anda Periksa</span>
            </h3>
            <Link
              href="/reviewer/pemeriksaan-saya"
              className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal</th>
                  <th className="py-3.5 px-4">Residen & Program</th>
                  <th className="py-3.5 px-4">Judul Naskah</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myActiveReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <p className="font-semibold text-slate-600">Tidak ada naskah yang sedang Anda periksa saat ini.</p>
                      <Link
                        href="/reviewer/pengajuan-tersedia"
                        className="text-xs text-[#800000] font-bold hover:underline inline-block mt-1"
                      >
                        Buka antrean Pengajuan Tersedia →
                      </Link>
                    </td>
                  </tr>
                ) : (
                  myActiveReviews.map((sub) => (
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
                        <p className="text-[10px] text-slate-400">{sub.program_ppds}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 line-clamp-2">{sub.article_title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Pembimbing: {sub.supervisor_name}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={sub.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/reviewer/pemeriksaan-jurnal/${sub.id}`}
                          className="px-3.5 py-2 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                          <span>Telaah 3 Jurnal</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
