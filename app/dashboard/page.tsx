'use client';

import * as React from 'react';
import { usePropertyContext } from '@/components/layout/dashboard-layout-client';
import { MetricCard } from '@/components/dashboard/metric-card';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RecentReservations } from '@/components/dashboard/recent-reservations';
import { UpcomingArrivals } from '@/components/dashboard/upcoming-arrivals';
import { ChannelBreakdown } from '@/components/dashboard/channel-breakdown';
import { ConfigWarningBanner } from '@/components/dashboard/config-warning-banner';
import { getRoomInventoryMetrics } from '@/lib/actions/room';
import { RoomInventoryMetrics } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  BedDouble,
  CheckCircle2,
  Sparkles,
  Wrench,
  CalendarCheck2,
  CalendarX2,
  IndianRupee,
  Building,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const { currentProperty, isConfigured } = usePropertyContext();
  const propertyId = currentProperty?.id || '';
  const currency = currentProperty?.currency || 'INR';

  const [realMetrics, setRealMetrics] = React.useState<RoomInventoryMetrics>({
    totalRooms: 0,
    availableRooms: 0,
    cleaningRooms: 0,
    dirtyRooms: 0,
    maintenanceRooms: 0,
    outOfServiceRooms: 0,
    totalRoomTypes: 0,
    activeRoomTypes: 0,
  });

  React.useEffect(() => {
    if (propertyId && isConfigured) {
      getRoomInventoryMetrics(propertyId)
        .then((m) => {
          setRealMetrics(m);
        })
        .catch(() => {});
    }
  }, [propertyId, isConfigured]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Configuration Warning if Supabase unconfigured */}
      <ConfigWarningBanner isConfigured={isConfigured} />

      {/* 2. Setup prompt if no property registered yet */}
      {!currentProperty && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 text-center">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-blue-600 text-white mb-3 shadow-xs">
            <Building className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-zinc-900">
            Welcome to StayPilot Hotel OS
          </h2>
          <p className="mt-1 text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
            You do not have a hotel property selected. Register your property to configure physical rooms, inventory categories, and operational statuses.
          </p>
          <Link href="/dashboard/settings/property">
            <Button variant="primary" size="sm" className="mt-4">
              <Plus className="h-4 w-4 mr-1.5" />
              Setup Hotel Property
            </Button>
          </Link>
        </div>
      )}

      {/* 3. Top Header & Quick Actions */}
      {currentProperty && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
                {currentProperty.name}
              </h1>
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                Live PMS
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {currentProperty.city}, {currentProperty.state} • Currency: {currency} • Real-time operational inventory &amp; front desk monitoring.
            </p>
          </div>

          <QuickActions />
        </div>
      )}

      {/* 4. Core Room Inventory Metrics (Live Database Data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Physical Rooms"
          value={realMetrics.totalRooms}
          subtitle={`${realMetrics.activeRoomTypes} active room categories`}
          icon={BedDouble}
        />
        <MetricCard
          title="Ready / Clean"
          value={realMetrics.availableRooms}
          subtitle="Operationally available"
          icon={CheckCircle2}
        />
        <MetricCard
          title="Housekeeping Queue"
          value={realMetrics.cleaningRooms + realMetrics.dirtyRooms}
          subtitle={`${realMetrics.dirtyRooms} dirty • ${realMetrics.cleaningRooms} cleaning`}
          icon={Sparkles}
        />
        <MetricCard
          title="Under Maintenance"
          value={realMetrics.maintenanceRooms + realMetrics.outOfServiceRooms}
          subtitle={`${realMetrics.maintenanceRooms} maint • ${realMetrics.outOfServiceRooms} OOS`}
          icon={Wrench}
        />
      </div>

      {/* 5. Daily Operations & Revenue Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <MetricCard
          title="Today's Arrivals"
          value={0}
          subtitle="0 check-ins scheduled"
          icon={CalendarCheck2}
        />
        <MetricCard
          title="Today's Departures"
          value={0}
          subtitle="0 check-outs scheduled"
          icon={CalendarX2}
        />
        <MetricCard
          title="Revenue Overview"
          value={formatCurrency(0, currency)}
          subtitle={`ADR: ${formatCurrency(0, currency)} | RevPAR: ${formatCurrency(0, currency)}`}
          icon={IndianRupee}
        />
      </div>

      {/* 6. Main Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Reservations Table */}
        <div className="lg:col-span-2 space-y-6">
          <RecentReservations
            reservations={[]}
            currency={currency}
          />
          <ChannelBreakdown sources={[]} />
        </div>

        {/* Right 1 Col: Upcoming Arrivals Stream */}
        <div className="space-y-6">
          <UpcomingArrivals arrivals={[]} />
        </div>
      </div>
    </div>
  );
}
