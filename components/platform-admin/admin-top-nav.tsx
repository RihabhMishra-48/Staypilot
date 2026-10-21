'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, LogOut, ShieldCheck } from 'lucide-react';
import { Profile } from '@/types';
import { logoutAction } from '@/lib/actions/auth';

interface AdminTopNavProps {
  onOpenMobile: () => void;
  profile: Profile | null;
}

export function AdminTopNav({ onOpenMobile, profile }: AdminTopNavProps) {
  const pathname = usePathname();

  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const title = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return { title, url, isLast: index === pathSegments.length - 1 };
  });

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 text-zinc-200 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 lg:hidden"
          aria-label="Open admin sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
          <Link
            href="/platform-admin/dashboard"
            className="text-zinc-400 hover:text-white transition-colors font-medium"
          >
            Platform Admin
          </Link>
          {breadcrumbs.slice(1).map((crumb) => (
            <React.Fragment key={crumb.url}>
              <span className="text-zinc-600">/</span>
              {crumb.isLast ? (
                <span className="font-semibold text-amber-400">{crumb.title}</span>
              ) : (
                <Link
                  href={crumb.url}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  {crumb.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs text-amber-400">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-semibold text-[11px]">Super Admin Access</span>
        </div>

        <div className="flex items-center gap-3 border-l border-zinc-800 pl-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-white">
              {profile?.full_name || 'System Operator'}
            </span>
            <span className="text-[10px] text-zinc-500">StayPilot Admin</span>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-rose-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
