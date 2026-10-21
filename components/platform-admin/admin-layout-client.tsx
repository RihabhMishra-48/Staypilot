'use client';

import * as React from 'react';
import { Profile } from '@/types';
import { AdminSidebar } from './admin-sidebar';
import { AdminTopNav } from './admin-top-nav';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  profile: Profile | null;
}

export function AdminLayoutClient({ children, profile }: AdminLayoutClientProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-zinc-900 font-sans text-zinc-100 antialiased">
      {/* Desktop Admin Sidebar */}
      <div className="hidden lg:flex lg:shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 max-w-full">
            <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopNav onOpenMobile={() => setMobileOpen(true)} profile={profile} />
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
