'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  BedDouble,
  Users,
  ConciergeBell,
  Sparkles,
  Percent,
  Share2,
  Receipt,
  BarChart3,
  ShieldCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Hotel,
  SlidersHorizontal,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  phase?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const NAVIGATION_GROUPS: NavGroup[] = [
  {
    group: 'CORE PMS',
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Reservations', href: '/dashboard/reservations', icon: CalendarDays, phase: 'P3' },
      { name: 'Room Calendar', href: '/dashboard/calendar', icon: CalendarRange },
      { name: 'Rooms & Inventory', href: '/dashboard/rooms', icon: BedDouble },
      { name: 'Guests', href: '/dashboard/guests', icon: Users, phase: 'P3' },
      { name: 'Front Desk', href: '/dashboard/front-desk', icon: ConciergeBell, phase: 'P3' },
      { name: 'Housekeeping', href: '/dashboard/housekeeping', icon: Sparkles, phase: 'P3' },
    ],
  },
  {
    group: 'DISTRIBUTION & REVENUE',
    items: [
      { name: 'Rates & Availability', href: '/dashboard/rates', icon: Percent, phase: 'P2' },
      { name: 'Channel Manager', href: '/dashboard/channel-manager', icon: Share2, phase: 'P4' },
      { name: 'Payments & Invoices', href: '/dashboard/payments', icon: Receipt, phase: 'P3' },
    ],
  },
  {
    group: 'MANAGEMENT',
    items: [
      { name: 'Reports & Analytics', href: '/dashboard/reports', icon: BarChart3, phase: 'P6' },
      { name: 'Staff & Permissions', href: '/dashboard/staff', icon: ShieldCheck, phase: 'P3' },
      { name: 'Property Settings', href: '/dashboard/settings/property', icon: Building2 },
      { name: 'Platform Admin', href: '/dashboard/platform-admin', icon: SlidersHorizontal, phase: 'SaaS' },
    ],
  },
];

export function Sidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white border-r border-zinc-200 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex h-16 items-center justify-between px-4 border-b border-zinc-200/80">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 overflow-hidden group focus-visible:outline-none"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs group-hover:bg-blue-700 transition-colors">
              <Hotel className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col transition-opacity duration-200">
                <span className="text-sm font-bold tracking-tight text-zinc-900 leading-tight">
                  StayPilot
                </span>
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                  Hotel OS • Phase 1 &amp; 2
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {NAVIGATION_GROUPS.map((group) => (
            <div key={group.group} className="space-y-1">
              {!collapsed && (
                <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  {group.group}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/dashboard'
                    ? pathname === '/dashboard'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? `${item.name}${item.phase ? ` (${item.phase})` : ''}` : undefined}
                    className={cn(
                      'group flex items-center rounded-lg px-2.5 py-2 text-xs font-medium transition-colors relative',
                      isActive
                        ? 'bg-blue-50/80 text-blue-700 font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-100/80 hover:text-zinc-900',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-blue-600'
                          : 'text-zinc-400 group-hover:text-zinc-600',
                        !collapsed && 'mr-2.5'
                      )}
                    />
                    {!collapsed && (
                      <span className="truncate flex-1">{item.name}</span>
                    )}
                    {!collapsed && item.phase && (
                      <span
                        className={cn(
                          'ml-auto rounded px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider border',
                          isActive
                            ? 'bg-blue-100/70 border-blue-200 text-blue-800'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-500'
                        )}
                      >
                        {item.phase}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-blue-600" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info in Sidebar */}
      {!collapsed && (
        <div className="p-3 border-t border-zinc-200/80 bg-zinc-50/60">
          <div className="rounded-lg border border-zinc-200/80 bg-white p-2.5 text-[11px] text-zinc-600 shadow-2xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-zinc-800">StayPilot PMS</span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                v1.0.0
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-tight">
              Phase 2 Room Management &amp; Inventory • Multi-tenant
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col shrink-0 transition-all duration-200 ease-in-out',
          collapsed ? 'w-18' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-200 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
