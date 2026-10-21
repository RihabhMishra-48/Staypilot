import * as React from 'react';
import { Metadata } from 'next';
import { ScrollText, ShieldAlert } from 'lucide-react';
import { getPlatformAuditLogsAction } from '@/lib/actions/platform-admin';

export const metadata: Metadata = {
  title: 'Platform Audit Trail — StayPilot Super Admin',
  description: 'Immutable system-wide audit logs of security events, tenant status changes, and operator actions.',
};

export default async function PlatformAuditLogsPage() {
  const logs = await getPlatformAuditLogsAction(100);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            Platform Audit Trail
          </h1>
          <span className="rounded bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400 border border-amber-500/20">
            Append-Only
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400">
          Cryptographically recorded security actions, role assignments, and tenant lifecycle events.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-950 shadow-sm overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ScrollText className="mx-auto h-8 w-8 text-zinc-700" />
            <p className="text-xs font-semibold text-zinc-300">No audit events recorded yet</p>
            <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
              System events such as tenant status updates and channel configuration changes will be immutably recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Entity ID</th>
                  <th className="px-4 py-3">Operator ID</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-900/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-amber-400 font-semibold">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 uppercase text-[10px] text-zinc-400">
                      {log.entity_type}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-500 max-w-[120px] truncate">
                      {log.entity_id}
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-zinc-500 max-w-[120px] truncate">
                      {log.user_id || 'System'}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-[10px] text-zinc-400 max-w-xs truncate">
                      {JSON.stringify(log.details || {})}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
