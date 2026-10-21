import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { Users } from 'lucide-react';

export default function GuestsPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 3"
      title="Guest Directory & Hospitality CRM"
      description="Centralized guest profiles, stay histories, VIP preferences, and government compliance documents."
      icon={Users}
      plannedFeatures={[
        'Unified guest profiles consolidating repeat stays across direct bookings and OTA channels.',
        'Digital identity document vault (Aadhaar, Passport, Driver License) with encrypted Supabase storage.',
        'VIP tiering, dietary preferences, special requirements, and blacklist management.',
        'Lifetime spend and average length of stay (ALOS) calculation for loyalty marketing.',
        'GDPR and local data privacy compliance export and anonymization tools.',
      ]}
      architecturalFoundation={[
        'Multi-tenant guest segregation via property_members access controls.',
        'Supabase Storage bucket architecture prepared for secure encrypted identity files.',
        'Fast index lookup by phone number, email, and identity proof number.',
      ]}
    />
  );
}
