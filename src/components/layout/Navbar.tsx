'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Users, Bell, Search, ExternalLink } from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { UserRole } from '@/lib/types';

interface NavbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, actions }) => {
  const router = useRouter();
  const currentUser = DataService.getCurrentUser();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  const handleSwitchRole = (role: UserRole) => {
    DataService.switchUserByRole(role);
    setShowRoleSwitcher(false);
    if (role === 'admin') router.push('/admin');
    else if (role === 'reviewer') router.push('/reviewer');
    else router.push('/residen');
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {actions}

        {/* Quick Role Switcher (Helpful for pairwise testing between Admin, Reviewer, and Residen) */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Akun: {currentUser.role.toUpperCase()}</span>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded">Switch</span>
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ganti Profil Cepat</p>
              </div>
              <button
                onClick={() => handleSwitchRole('admin')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-[#800000] flex items-center justify-between"
              >
                <span>Admin PPDS</span>
                {currentUser.role === 'admin' && <span className="w-1.5 h-1.5 rounded-full bg-[#800000]" />}
              </button>
              <button
                onClick={() => handleSwitchRole('reviewer')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-[#800000] flex items-center justify-between"
              >
                <span>Reviewer Jurnal</span>
                {currentUser.role === 'reviewer' && <span className="w-1.5 h-1.5 rounded-full bg-[#800000]" />}
              </button>
              <button
                onClick={() => handleSwitchRole('residen')}
                className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-[#800000] flex items-center justify-between"
              >
                <span>Residen PPDS</span>
                {currentUser.role === 'residen' && <span className="w-1.5 h-1.5 rounded-full bg-[#800000]" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
