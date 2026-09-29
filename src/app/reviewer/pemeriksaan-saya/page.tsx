'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { StatusBadge } from '@/components/ui/Badge';
import { DataService } from '@/lib/data-service';
import { Submission } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';

export default function ReviewerPemeriksaanSayaPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const all = DataService.getSubmissions();
      setSubmissions(
        all.filter((s) => s.status === 'in_review' && s.assigned_reviewer_id === user.id)
      );

      DataService.syncSubmissionsFromSupabase().then((synced) => {
        setSubmissions(
          synced.filter((s) => s.status === 'in_review' && s.assigned_reviewer_id === user.id)
        );
      });
    }
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
        title="Pemeriksaan Aktif Saya"
        subtitle="Daftar naskah usulan yang sedang dalam tanggung jawab penelaahan Anda"
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
              Sedang Anda Periksa: <span className="text-blue-700 font-bold">{filtered.length}</span> Naskah
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/80">
                <tr>
                  <th className="py-3.5 px-4">Kode & Tanggal</th>
                  <th className="py-3.5 px-4">Residen & Program</th>
                  <th className="py-3.5 px-4">Judul Naskah</th>
                  <th className="py-3.5 px-4">3 Jurnal Kandidat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="font-semibold text-slate-600">Tidak ada naskah yang sedang Anda periksa.</p>
                      <Link
                        href="/reviewer/pengajuan-tersedia"
                        className="text-xs text-[#800000] font-bold hover:underline inline-block mt-1"
                      >
                        Buka Antrean Pengajuan Tersedia →
                      </Link>
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
                        <p className="text-[10px] text-slate-400">{sub.program_ppds}</p>
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
                        <Link
                          href={`/reviewer/pemeriksaan-jurnal/${sub.id}`}
                          className="px-4 py-2 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                        >
                          <span>Mulai Telaah 3 Jurnal</span>
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
