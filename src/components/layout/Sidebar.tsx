'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ShieldAlert,
  FilePlus,
  FileCheck2,
  Inbox,
  ClipboardList,
  History,
  GraduationCap,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '@/lib/types';
import { DataService } from '@/lib/data-service';

interface SidebarProps {
  role: UserRole;
}

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: number;
  badgeColor?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();
  const currentUser = DataService.getCurrentUser();
  const submissions = DataService.getSubmissions();

  // Dynamic counts for badges
  const waitingCount = submissions.filter((s) => s.status === 'waiting').length;
  const myReviewCount = submissions.filter(
    (s) => s.status === 'in_review' && s.assigned_reviewer_id === currentUser.id
  ).length;
  const residentCompletedCount = submissions.filter(
    (s) => s.resident_id === currentUser.id && s.status === 'completed'
  ).length;

  const adminNav: NavItem[] = [
    { label: 'Dashboard Admin', href: '/admin', icon: LayoutDashboard },
    { label: 'Manajemen Residen', href: '/admin/residen', icon: Users },
    { label: 'Manajemen Reviewer', href: '/admin/reviewer', icon: UserCheck },
    { label: 'Jurnal Predator & Guard', href: '/admin/jurnal-predator', icon: ShieldAlert },
  ];

  const reviewerNav: NavItem[] = [
    { label: 'Dashboard Reviewer', href: '/reviewer', icon: LayoutDashboard },
    {
      label: 'Pengajuan Tersedia',
      href: '/reviewer/pengajuan-tersedia',
      icon: Inbox,
      badge: waitingCount > 0 ? waitingCount : undefined,
    },
    {
      label: 'Pemeriksaan Saya',
      href: '/reviewer/pemeriksaan-saya',
      icon: ClipboardList,
      badge: myReviewCount > 0 ? myReviewCount : undefined,
    },
    { label: 'Riwayat Pemeriksaan', href: '/reviewer/riwayat-pemeriksaan', icon: History },
  ];

  const residenNav: NavItem[] = [
    { label: 'Dashboard Residen', href: '/residen', icon: LayoutDashboard },
    { label: 'Buat Pengajuan', href: '/residen/pengajuan-baru', icon: FilePlus },
    {
      label: 'Hasil Pemeriksaan',
      href: '/residen/hasil',
      icon: FileCheck2,
      badge: residentCompletedCount > 0 ? residentCompletedCount : undefined,
      badgeColor: 'bg-emerald-500',
    },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'reviewer' ? reviewerNav : residenNav;

  return (
    <aside className="w-64 bg-[#5c0000] text-white flex flex-col h-screen shrink-0 border-r border-[#800000]/60 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 text-white shadow-inner">
          <GraduationCap className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-display font-extrabold text-base tracking-wide text-white">SIPATUJU</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">
              FK UNHAS
            </span>
          </div>
          <p className="text-[11px] text-red-200/80 font-medium line-clamp-1">Verifikasi Jurnal PPDS</p>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="mx-4 mt-4 px-3 py-2 rounded-xl bg-black/20 border border-white/10 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider text-red-200/70">Role Akses</p>
          <p className="text-xs font-bold text-white capitalize flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            {role === 'admin' ? 'Administrator' : role === 'reviewer' ? 'Reviewer Jurnal' : 'Residen PPDS'}
          </p>
        </div>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm" />
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== `/${role}` && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-white text-[#5c0000] font-bold shadow-md shadow-black/10'
                  : 'text-red-100 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#800000]' : 'text-red-200'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full text-white ${
                    item.badgeColor || 'bg-amber-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-white/10 bg-black/15">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400/20 text-amber-300 font-bold flex items-center justify-center text-xs border border-amber-400/30">
            {currentUser.full_name
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{currentUser.full_name}</p>
            <p className="text-[10px] text-red-200/70 truncate">{currentUser.nim_nip}</p>
          </div>
          <Link
            href="/login"
            title="Keluar / Switch Akun"
            className="p-1.5 rounded-lg text-red-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
};
