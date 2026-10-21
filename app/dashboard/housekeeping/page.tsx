import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { Sparkles } from 'lucide-react';

export default function HousekeepingPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 3"
      title="Housekeeping & Facility Maintenance"
      description="Live room cleaning statuses, staff task allocation, and inspection workflows."
      icon={Sparkles}
      plannedFeatures={[
        'Room status matrix: Clean, Dirty, Inspected, In Progress, and Out of Order.',
        'Automated cleaning queue triggered upon guest check-out.',
        'Mobile-friendly task view optimized for housekeeping attendants on smartphones.',
        'Maintenance ticket logging: Air conditioning, plumbing, carpentry issues with photo upload.',
        'Linen and room supply inventory depletion tracking.',
      ]}
      architecturalFoundation={[
        'Housekeeping staff role defined in Phase 1 property_members schema.',
        'Granular RLS restricting cleaners to update only room cleanliness attributes.',
        'WebSocket real-time push to notify front desk immediately when a room is inspected.',
      ]}
    />
  );
}
