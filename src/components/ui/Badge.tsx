import React from 'react';
import { SubmissionStatus, JournalDecision } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: SubmissionStatus | 'active' | 'inactive';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'waiting':
        return {
          label: 'Menunggu Pemeriksaan',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
        };
      case 'in_review':
        return {
          label: 'Sedang Diperiksa',
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500 animate-pulse',
        };
      case 'completed':
        return {
          label: 'Selesai / Layak',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'rejected':
        return {
          label: 'Tidak Layak',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
        };
      case 'active':
        return {
          label: 'Aktif',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
        };
      case 'inactive':
        return {
          label: 'Nonaktif',
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          dot: 'bg-slate-400',
        };
      default:
        return {
          label: status,
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
        config.bg,
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};

interface DecisionBadgeProps {
  decision?: JournalDecision;
  className?: string;
}

export const DecisionBadge: React.FC<DecisionBadgeProps> = ({ decision, className }) => {
  if (!decision) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        Belum Dinilai
      </span>
    );
  }

  const map = {
    accepted: { label: 'Layak', bg: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    revision: { label: 'Layak Bersyarat', bg: 'bg-blue-100 text-blue-800 border-blue-300' },
    rejected: { label: 'Tidak Layak', bg: 'bg-rose-100 text-rose-800 border-rose-300' },
    predatory: { label: 'Predatory / Ditolak', bg: 'bg-red-200 text-red-900 border-red-400 font-bold' },
  };

  const item = map[decision];

  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border', item.bg, className)}>
      {item.label}
    </span>
  );
};
