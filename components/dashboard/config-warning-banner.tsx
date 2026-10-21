import * as React from 'react';
import { AlertCircle, KeyRound, Database, ExternalLink } from 'lucide-react';

interface ConfigWarningBannerProps {
  isConfigured: boolean;
}

export function ConfigWarningBanner({ isConfigured }: ConfigWarningBannerProps) {
  if (isConfigured) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
            <AlertCircle className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
              Supabase PostgreSQL Connection Required for Live Persistence
            </h4>
            <p className="mt-1 text-xs text-amber-800 leading-relaxed">
              StayPilot is running in demonstration mode. To enable live Supabase Auth, property registration, and RLS multi-tenant security, configure your project credentials in <code className="rounded bg-amber-100/80 px-1.5 py-0.5 font-mono text-[11px] text-amber-900 border border-amber-200">.env.local</code>.
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-zinc-700 border border-amber-200">
                <Database className="h-3 w-3 text-amber-600" />
                Migrations: <code className="font-mono text-zinc-800">supabase/migrations</code>
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-zinc-700 border border-amber-200">
                <KeyRound className="h-3 w-3 text-amber-600" />
                Template: <code className="font-mono text-zinc-800">.env.example</code>
              </span>
            </div>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 self-start shrink-0 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition-colors shadow-2xs"
        >
          <span>Supabase Dashboard</span>
          <ExternalLink className="h-3.5 w-3.5 text-amber-600" />
        </a>
      </div>
    </div>
  );
}
