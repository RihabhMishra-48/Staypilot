import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { Percent } from 'lucide-react';

export default function RatesPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 2"
      title="Rates, Plans & Restriction Management"
      description="Manage rate plans, seasonal pricing, minimum length of stay (MLOS), and closed-to-arrival rules."
      icon={Percent}
      plannedFeatures={[
        'Multiple rate plans: European Plan (EP / Room Only), Continental Plan (CP / Breakfast), and MAP / AP packages.',
        'Bulk date range rate updater with percentage or flat rate modifications.',
        'Restriction manager: Minimum Length of Stay (MLOS), Maximum Stay, Closed to Arrival (CTA), Closed to Departure (CTD).',
        'Occupancy-based pricing (Single occupancy discount, Extra adult/child surcharge).',
        'Weekend vs. weekday automated rate rules.',
      ]}
      architecturalFoundation={[
        'Currency standards tied to property.currency from Phase 1.',
        'Manager and Owner role authorization for modifying rates and commercial plans.',
        'Auditing columns tracking rate modification histories.',
      ]}
    />
  );
}
