import * as React from 'react';
import { Metadata } from 'next';
import { ExternalLink } from 'lucide-react';
import { getAllChannelMetadata } from '@/lib/integrations/registry';
import { createClient } from '@/lib/supabase/server';
import { verifyPlatformAdmin } from '@/lib/auth/platform-admin';

export const metadata: Metadata = {
  title: 'OTA Integrations Master — StayPilot Super Admin',
  description: 'Manage supported OTA connectors and platform integration gateways.',
};

export default async function PlatformIntegrationsPage() {
  await verifyPlatformAdmin();
  const channels = getAllChannelMetadata();
  const supabase = await createClient();

  const { data: connections } = await supabase
    .from('channel_connections')
    .select('channel, status');

  const countByChannel: Record<string, number> = {};
  if (connections) {
    for (const c of connections) {
      if (c.status === 'connected') {
        countByChannel[c.channel] = (countByChannel[c.channel] || 0) + 1;
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            OTA Channel Integrations
          </h1>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Connectivity Gateways
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Supported bilateral OTA partner connectors: MakeMyTrip, Goibibo, Agoda, and Booking.com.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {channels.map((ch) => {
          const activeCount = countByChannel[ch.channel] || 0;

          return (
            <div
              key={ch.channel}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{ch.name}</h3>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">
                    {ch.category}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-xl font-bold text-white">{activeCount}</span>
                  <span className="block text-[10px] text-zinc-500">Active Properties</span>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">{ch.description}</p>

              <div className="rounded-lg bg-zinc-900 p-3 border border-zinc-800/80 space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Authentication Protocol
                </p>
                <div className="space-y-1 text-xs text-zinc-300">
                  {ch.fields.map((f) => (
                    <div key={f.key} className="flex items-center justify-between">
                      <span className="text-zinc-400">{f.label}:</span>
                      <span className="font-mono text-[11px] text-amber-400">{f.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                <a
                  href={ch.documentationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-400 hover:text-white"
                >
                  <span>Partner Documentation</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <a
                  href={ch.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                >
                  <span>Extranet Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
