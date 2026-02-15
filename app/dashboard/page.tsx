import { getCachedDashboardStats } from '@/lib/dashboard-stats';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
  const stats = await getCachedDashboardStats();
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Data</h1>
      <DashboardClient initialStats={stats} />
    </section>
  );
}
