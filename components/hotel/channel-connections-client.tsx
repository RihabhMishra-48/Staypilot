'use client';

import * as React from 'react';
import {
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  KeyRound,
  RefreshCw,
  PowerOff,
} from 'lucide-react';
import { ChannelSummary, SupportedChannel } from '@/types';
import { getAllChannelMetadata } from '@/lib/integrations/registry';
import { useHotelProperty } from './hotel-layout-client';
import {
  saveChannelConnectionAction,
  disconnectChannelAction,
  triggerChannelSyncAction,
} from '@/lib/actions/channel';

interface ChannelConnectionsClientProps {
  initialSummaries: ChannelSummary[];
}

export function ChannelConnectionsClient({
  initialSummaries,
}: ChannelConnectionsClientProps) {
  const { currentProperty } = useHotelProperty();
  const [summaries, setSummaries] = React.useState<ChannelSummary[]>(initialSummaries);
  const [selectedChannel, setSelectedChannel] = React.useState<SupportedChannel | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [actionNotice, setActionNotice] = React.useState<{ text: string; error?: boolean } | null>(null);

  const channelsMeta = React.useMemo(() => getAllChannelMetadata(), []);

  const activeModalChannelMeta = React.useMemo(
    () => (selectedChannel ? channelsMeta.find((m) => m.channel === selectedChannel) : null),
    [selectedChannel, channelsMeta]
  );

  const currentModalSummary = React.useMemo(
    () => (selectedChannel ? summaries.find((s) => s.channel === selectedChannel) : null),
    [selectedChannel, summaries]
  );

  const handleSaveCredentials = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentProperty || !selectedChannel || !activeModalChannelMeta) return;

    setIsSaving(true);
    setActionNotice(null);

    const formData = new FormData(e.currentTarget);
    const hotelId = formData.get('hotel_identifier') as string;
    const creds: Record<string, string> = {};

    activeModalChannelMeta.fields.forEach((field) => {
      creds[field.key] = (formData.get(field.key) as string) || '';
    });

    try {
      const res = await saveChannelConnectionAction(
        currentProperty.id,
        selectedChannel,
        hotelId,
        creds
      );

      setActionNotice({ text: res.message, error: !res.success });
      if (res.data) {
        setSummaries((prev) =>
          prev.map((s) =>
            s.channel === selectedChannel
              ? {
                  ...s,
                  connection: res.data || null,
                  syncHealth: res.data?.status === 'connected' ? 'healthy' : 'error',
                }
              : s
          )
        );
      }
      setSelectedChannel(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection attempt failed';
      setActionNotice({ text: msg, error: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisconnect = async (channel: SupportedChannel) => {
    if (!currentProperty) return;
    if (!confirm(`Are you sure you want to disconnect ${channel}? Rates and availability will cease syncing.`)) {
      return;
    }

    try {
      const res = await disconnectChannelAction(currentProperty.id, channel);
      setActionNotice({ text: res.message, error: !res.success });
      setSummaries((prev) =>
        prev.map((s) =>
          s.channel === channel
            ? { ...s, connection: null, syncHealth: 'disconnected' }
            : s
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to disconnect channel';
      setActionNotice({ text: msg, error: true });
    }
  };

  const handleSync = async (channel: SupportedChannel) => {
    if (!currentProperty) return;
    try {
      const res = await triggerChannelSyncAction(currentProperty.id, channel, 'full');
      setActionNotice({ text: res.message, error: !res.success });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setActionNotice({ text: msg, error: true });
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-950">OTA Channel Connections</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Configure direct connectivity with supported travel agents. StayPilot communicates directly with authorized partner APIs to push rates, update availability, and receive bookings.
        </p>
      </div>

      {actionNotice && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center justify-between ${
            actionNotice.error
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{actionNotice.text}</span>
          <button
            onClick={() => setActionNotice(null)}
            className="text-[11px] underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Connectivity Architecture Notice */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-blue-950">Official Partner API Architecture</p>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            StayPilot does not fake connectivity or use scraping. We connect exclusively via authorized hotel extranet APIs, partner gateways, or direct Channel Manager connectivity hubs. Channels without verified active credentials remain safely in disconnected status.
          </p>
        </div>
      </div>

      {/* Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {channelsMeta.map((meta) => {
          const summary = summaries.find((s) => s.channel === meta.channel);
          const isConnected = summary?.connection?.status === 'connected';
          const isError = summary?.connection?.status === 'error';

          return (
            <div
              key={meta.channel}
              className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-zinc-900">{meta.name}</h3>
                      <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-600">
                        {meta.category}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">{meta.description}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold shrink-0 ${
                      isConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isError
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                    }`}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        <span>Connected</span>
                      </>
                    ) : isError ? (
                      <>
                        <XCircle className="h-3 w-3 text-rose-600" />
                        <span>Configuration Error</span>
                      </>
                    ) : (
                      <span>Not Connected</span>
                    )}
                  </span>
                </div>

                {/* Requirements Checklist */}
                <div className="rounded-lg bg-zinc-50 p-3 space-y-1.5 border border-zinc-100">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Partner Prerequisites
                  </p>
                  <ul className="space-y-1 text-[11px] text-zinc-600">
                    {meta.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-zinc-400">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status details if configured */}
                {summary?.connection?.last_error && (
                  <div className="rounded-lg bg-rose-50/80 p-2.5 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{summary.connection.last_error}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                <a
                  href={meta.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-800"
                >
                  <span>Extranet Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>

                <div className="flex items-center gap-2">
                  {isConnected && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSync(meta.channel)}
                        className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Sync Now</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDisconnect(meta.channel)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 shadow-2xs"
                      >
                        <PowerOff className="h-3 w-3" />
                        <span>Disconnect</span>
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedChannel(meta.channel)}
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors"
                  >
                    <KeyRound className="h-3 w-3" />
                    <span>{isConnected ? 'Edit Credentials' : 'Setup Connection'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Configure Credentials Modal */}
      {selectedChannel && activeModalChannelMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-base font-bold text-zinc-900">
                  Connect {activeModalChannelMeta.name}
                </h2>
                <p className="text-xs text-zinc-500">
                  Enter authorized partner credentials provided by {activeModalChannelMeta.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedChannel(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCredentials} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-800 mb-1">
                  Hotel Identifier / Extranet Property ID
                </label>
                <input
                  type="text"
                  name="hotel_identifier"
                  required
                  defaultValue={currentModalSummary?.connection?.hotel_identifier || ''}
                  placeholder="e.g. 1029384"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-[10px] text-zinc-400 mt-1">
                  The unique numeric or alphanumeric hotel ID as shown in your {activeModalChannelMeta.name} partner dashboard.
                </p>
              </div>

              {activeModalChannelMeta.fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-zinc-800 mb-1">
                    {field.label} {field.required && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type={field.type}
                    name={field.key}
                    required={field.required}
                    placeholder={field.placeholder}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">{field.description}</p>
                </div>
              ))}

              <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-100 text-[11px] text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-800">Security Guarantee</p>
                <p>
                  API credentials are encrypted at rest and never shared with browser clients. StayPilot uses credentials solely for authenticated machine-to-machine inventory and rate updates.
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedChannel(null)}
                  className="rounded-lg border border-zinc-200 px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSaving ? 'Verifying with Gateway...' : 'Save & Verify Connection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
