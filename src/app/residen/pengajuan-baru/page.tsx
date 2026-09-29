'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { Navbar } from '@/components/layout/Navbar';
import { DataService } from '@/lib/data-service';
import { ARTICLE_TYPES, QUARTILES } from '@/lib/constants';
import {
  FileText,
  User,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Send,
  ExternalLink,
  BookOpen,
  Sparkles,
  AlertOctagon
} from 'lucide-react';

export default function BuatPengajuanResidenPage() {
  const router = useRouter();
  const currentUser = DataService.getCurrentUser();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form State
  const [articleType, setArticleType] = useState<string>(ARTICLE_TYPES[0]);
  const [articleTitle, setArticleTitle] = useState<string>('');
  const [articleAbstract, setArticleAbstract] = useState<string>('');
  const [supervisorName, setSupervisorName] = useState<string>('');

  const [journals, setJournals] = useState([
    {
      journal_name: '',
      issn: '',
      quartile: 'Q2' as string,
      journal_url: '',
    },
    {
      journal_name: '',
      issn: '',
      quartile: 'Q3' as string,
      journal_url: '',
    },
    {
      journal_name: '',
      issn: '',
      quartile: 'Sinta 2' as string,
      journal_url: '',
    },
  ]);

  // Predatory Pre-check Results
  const [guardChecks, setGuardChecks] = useState<
    { isRestricted: boolean; match?: any }[]
  >([]);

  const handleJournalChange = (index: number, field: string, value: string) => {
    const updated = [...journals];
    updated[index] = { ...updated[index], [field]: value };
    setJournals(updated);
  };

  const handleRunGuardScan = () => {
    const results = journals.map((j) =>
      DataService.checkPredatoryJournal(j.journal_name, j.issn)
    );
    setGuardChecks(results);
    setCurrentStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);

    try {
      await DataService.createSubmission({
        resident_id: currentUser.id,
        resident_name: currentUser.full_name,
        resident_nim: currentUser.nim_nip,
        program_ppds: currentUser.program_ppds || 'Ilmu Penyakit Dalam',
        article_type: articleType,
        article_title: articleTitle,
        article_abstract: articleAbstract,
        supervisor_name: supervisorName,
        journals: journals,
      });

      // Fire celebratory confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setSubmitting(false);
      router.push('/residen/hasil');
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Data Naskah', desc: 'Judul & Abstrak' },
    { num: 2, title: 'Pembimbing', desc: 'Dosen Pembimbing' },
    { num: 3, title: '3 Jurnal Kandidat', desc: 'Target Usulan' },
    { num: 4, title: 'Predatory Guard', desc: 'Cek Otomatis' },
    { num: 5, title: 'Konfirmasi', desc: 'Kirim Pengajuan' },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0">
      <Navbar
        title="Formulir Buat Pengajuan Verifikasi Jurnal"
        subtitle="Layanan pemeriksaan kelayakan 3 kandidat jurnal tugas akhir PPDS FK UNHAS"
      />

      <main className="p-6 md:p-8 space-y-6 max-w-4xl mx-auto w-full">
        {/* Step Indicator Bar */}
        <div className="bg-white rounded-2xl p-4 md:p-6 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-5 gap-2 md:gap-4">
            {steps.map((step) => {
              const isDone = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="text-center">
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs md:text-sm transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#800000] text-white ring-4 ring-red-100 shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" /> : step.num}
                  </div>
                  <p
                    className={`mt-2 text-xs font-bold truncate ${
                      isCurrent ? 'text-[#800000]' : isDone ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400 hidden md:block truncate">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Form Cards */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
          {/* STEP 1: DATA NASKAH */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#800000]" />
                  <span>Langkah 1: Identitas & Abstrak Naskah Artikel</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Isikan jenis naskah, judul lengkap, dan abstrak artikel ilmiah Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Jenis Naskah Artikel
                </label>
                <select
                  value={articleType}
                  onChange={(e) => setArticleType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#800000] outline-none"
                >
                  {ARTICLE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Judul Lengkap Naskah Artikel
                </label>
                <textarea
                  rows={2}
                  required
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  placeholder="Contoh: Korelasi Kadar Serum Biomarker dengan Derajat Keparahan Klinis..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Abstrak Lengkap Artikel (Bahasa Indonesia / Inggris)
                </label>
                <textarea
                  rows={6}
                  required
                  value={articleAbstract}
                  onChange={(e) => setArticleAbstract(e.target.value)}
                  placeholder="Ketik atau tempelkan teks abstrak artikel naskah Anda di sini..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!articleTitle.trim() || !articleAbstract.trim()}
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <span>Lanjut ke Dosen Pembimbing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: DOSEN PEMBIMBING */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <User className="w-5 h-5 text-[#800000]" />
                  <span>Langkah 2: Data Dosen Pembimbing Tugas Akhir</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cantumkan nama lengkap beserta gelar konsultan / pembimbing naskah tugas akhir Anda.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Nama Dosen Pembimbing (Beserta Gelar)
                </label>
                <input
                  type="text"
                  required
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  placeholder="Contoh: Prof. Dr. dr. Nama Dosen, Sp.PD-KGEH, FINASIM"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  disabled={!supervisorName.trim()}
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <span>Lanjut ke 3 Jurnal Kandidat</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 3 JURNAL KANDIDAT */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#800000]" />
                  <span>Langkah 3: Tepat 3 Target Jurnal Kandidat</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sesuai ketentuan PPDS FK UNHAS, Anda wajib mengusulkan tepat 3 pilihan jurnal kandidat untuk diperiksa kelayakannya.
                </p>
              </div>

              <div className="space-y-4">
                {journals.map((j, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#800000] text-white font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Kandidat Jurnal Ke-{idx + 1}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Nama Jurnal
                        </label>
                        <input
                          type="text"
                          required
                          value={j.journal_name}
                          onChange={(e) => handleJournalChange(idx, 'journal_name', e.target.value)}
                          placeholder="Contoh: Acta Medica Indonesiana"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          ISSN / e-ISSN
                        </label>
                        <input
                          type="text"
                          required
                          value={j.issn}
                          onChange={(e) => handleJournalChange(idx, 'issn', e.target.value)}
                          placeholder="0125-9326"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-medium focus:ring-2 focus:ring-[#800000] outline-none bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Kuartil / Indeksasi Reputasi
                        </label>
                        <select
                          value={j.quartile}
                          onChange={(e) => handleJournalChange(idx, 'quartile', e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none bg-white"
                        >
                          {QUARTILES.map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tautan / URL Laman Resmi Jurnal
                        </label>
                        <input
                          type="url"
                          value={j.journal_url}
                          onChange={(e) => handleJournalChange(idx, 'journal_url', e.target.value)}
                          placeholder="https://..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-[#800000] outline-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  disabled={journals.some((j) => !j.journal_name.trim() || !j.issn.trim())}
                  onClick={handleRunGuardScan}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Jalankan Predatory Guard Check</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RESTRICTED GUARD PRE-CHECK */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Langkah 4: Hasil Pemindaian Restricted Journal Guard</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pemeriksaan otomatis terhadap basis data Jurnal Predator dan Discontinued FK UNHAS.
                </p>
              </div>

              <div className="space-y-3">
                {journals.map((j, idx) => {
                  const check = guardChecks[idx];
                  const isRestricted = check?.isRestricted;

                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRestricted
                          ? 'bg-rose-50 border-rose-300 text-rose-900'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                              isRestricted ? 'bg-rose-200 text-rose-800' : 'bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {isRestricted ? (
                              <AlertOctagon className="w-5 h-5" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm">
                              Kandidat {idx + 1}: {j.journal_name}
                            </p>
                            <p className="text-xs opacity-80 mt-0.5 font-mono">ISSN: {j.issn} | Kuartil: {j.quartile}</p>
                            {isRestricted ? (
                              <div className="mt-2 text-xs font-semibold bg-rose-100 p-2.5 rounded-lg border border-rose-300">
                                <p className="font-bold text-rose-950 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>PERINGATAN: Jurnal Terindikasi Masuk Blacklist!</span>
                                </p>
                                <p className="mt-0.5 text-[11px]">
                                  Sumber: {check.match.source} ({check.match.source_reference})
                                </p>
                              </div>
                            ) : (
                              <p className="mt-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aman — Tidak ditemukan dalam daftar jurnal predator / discontinued</span>
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            isRestricted
                              ? 'bg-rose-200 text-rose-900 border border-rose-300'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          {isRestricted ? 'DIBATASI' : 'LOLOS GUARD'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Ubah Jurnal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-xs shadow-md transition-all"
                >
                  <span>Lanjut ke Konfirmasi Akhir</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: RINGKASAN & KONFIRMASI */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                  <Send className="w-5 h-5 text-[#800000]" />
                  <span>Langkah 5: Ringkasan & Konfirmasi Pengajuan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mohon periksa kembali seluruh data sebelum mengirimkan pengajuan ke tim penelaah.
                </p>
              </div>

              {/* Summary Box */}
              <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Judul Naskah Artikel</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{articleTitle}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Jenis Naskah</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{articleType}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Dosen Pembimbing</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{supervisorName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">3 Jurnal Kandidat Usulan</p>
                  <div className="space-y-2 mt-1.5">
                    {journals.map((j, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-900">{i + 1}. {j.journal_name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">ISSN: {j.issn} | Kuartil: {j.quartile}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-sm shadow-xl shadow-red-950/20 transition-all disabled:opacity-50"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Pengajuan Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
