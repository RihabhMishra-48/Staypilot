'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Radio,
  Network,
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  BedDouble,
  RefreshCw,
  Plus,
  Building,
} from 'lucide-react';
import {
  RoomInventoryMetrics,
  ChannelSummary,
  ChannelSyncLog,
  ReservationPreview,
  SupportedChannel,
} from '@/types';
import { useHotelProperty } from './hotel-layout-client';
import { triggerChannelSyncAction } from '@/lib/actions/channel';

interface HotelDashboardClientProps {
  initialMetrics: RoomInventoryMetrics;
  channelSummaries: ChannelSummary[];
  syncLogs: ChannelSyncLog[];
  recentReservations: ReservationPreview[];
}

export function HotelDashboardClient({
  initialMetrics,
  channelSummaries,
  syncLogs,
  recentReservations,
}: HotelDashboardClientProps) {
  const { currentProperty } = useHotelProperty();
  const [syncingChannel, setSyncingChannel] = React.useState<string | null>(null);
  const [syncNotice, setSyncNotice] = React.useState<{ text: string; error?: boolean } | null>(null);

  const connectedChannelsCount = channelSummaries.filter(
    (c) => c.connection?.status === 'connected'
  ).length;

  const errorChannelsCount = channelSummaries.filter(
    (c) => c.connection?.status === 'error' || c.syncHealth === 'error'
  ).length;

  const handleSyncNow = async (channel: SupportedChannel) => {
    if (!currentProperty) return;
    setSyncingChannel(channel);
    setSyncNotice(null);
    try {
      const res = await triggerChannelSyncAction(currentProperty.id, channel, 'full');
      setSyncNotice({ text: res.message, error: !res.success });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to trigger sync';
      setSyncNotice({ text: msg, error: true });
    } finally {
      setSyncingChannel(null);
    }
  };

  if (!currentProperty) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-8 text-center space-y-4 shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
            <Building className="h-7 w-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-xl font-bold text-zinc-900">Welcome to StayPilot Hotel Channel Manager</h2>
            <p className="text-sm text-zinc-600">
              Get started by registering your hotel property to connect OTAs and synchronize room inventory and rates.
            </p>
          </div>
          <Link
            href="/hotel/settings"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Setup Your Hotel Property</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Property & Live Status Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950">{currentProperty.name}</h1>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              Channel Manager Active
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time OTA channel synchronization, rates distribution, and room inventory control.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/hotel/channel-manager/connections"
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors"
          >
            <Network className="h-3.5 w-3.5 text-zinc-500" />
            <span>Manage Connections</span>
          </Link>

          <Link
            href="/hotel/channel-manager"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-2xs transition-colors"
          >
            <Radio className="h-3.5 w-3.5" />
            <span>Rate & Availability Matrix</span>
          </Link>
        </div>
      </div>

      {syncNotice && (
        <div
          className={`rounded-lg p-3 text-xs flex items-center justify-between ${
            syncNotice.error
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <span>{syncNotice.text}</span>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-[11px] underline font-semibold ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary KPI Row — Channel Manager Focus */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Connected OTAs */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Connected OTAs</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Network className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-950">
              {connectedChannelsCount} / {channelSummaries.length}
            </span>
            <span className="text-xs text-zinc-500">Channels</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {connectedChannelsCount > 0
              ? 'Live 2-way rate and inventory sync enabled'
              : 'No OTAs connected yet — connect your first channel'}
          </p>
        </div>

        {/* Sync Health */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Sync Health</span>
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                errorChannelsCount > 0
                  ? 'bg-rose-50 text-rose-600'
                  : connectedChannelsCount > 0
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'bg-zinc-100 text-zinc-500'
              }`}
            >
              {errorChannelsCount > 0 ? (
                <AlertTriangle className="h-4 w-4" />
              ) : connectedChannelsCount > 0 ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-950">
              {errorChannelsCount > 0
                ? `${errorChannelsCount} Alert${errorChannelsCount > 1 ? 's' : ''}`
                : connectedChannelsCount > 0
                ? 'Healthy'
                : 'Standby'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {errorChannelsCount > 0
              ? 'Sync errors require credentials verification'
              : 'All configured connectors running normally'}
          </p>
        </div>

        {/* Total Physical Inventory */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Room Inventory</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-100 text-zinc-600">
              <BedDouble className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-950">
              {initialMetrics.totalRooms}
            </span>
            <span className="text-xs text-zinc-500">Rooms ({initialMetrics.availableRooms} sellable)</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {initialMetrics.activeRoomTypes} active room types configured in PMS
          </p>
        </div>

        {/* Last Sync Attempt */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Recent Sync Logs</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <History className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-950">
              {syncLogs.length}
            </span>
            <span className="text-xs text-zinc-500">Recorded events</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            {syncLogs.length > 0 ? 'Full audit log tracked in database' : 'No sync attempts logged yet'}
          </p>
        </div>
      </div>

      {/* Target OTA Distribution Status Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-900">OTA Channel Connections</h2>
            <p className="text-xs text-zinc-500">
              Status of authorized bilateral connectors for MakeMyTrip, Goibibo, Agoda, and Booking.com.
            </p>
          </div>
          <Link
            href="/hotel/channel-manager/connections"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>Configure All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {channelSummaries.map((summary) => {
            const isConnected = summary.connection?.status === 'connected';
            const isError = summary.connection?.status === 'error';
            const isSyncing = syncingChannel === summary.channel;

            return (
              <div
                key={summary.channel}
                className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-zinc-900">{summary.displayName}</h3>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {summary.connection?.hotel_identifier || 'Extranet unlinked'}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        isConnected
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isError
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {isConnected ? (
                        <>
                          <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" />
                          <span>Connected</span>
                        </>
                      ) : isError ? (
                        <>
                          <XCircle className="h-2.5 w-2.5 text-rose-600" />
                          <span>Error</span>
                        </>
                      ) : (
                        <span>Not Connected</span>
                      )}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-zinc-500">
                      <span>Mapped Room Types:</span>
                      <span className="font-semibold text-zinc-800">{summary.mappedRoomTypesCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-500">
                      <span>Last Successful Sync:</span>
                      <span className="font-medium text-zinc-700">
                        {summary.connection?.last_successful_sync_at
                          ? new Date(summary.connection.last_successful_sync_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : 'Never'}
                      </span>
                    </div>
                    {summary.connection?.last_error && (
                      <p className="text-[10px] text-rose-600 bg-rose-50/70 p-1.5 rounded-md border border-rose-100 line-clamp-2 mt-1">
                        {summary.connection.last_error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-2">
                  <Link
                    href={`/hotel/channel-manager/connections`}
                    className="flex-1 text-center rounded-lg border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    {isConnected ? 'Settings' : 'Connect'}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleSyncNow(summary.channel)}
                    disabled={isSyncing}
                    className="inline-flex items-center justify-center rounded-lg border border-zinc-200 p-1.5 text-zinc-600 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
                    title="Trigger sync"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Channel Sync Logs & Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Channel Sync Logs */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Recent Synchronization Activity</h2>
              <p className="text-xs text-zinc-500">Live operational sync status and error diagnostics.</p>
            </div>
            <Link
              href="/hotel/channel-manager/sync-logs"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              View Full Logs
            </Link>
          </div>

          {syncLogs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center space-y-2">
              <History className="mx-auto h-7 w-7 text-zinc-300" />
              <p className="text-xs font-medium text-zinc-700">No sync attempts recorded</p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                Sync logs will automatically record here when room inventory, rate plans, or OTA reservations are transmitted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
              {syncLogs.slice(0, 5).map((log) => {
                const isSuccess = log.status === 'success';
                return (
                  <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 capitalize">
                          {log.channel.replace('_', '.')}
                        </span>
                        <span className="rounded-sm bg-zinc-100 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-600 uppercase">
                          {log.sync_type}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        {log.error_message ? log.error_message : `Synced ${log.items_synced} units`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                          isSuccess
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.status}
                      </span>
                      <span className="block text-[10px] text-zinc-400 mt-0.5">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Real Reservations Folios (Honest Empty State) */}
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Recent Channel Bookings</h2>
              <p className="text-xs text-zinc-500">Live incoming bookings from OTAs and PMS.</p>
            </div>
            <Link
              href="/hotel/reservations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              All Folios
            </Link>
          </div>

          {recentReservations.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-200 p-8 text-center space-y-2">
              <Clock className="mx-auto h-7 w-7 text-zinc-300" />
              <p className="text-xs font-medium text-zinc-700">No reservations recorded yet</p>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                When bookings arrive from connected channels or front desk walk-ins, they will appear here in real time.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              {recentReservations.map((res) => (
                <div key={res.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-zinc-900">{res.guestName}</p>
                    <p className="text-[11px] text-zinc-500">{res.roomType} • Room {res.roomNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-zinc-900">₹{res.amount.toLocaleString()}</span>
                    <span className="block text-[10px] text-blue-600">{res.source}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
