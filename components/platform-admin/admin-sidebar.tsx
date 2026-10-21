'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  ShieldAlert,
  Building2,
  CreditCard,
  Layers,
  Network,
  Activity,
  ScrollText,
  Settings,
  X,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

interface AdminNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: AdminNavItem[] = [
  {
    title: 'Platform Overview',
    href: '/platform-admin/dashboard',
    icon: Activity,
  },
  {
    title: 'Hotel Accounts',
    href: '/platform-admin/hotels',
    icon: Building2,
  },
  {
    title: 'Tenant Subscriptions',
    href: '/platform-admin/subscriptions',
    icon: CreditCard,
  },
  {
    title: 'Subscription Plans',
    href: '/platform-admin/plans',
    icon: Layers,
  },
  {
    title: 'OTA Integrations',
    href: '/platform-admin/integrations',
    icon: Network,
  },
  {
    title: 'Global Sync Monitor',
    href: '/platform-admin/sync-monitor',
    icon: SlidersHorizontal,
  },
  {
    title: 'Platform Audit Trail',
    href: '/platform-admin/audit-logs',
    icon: ScrollText,
  },
  {
    title: 'Platform Settings',
    href: '/platform-admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-800/80 px-5">
        <Link href="/platform-admin/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-zinc-950 shadow-sm font-black">
            <ShieldAlert className="h-5 w-5 text-zinc-950" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-white">StayPilot</span>
            <span className="text-[10px] font-bold tracking-wider text-amber-400 uppercase">
              Super Admin Control Plane
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 lg:hidden"
            aria-label="Close admin sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Group */}
      <div className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
        <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
          Operator Administration
        </p>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/platform-admin/dashboard'
              ? pathname === '/platform-admin/dashboard' || pathname === '/platform-admin'
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onCloseMobile}
              className={cn(
                'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-zinc-800 text-amber-400 font-semibold shadow-inner'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                />
                <span>{item.title}</span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Switch back to Hotel App Context */}
      <div className="border-t border-zinc-800/80 p-3 bg-zinc-900/50">
        <Link
          href="/hotel/dashboard"
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <span className="font-medium">Hotel PMS View</span>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-500" />
        </Link>
      </div>
    </aside>
  );
}
