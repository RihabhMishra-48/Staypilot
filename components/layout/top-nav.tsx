'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Menu,
  Bell,
  ChevronDown,
  Building,
  Plus,
  LogOut,
  User,
  Calendar,
  Check,
  Settings,
} from 'lucide-react';
import { Property, Profile } from '@/types';
import { logoutAction } from '@/lib/actions/auth';

interface TopNavProps {
  onOpenMobile: () => void;
  properties: (Property & { role?: string })[];
  currentProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  profile: Profile | null;
}

export function TopNav({
  onOpenMobile,
  properties,
  currentProperty,
  onSelectProperty,
  profile,
}: TopNavProps) {
  const pathname = usePathname();
  const [propertyDropdownOpen, setPropertyDropdownOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [notificationOpen, setNotificationOpen] = React.useState(false);

  // Generate breadcrumbs from pathname
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const url = `/${pathSegments.slice(0, index + 1).join('/')}`;
    const title = segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    return { title, url, isLast: index === pathSegments.length - 1 };
  });

  // Current formatted date without hydration mismatch
  const todayDateString = React.useSyncExternalStore(
    () => () => {},
    () =>
      new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    () => ''
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-zinc-200/90 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      {/* Left: Hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 md:hidden"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs">
          <Link
            href="/dashboard"
            className="text-zinc-500 hover:text-zinc-900 transition-colors font-medium"
          >
            StayPilot
          </Link>
          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.url}>
              <span className="text-zinc-300">/</span>
              {crumb.isLast ? (
                <span className="font-semibold text-zinc-900">
                  {crumb.title}
                </span>
              ) : (
                <Link
                  href={crumb.url}
                  className="text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                  {crumb.title}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right: Property Selector, Current Date, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Current Date Display */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-zinc-500 bg-zinc-50 px-2.5 py-1.5 rounded-md border border-zinc-200/70">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-medium text-zinc-700">{todayDateString}</span>
        </div>

        {/* Property Selector Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPropertyDropdownOpen(!propertyDropdownOpen);
              setUserMenuOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50/70 px-2.5 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors max-w-[200px] sm:max-w-[260px]"
          >
            <Building className="h-3.5 w-3.5 text-blue-600 shrink-0" />
            <div className="truncate text-left">
              <span className="font-semibold truncate block">
                {currentProperty ? currentProperty.name : 'Select Property'}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400 shrink-0 ml-auto" />
          </button>

          {propertyDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPropertyDropdownOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg animate-in fade-in zoom-in-95">
                <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Switch Active Property
                </div>

                {properties.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-zinc-500">
                    No registered properties found.
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {properties.map((prop) => {
                      const isSelected = currentProperty?.id === prop.id;
                      return (
                        <button
                          key={prop.id}
                          type="button"
                          onClick={() => {
                            onSelectProperty(prop);
                            setPropertyDropdownOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors',
                            isSelected
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-zinc-700 hover:bg-zinc-100'
                          )}
                        >
                          <div className="truncate">
                            <p className="truncate font-medium">{prop.name}</p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {prop.city}, {prop.state}
                            </p>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-blue-600 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-1 pt-1 border-t border-zinc-100">
                  <Link
                    href="/dashboard/settings/property"
                    onClick={() => setPropertyDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Setup New Property</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications Icon with popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setNotificationOpen(!notificationOpen);
              setUserMenuOpen(false);
              setPropertyDropdownOpen(false);
            }}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
          </button>

          {notificationOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotificationOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-72 rounded-xl border border-zinc-200 bg-white p-3 shadow-lg animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-xs font-semibold text-zinc-900">Notifications</span>
                  <span className="text-[10px] font-medium text-zinc-400">Live PMS alerts</span>
                </div>
                <div className="py-6 text-center text-xs text-zinc-500">
                  No unread notifications
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setPropertyDropdownOpen(false);
              setNotificationOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white p-1.5 sm:px-2.5 text-xs text-zinc-800 hover:bg-zinc-50 transition-colors"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white uppercase">
              {profile?.full_name ? profile.full_name[0] : 'U'}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-zinc-900">
                {profile?.full_name || 'Hotel Admin'}
              </span>
              <span className="text-[10px] text-zinc-400 leading-tight">
                Owner / Manager
              </span>
            </div>
            <ChevronDown className="hidden sm:block h-3.5 w-3.5 text-zinc-400 ml-1" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />
              <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-zinc-100">
                  <p className="text-xs font-semibold text-zinc-900">
                    {profile?.full_name || 'Hotel Admin'}
                  </p>
                  <p className="text-[11px] text-zinc-400 truncate">
                    Hotelier Account
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/dashboard/settings/property"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Property Settings</span>
                  </Link>

                  <Link
                    href="/dashboard/staff"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-zinc-500" />
                    <span>Staff & Access</span>
                  </Link>
                </div>

                <div className="pt-1 border-t border-zinc-100">
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
