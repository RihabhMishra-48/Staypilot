import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { CalendarDays } from 'lucide-react';

export default function ReservationsPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 3"
      title="Reservations & Folio Management"
      description="Central reservation repository connecting direct web bookings, OTA channels, and front desk walk-ins."
      icon={CalendarDays}
      plannedFeatures={[
        'Comprehensive reservation lifecycle: Confirmed, Checked-in, Checked-out, Cancelled, and No-show states.',
        'Concurrency-safe room allocation engine utilizing database row locks to prevent double-booking.',
        'Multi-guest folios with split billing, extra bed charges, meal plans, and incidentals.',
        'Direct check-in / check-out actions that update inventory and room cleanliness states in real time.',
        'Automated booking confirmation emails and WhatsApp notifications for guests.',
      ]}
      architecturalFoundation={[
        'PostgreSQL foreign key relations designed to cascade from public.properties table.',
        'Multi-tenant Row Level Security (RLS) restricting reservations to verified property team members.',
        'Profile linking for guest CRM and return-visitor recognition.',
      ]}
    />
  );
}
