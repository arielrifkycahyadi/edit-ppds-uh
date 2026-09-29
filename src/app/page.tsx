'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DataService } from '@/lib/data-service';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const user = DataService.getCurrentUser();
    if (!user) {
      router.replace('/login');
    } else if (user.role === 'admin') {
      router.replace('/admin');
    } else if (user.role === 'reviewer') {
      router.replace('/reviewer');
    } else {
      router.replace('/residen');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#5c0000] text-white">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-amber-300 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="font-display font-bold text-lg">Memuat SIPATUJU PPDS FK UNHAS...</p>
      </div>
    </div>
  );
}
