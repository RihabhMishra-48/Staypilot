import {
  DashboardMetrics,
  ReservationPreview,
  UpcomingArrival,
  BookingSourceStat,
} from '@/types';

export const ZERO_DASHBOARD_METRICS: DashboardMetrics = {
  totalRooms: 0,
  occupiedRooms: 0,
  availableRooms: 0,
  todayArrivals: 0,
  todayDepartures: 0,
  occupancyRate: 0,
  totalRevenue: 0,
  averageDailyRate: 0,
  revPar: 0,
  currency: 'INR',
};

export const EMPTY_RESERVATIONS: ReservationPreview[] = [];
export const EMPTY_ARRIVALS: UpcomingArrival[] = [];
export const EMPTY_BOOKING_SOURCES: BookingSourceStat[] = [];

// Aliases for backward compatibility with zero dummy records
export const DEMO_DASHBOARD_METRICS = ZERO_DASHBOARD_METRICS;
export const DEMO_RECENT_RESERVATIONS = EMPTY_RESERVATIONS;
export const DEMO_UPCOMING_ARRIVALS = EMPTY_ARRIVALS;
export const DEMO_BOOKING_SOURCES = EMPTY_BOOKING_SOURCES;
