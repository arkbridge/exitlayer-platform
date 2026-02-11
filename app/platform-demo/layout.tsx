'use client';

import { Sidebar } from '@/components/platform/sidebar';
import { DemoHeader } from './demo-header';
import { Toaster } from '@/components/ui/sonner';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#f8f8f6]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DemoHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
