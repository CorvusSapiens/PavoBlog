import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return (
    <section>
      <h1 className="text-3xl font-bold mb-4">Data</h1>
      <DashboardClient />
    </section>
  );
}
