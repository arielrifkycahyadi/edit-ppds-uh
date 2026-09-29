'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Database,
  Building2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('197805122005011002');
  const [password, setPassword] = useState('unhas12345');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const users = DataService.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    setTimeout(() => {
      // Find matching user by NIM/NIP or Email
      const user = users.find(
        (u) =>
          u.nim_nip.toLowerCase() === identifier.trim().toLowerCase() ||
          u.email.toLowerCase() === identifier.trim().toLowerCase()
      );

      if (!user) {
        setErrorMessage('NIM / NIP atau email tidak ditemukan.');
        setLoading(false);
        return;
      }

      if (!user.is_active) {
        setErrorMessage('Akun ini sedang dinonaktifkan. Hubungi Sekretariat PPDS FK UNHAS.');
        setLoading(false);
        return;
      }

      // Update session & redirect
      DataService.setCurrentUser(user);
      setLoading(false);

      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'reviewer') router.push('/reviewer');
      else router.push('/residen');
    }, 400);
  };

  const handleQuickLogin = (role: 'admin' | 'reviewer' | 'residen') => {
    const user = users.find((u) => u.role === role);
    if (user) {
      setIdentifier(user.nim_nip);
      setPassword('unhas12345');
      DataService.setCurrentUser(user);
      if (role === 'admin') router.push('/admin');
      else if (role === 'reviewer') router.push('/reviewer');
      else router.push('/residen');
    }
  };

  const supabaseReady = isSupabaseConfigured();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#400000] to-slate-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Side: Brand Visual Panel */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#800000] to-[#5c0000] text-white p-8 md:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Ornaments */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-red-500/10 blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl" />

          {/* Top Logo */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-amber-300 mb-6 shadow-sm">
              <Building2 className="w-4 h-4" />
              <span>Universitas Hasanuddin</span>
            </div>

            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/30 text-amber-300 shadow-md">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold font-display tracking-tight text-white">SIPATUJU</h1>
                <p className="text-xs text-red-200 font-medium">PPDS FK UNHAS</p>
              </div>
            </div>

            <p className="text-xs text-red-100/80 leading-relaxed mt-3">
              Sistem Informasi Pelayanan Administrasi Tugas Akhir & Verifikasi Kelayakan Publikasi Jurnal Program Pendidikan Dokter Spesialis.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="space-y-3.5 my-6 relative z-10">
            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">Restricted Journal Guard</p>
                <p className="text-[11px] text-red-100/70">Penyaringan otomatis terhadap jurnal predator & discontinued</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
              <Sparkles className="w-5 h-5 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white">LoA Generator Digital</p>
                <p className="text-[11px] text-red-100/70">Penerbitan Surat Persetujuan resmi dengan verifikasi QR Code</p>
              </div>
            </div>
          </div>

          {/* Bottom Info */}
          <div className="pt-4 border-t border-white/10 text-[11px] text-red-200/60 relative z-10 flex items-center justify-between">
            <span>© 2026 PPDS FK UNHAS</span>
            <span>Versi 2026.4 Canonical</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-white">
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-900 font-display">Selamat Datang</h2>
                {/* Supabase Status Indicator */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                    supabaseReady
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}
                  title={supabaseReady ? 'Terhubung langsung ke Supabase' : 'Mode Offline / Siap Dihubungkan ke Supabase'}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{supabaseReady ? 'Supabase Live' : 'Sistem Siap'}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Silakan masuk menggunakan akun Residen, Reviewer, atau Administrator Anda.
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium">{errorMessage}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  NIM / NIP / Email
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: C104212001 atau 197805122005011002"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#800000] focus:border-[#800000] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password akun Anda"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#800000] focus:border-[#800000] outline-none transition-all pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-[#800000] focus:ring-[#800000]" />
                  <span>Ingat sesi saya</span>
                </label>
                <span className="text-slate-400 hover:text-[#800000] cursor-pointer">Lupa password?</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-[#800000] hover:bg-[#6a020a] text-white font-bold text-sm shadow-lg shadow-red-950/20 hover:shadow-red-950/30 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Masuk ke Sistem</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Role Switchers */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
              Akses Cepat (Demo / Testing Akun)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-left transition-colors group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#800000]">Admin PPDS</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">dr. Fachry</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('reviewer')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-left transition-colors group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#800000]">Reviewer</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Prof. Syahrul</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('residen')}
                className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-left transition-colors group"
              >
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#800000]">Residen</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">dr. Ahmad Fauzi</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
