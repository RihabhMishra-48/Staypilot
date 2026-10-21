import { FuturePhasePlaceholder } from '@/components/layout/future-phase-placeholder';
import { BarChart3 } from 'lucide-react';

export default function ReportsPage() {
  return (
    <FuturePhasePlaceholder
      phase="Phase 6"
      title="Hospitality Reports & Revenue Analytics"
      description="Deep executive analytics, occupancy trends, RevPAR forecasting, and tax audit reports."
      icon={BarChart3}
      plannedFeatures={[
        'Comprehensive RevPAR, ADR (Average Daily Rate), and Occupancy % historical trends.',
        'OTA Channel production analysis: Compare revenue, cancellations, and net ADR by channel.',
        'Managerial Flash Reports: Daily revenue snapshot delivered automatically to property owners.',
        'Monthly GST tax audit reports exportable to Excel and CSV.',
        'Pacing reports: Compare advance pickup against same time last year.',
      ]}
      architecturalFoundation={[
        'PostgreSQL aggregate query optimization using indexed stay records.',
        'Owner and Manager exclusive RLS protection on financial analytics.',
        'Exportable CSV and PDF generation pipeline.',
      ]}
    />
  );
}
