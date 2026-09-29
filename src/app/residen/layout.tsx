'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';

export default function ResidenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f3f5f8]">
      <Sidebar role="residen" />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
