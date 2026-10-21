'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Radio,
  Network,
  History,
  BedDouble,
  Layers,
  CalendarDays,
  DollarSign,
  BookOpen,
  ConciergeBell,
  Sparkles,
  Users,
  BarChart3,
  ShieldCheck,
  Settings,
  CreditCard,
  Building2,
  X,
} from 'lucide-react';
import { PropertyRole } from '@/types';

interface HotelSidebarProps {
  onCloseMobile?: () => void;
  userRole?: PropertyRole;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  allowedRoles?: PropertyRole[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Channel Manager',
    items: [
      {
        title: 'Channel Overview',
        href: '/hotel/dashboard',
        icon: LayoutDashboard,
      },
      {
        title: 'OTA Connections',
        href: '/hotel/channel-manager/connections',
        icon: Network,
      },
      {
        title: 'Rates & Availability',
        href: '/hotel/channel-manager',
        icon: Radio,
      },
      {
        title: 'Sync Logs',
        href: '/hotel/channel-manager/sync-logs',
        icon: History,
      },
    ],
  },
  {
    label: 'PMS Operations',
    items: [
      {
        title: 'Room Inventory',
        href: '/hotel/rooms',
        icon: BedDouble,
      },
      {
        title: 'Room Types',
        href: '/hotel/room-types',
        icon: Layers,
      },
      {
        title: 'Inventory Calendar',
        href: '/hotel/calendar',
        icon: CalendarDays,
      },
      {
        title: 'Rate Plans',
        href: '/hotel/rates',
        icon: DollarSign,
      },
      {
        title: 'Reservations',
        href: '/hotel/reservations',
        icon: BookOpen,
      },
      {
        title: 'Front Desk',
        href: '/hotel/front-desk',
        icon: ConciergeBell,
      },
      {
        title: 'Housekeeping',
        href: '/hotel/housekeeping',
        icon: Sparkles,
      },
      {
        title: 'Guest Directory',
        href: '/hotel/guests',
        icon: Users,
      },
    ],
  },
  {
    label: 'Hotel Management',
    items: [
      {
        title: 'Channel Reports',
        href: '/hotel/reports',
        icon: BarChart3,
        allowedRoles: ['owner', 'manager'],
      },
      {
        title: 'Staff & Roles',
        href: '/hotel/staff',
        icon: ShieldCheck,
        allowedRoles: ['owner', 'manager'],
      },
      {
        title: 'Property Settings',
        href: '/hotel/settings',
        icon: Settings,
        allowedRoles: ['owner', 'manager'],
      },
      {
        title: 'SaaS Billing',
        href: '/hotel/billing',
        icon: CreditCard,
        allowedRoles: ['owner', 'manager'],
      },
    ],
  },
];

export function HotelSidebar({ onCloseMobile, userRole = 'manager' }: HotelSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-200/80 px-5">
        <Link href="/hotel/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <Radio className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-zinc-950">StayPilot</span>
            <span className="text-[10px] font-semibold tracking-wider text-blue-600 uppercase">
              Hotel Channel Manager
            </span>
          </div>
        </Link>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV_GROUPS.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.allowedRoles || item.allowedRoles.includes(userRole)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={group.label} className="space-y-1">
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {group.label}
              </p>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === '/hotel/dashboard'
                      ? pathname === '/hotel/dashboard' || pathname === '/hotel'
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onCloseMobile}
                      className={cn(
                        'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors',
                            isActive
                              ? 'text-blue-600'
                              : 'text-zinc-400 group-hover:text-zinc-600'
                          )}
                        />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Property Context Footer */}
      <div className="border-t border-zinc-200/80 p-3 bg-zinc-50/70">
        <div className="flex items-center gap-2.5 rounded-lg border border-zinc-200/70 bg-white p-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-50 text-blue-600 shrink-0">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-zinc-900 truncate">Hotel PMS & Extranet</p>
            <p className="text-[10px] text-zinc-500 truncate">B2B Channel Manager SaaS</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
