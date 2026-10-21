import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { ConciergeBell } from 'lucide-react';

export default function FrontDeskPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 3"
      title="Front Desk & Reception Operations"
      description="Streamlined daily arrivals, departures, walk-in reservations, and keycard handoffs."
      icon={ConciergeBell}
      plannedFeatures={[
        'Express 30-second digital check-in interface designed for busy lobby hours.',
        'Walk-in reservation wizard with instant rate quotes and instant room assignment.',
        'Deposit collection, pre-authorizations, and credit card / cash receipt creation.',
        'Keycard encoder integration and physical room key tracker.',
        'Night Audit checklist: Daily revenue closing, no-show processing, and day turnover.',
      ]}
      architecturalFoundation={[
        'Role-based permissions supporting receptionist role from property_members.',
        'Audit log triggers capturing all staff status changes.',
        'Direct connection to Phase 1 property check-in and check-out rules.',
      ]}
    />
  );
}
