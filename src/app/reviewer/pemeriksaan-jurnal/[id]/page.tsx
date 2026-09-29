'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/layout/Navbar';
import { DataService } from '@/lib/data-service';
import { Submission, JournalDecision } from '@/lib/types';
import { REJECTION_REASONS } from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import {
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Send,
  ExternalLink,
  BookOpen,
  FileText,
  Building2,
  Sparkles,
  AlertOctagon
} from 'lucide-react';

export default function PemeriksaanJurnalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const subId = params?.id as string;

  const currentUser = DataService.getCurrentUser();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Review decisions state for all 3 candidate journals
  const [decisions, setDecisions] = useState<
    {
      journal_order: 1 | 2 | 3;
      decision: JournalDecision;
      rejection_reasons: string[];
      reviewer_comment: string;
    }[]
  >([
    { journal_order: 1, decision: 'accepted', rejection_reasons: [], reviewer_comment: '' },
    { journal_order: 2, decision: 'accepted', rejection_reasons: [], reviewer_comment: '' },
    { journal_order: 3, decision: 'revision', rejection_reasons: [], reviewer_comment: '' },
  ]);

  useEffect(() => {
    if (subId) {
      const sub = DataService.getSubmissionById(subId);
      if (sub) {
        setSubmission(sub);
        // Pre-fill existing review if available
        if (sub.journals && sub.journals.length === 3) {
          setDecisions(
            sub.journals.map((j) => ({
              journal_order: j.journal_order,
              decision: j.decision || 'accepted',
              rejection_reasons: j.rejection_reasons || [],
              reviewer_comment: j.reviewer_comment || '',
            }))
          );
        }
      }
    }
  }, [subId]);

  if (!submission) {
    return (
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title="Pemeriksaan Jurnal" />
        <div className="p-12 text-center text-slate-500">
          <p className="font-bold">Pengajuan tidak ditemukan.</p>
          <Link href="/reviewer/pemeriksaan-saya" className="text-xs text-[#800000] underline mt-2 inline-block">
            Kembali ke Pemeriksaan Saya
          </Link>
        </div>
      </div>
    );
  }

  const handleDecisionChange = (order: 1 | 2 | 3, newDec: JournalDecision) => {
    setDecisions((prev) =>
      prev.map((d) => (d.journal_order === order ? { ...d, decision: newDec } : d))
    );
  };

  const handleReasonToggle = (order: 1 | 2 | 3, reason: string) => {
    setDecisions((prev) =>
      prev.map((d) => {
        if (d.journal_order === order) {
          const exists = d.rejection_reasons.includes(reason);
          const updated = exists
            ? d.rejection_reasons.filter((r) => r !== reason)
            : [...d.rejection_reasons, reason];
          return { ...d, rejection_reasons: updated };
        }
        return d;
      })
    );
  };

  const handleCommentChange = (order: 1 | 2 | 3, comment: string) => {
    setDecisions((prev) =>
      prev.map((d) => (d.journal_order === order ? { ...d, reviewer_comment: comment } : d))
    );
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);

    try {
      await DataService.submitReview(submission.id, currentUser.id, decisions);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmitting(false);
      router.push('/reviewer/riwayat-pemeriksaan');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title={`Telaah Kelayakan Jurnal: ${submission.code}`}
        subtitle="Periksa kesesuaian ruang lingkup, reputasi, dan bebas jurnal predator untuk 3 jurnal kandidat"
        actions={
          <Link
            href="/reviewer/pemeriksaan-saya"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali</span>
          </Link>
        }
      />

      <main className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto w-full">
        {/* Article Summary Header Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Residen Pengusul</p>
              <p className="font-bold text-slate-900 mt-0.5">{submission.resident_name}</p>
              <p className="font-mono text-[11px] text-slate-500">{submission.resident_nim}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Program Studi PPDS</p>
              <p className="font-semibold text-slate-800 mt-0.5">{submission.program_ppds}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Dosen Pembimbing</p>
              <p className="font-semibold text-slate-800 mt-0.5">{submission.supervisor_name}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Tanggal Pengajuan</p>
              <p className="font-medium text-slate-700 mt-0.5">{formatDate(submission.submitted_at)}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Judul Naskah Artikel</p>
            <h3 className="text-base font-bold text-slate-900 mt-0.5 leading-snug">
              {submission.article_title}
            </h3>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">Abstrak Lengkap</p>
            <p className="text-xs text-slate-600 leading-relaxed mt-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-justify">
              {submission.article_abstract}
            </p>
          </div>
        </div>

        {/* 3 Candidate Journals Review Form */}
        <form onSubmit={handleSubmitReview} className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#800000]" />
              <span>Form Telaah & Keputusan Per Jurnal (Tepat 3 Jurnal)</span>
            </h4>
          </div>

          <div className="space-y-6">
            {submission.journals.map((j) => {
              const currentDec = decisions.find((d) => d.journal_order === j.journal_order);
              const isNotAccepted = currentDec?.decision === 'rejected' || currentDec?.decision === 'predatory';

              return (
                <div
                  key={j.journal_order}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5"
                >
                  {/* Journal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#800000] text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {j.journal_order}
                      </span>
                      <div>
                        <h5 className="font-bold text-slate-900 text-base">{j.journal_name}</h5>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
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
                                className="text-blue-600 hover:underline inline-flex items-center gap-1"
                              >
                                <span>Kunjungi Laman Jurnal</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Decision Options */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                      Keputusan Kelayakan Jurnal Ke-{j.journal_order}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { val: 'accepted', label: 'Layak (Disetujui)', color: 'border-emerald-300 bg-emerald-50 text-emerald-800 font-bold' },
                        { val: 'revision', label: 'Layak Bersyarat', color: 'border-blue-300 bg-blue-50 text-blue-800 font-bold' },
                        { val: 'rejected', label: 'Tidak Layak', color: 'border-rose-300 bg-rose-50 text-rose-800 font-bold' },
                        { val: 'predatory', label: 'Predatory / Ditolak', color: 'border-red-400 bg-red-100 text-red-900 font-bold' },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          className={`flex items-center justify-center gap-2 p-3 rounded-2xl border-2 cursor-pointer transition-all text-xs text-center ${
                            currentDec?.decision === opt.val
                              ? opt.color + ' ring-2 ring-offset-1 ring-[#800000]'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`decision_${j.journal_order}`}
                            value={opt.val}
                            checked={currentDec?.decision === opt.val}
                            onChange={() => handleDecisionChange(j.journal_order, opt.val as JournalDecision)}
                            className="sr-only"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Rejection Reasons (Conditional) */}
                  {isNotAccepted && (
                    <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 animate-in fade-in duration-150">
                      <label className="block text-[11px] font-bold text-rose-900 uppercase">
                        Pilih Alasan Ketidaklayakan Jurnal (Minimal 1):
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {REJECTION_REASONS.map((reason) => (
                          <label key={reason} className="flex items-start gap-2 text-xs text-rose-900 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentDec?.rejection_reasons?.includes(reason)}
                              onChange={() => handleReasonToggle(j.journal_order, reason)}
                              className="rounded border-rose-300 text-rose-700 focus:ring-rose-700 mt-0.5"
                            />
                            <span>{reason}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Reviewer Commentary */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                      Catatan / Rekomendasi Reviewer untuk Jurnal Ke-{j.journal_order}
                    </label>
                    <textarea
                      rows={2}
                      value={currentDec?.reviewer_comment || ''}
                      onChange={(e) => handleCommentChange(j.journal_order, e.target.value)}
                      placeholder="Berikan masukan terkait kesesuaian scope naskah, format artikel, atau saran perbaikan..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none leading-relaxed"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-between p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <Link
              href="/reviewer/pemeriksaan-saya"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Simpan & Kembali Nanti</span>
            </Link>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-sm shadow-xl shadow-red-950/20 transition-all disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Seluruh Hasil Telaah (3 Jurnal)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
