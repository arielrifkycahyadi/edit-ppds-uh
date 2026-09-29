'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, LogOut, ChevronDown, Sparkles, Building2, BookOpen } from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { UserProfile } from '@/lib/types';

interface NavbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, actions }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = DataService.getCurrentUser();
    setCurrentUser(user);

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    DataService.logout();
    router.push('/login');
  };

  const getRoleLabel = (role?: string) => {
    if (role === 'admin') return 'Administrator';
    if (role === 'reviewer') return 'Reviewer Jurnal';
    if (role === 'residen') return 'Residen PPDS';
    return 'Pengguna';
  };

  const getRoleBadgeStyle = (role?: string) => {
    if (role === 'admin') return 'bg-red-50 text-red-700 border-red-200';
    if (role === 'reviewer') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-500 line-clamp-1">{subtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {actions}

        {/* User Profile Badge Menu */}
        {currentUser && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100 transition-all text-left shadow-xs cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-[#800000] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {currentUser.full_name
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-[#800000] transition-colors">
                  {currentUser.full_name}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                  <span className="text-[10px] text-slate-400">{currentUser.nim_nip}</span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{currentUser.full_name}</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{currentUser.nim_nip}</p>
                  
                  {currentUser.program_ppds && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                      <BookOpen className="w-3.5 h-3.5 text-[#800000] shrink-0" />
                      <span className="line-clamp-1 font-medium">{currentUser.program_ppds}</span>
                    </div>
                  )}

                  {currentUser.department && (
                    <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                      <Building2 className="w-3.5 h-3.5 text-[#800000] shrink-0" />
                      <span className="line-clamp-1 font-medium">{currentUser.department}</span>
                    </div>
                  )}
                </div>

                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Akun</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
