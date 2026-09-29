'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/ui/Badge';
import { DataService } from '@/lib/data-service';
import { Submission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  FilePlus,
  FileCheck2,
  Clock,
  Layers,
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function ResidenDashboardPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const allSubs = DataService.getSubmissions();
      const mySubs = allSubs.filter((s) => s.resident_id === user.id || s.resident_nim === user.nim_nip);
      setSubmissions(mySubs);

      DataService.syncSubmissionsFromSupabase().then((synced) => {
        const updatedMySubs = synced.filter((s) => s.resident_id === user.id || s.resident_nim === user.nim_nip);
        setSubmissions(updatedMySubs);
      });
    }
  }, []);

  if (!currentUser) return null;

  const totalMySubs = submissions.length;
  const inReviewCount = submissions.filter((s) => s.status === 'in_review' || s.status === 'waiting').length;
  const completedCount = submissions.filter((s) => s.status === 'completed').length;

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Dashboard Residen"
        subtitle="Portal Layanan Mandiri Verifikasi Jurnal Tugas Akhir PPDS FK UNHAS"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Resident Profile Hero Card */}
        <div className="bg-gradient-to-r from-[#800000] via-[#5c0000] to-[#400000] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-amber-300 shadow-inner shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-bold border border-amber-400/30 mb-1.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Program Pendidikan Dokter Spesialis</span>
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold font-display">{currentUser.full_name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-red-200">
                  <span>NIM: <strong className="font-mono text-white">{currentUser.nim_nip}</strong></span>
                  <span>•</span>
                  <span>Spesialisasi: <strong className="text-white">{currentUser.program_ppds || 'Ilmu Penyakit Dalam'}</strong></span>
                </div>
              </div>
            </div>

            {/* Quick Action Button */}
            <Link
              href="/residen/pengajuan-baru"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-[#5c0000] hover:bg-red-50 font-bold text-sm transition-all shadow-lg shadow-black/20 shrink-0"
            >
              <FilePlus className="w-4 h-4 text-[#800000]" />
              <span>Buat Pengajuan Baru</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Naskah Diajukan</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1 font-display">{totalMySubs}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Keseluruhan riwayat</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#800000] flex items-center justify-center border border-red-100">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Dalam Pemeriksaan</p>
              <p className="text-2xl font-extrabold text-blue-700 mt-1 font-display">{inReviewCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Sedang ditinjau Reviewer</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Selesai & LoA Terbit</p>
              <p className="text-2xl font-extrabold text-emerald-700 mt-1 font-display">{completedCount}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Surat kelayakan terbit</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Quick Access Tiles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/residen/pengajuan-baru"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-[#800000]/40 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-red-50 text-[#800000] flex items-center justify-center border border-red-100 mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
              <FilePlus className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#800000] transition-colors">
              Formulir Pengajuan Verifikasi 3 Jurnal
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Ajukan naskah artikel Anda beserta 3 target jurnal kandidat. Sistem akan secara otomatis memverifikasi status jurnal predator sebelum diserahkan ke Reviewer.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#800000]">
              <span>Mulai Pengajuan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/residen/hasil"
            className="p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Hasil Pemeriksaan & Unduh Surat Persetujuan
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Lihat status keputusan kelayakan untuk setiap jurnal kandidat, catatan telaah dari tim Reviewer, dan unduh Surat Keterangan resmi (LoA) ber-QR Code.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-emerald-700">
              <span>Buka Hasil Pemeriksaan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Latest Submissions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#800000]" />
              <span>Daftar Pengajuan Naskah Anda</span>
            </h3>
            <Link
              href="/residen/hasil"
              className="text-xs font-bold text-[#800000] hover:underline flex items-center gap-1"
            >
              <span>Lihat Detail Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal</th>
                  <th className="py-3.5 px-4">Judul Naskah</th>
                  <th className="py-3.5 px-4">Jenis & Pembimbing</th>
                  <th className="py-3.5 px-4">Status Pengajuan</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Belum ada pengajuan naskah.</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Klik tombol "Buat Pengajuan Baru" di atas untuk memulai.
                      </p>
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-[#800000] text-[11px] bg-red-50 px-2 py-0.5 rounded border border-red-100">
                          {sub.code}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(sub.submitted_at)}</p>
                      </td>

                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 line-clamp-2">{sub.article_title}</p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{sub.article_type}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Dosen: {sub.supervisor_name}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusBadge status={sub.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          href="/residen/hasil"
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-[#800000] font-bold text-xs transition-colors inline-flex items-center gap-1"
                        >
                          <span>Buka Detail</span>
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
