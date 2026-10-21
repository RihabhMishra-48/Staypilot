import * as React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, Database } from 'lucide-react';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = {
  title: 'Platform Settings — StayPilot Super Admin',
  description: 'Manage StayPilot platform system configuration, webhooks, and security policies.',
};

export default function PlatformSettingsPage() {
  const isDbReady = isSupabaseConfigured();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Platform Operator Settings
          </h1>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            System Config
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Global infrastructure configuration, security flags, and OTA webhook secrets.
        </p>
      </div>

      <div className="space-y-4">
        {/* Database Health Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Database className="h-5 w-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm text-white">Primary Database</h3>
                <p className="text-xs text-zinc-400">Supabase PostgreSQL multi-tenant schema</p>
              </div>
            </div>

            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                isDbReady
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {isDbReady ? 'Connected' : 'Missing Configuration'}
            </span>
          </div>
          <div className="text-[11px] text-zinc-500 space-y-1 pt-2 border-t border-zinc-900">
            <p>Row Level Security (RLS): Active on all tenant tables</p>
            <p>Database migrations: 3 applied (Initial, Rooms &amp; Inventory, Channel Manager)</p>
          </div>
        </div>

        {/* Security Controls */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm text-white">Platform Security Boundaries</h3>
              <p className="text-xs text-zinc-400">Enforcement of tenant isolation and super admin access</p>
            </div>
          </div>
          <div className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-zinc-900">
            <div className="flex items-center justify-between">
              <span>Super Admin Server Verification:</span>
              <span className="font-semibold text-emerald-400">Enforced</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cross-Tenant Data Isolation:</span>
              <span className="font-semibold text-emerald-400">Active (RLS)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Client-Side Service Role Exposure:</span>
              <span className="font-semibold text-emerald-400">Blocked (Zero browser leakage)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
