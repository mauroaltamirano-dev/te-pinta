import { useState } from "react";
import { useSalesDashboard } from "../../hooks/dashboard/use-sales-dashboard";
import { DashboardRangeFilter } from "../../features/dashboard/components/dashboard-range-filter";
import { KpiCard } from "../../features/dashboard/components/kpi-card";
import { SalesTrendChart } from "../../features/dashboard/components/sales-trend-chart";
import { RecentSalesTable } from "../../features/dashboard/components/recent-sales-table";
import { TopProductsList } from "../../features/dashboard/components/top-products-list";
import type { DashboardRange } from "../../services/api/dashboard.api";
import { SalesByChannelList } from "../../features/dashboard/components/sales-by-channel-list";

export function SalesDashboardPage() {
  const [range, setRange] = useState<DashboardRange>("7d");

  const { data, isLoading, isError } = useSalesDashboard(range);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
            Resumen
          </p>
          <h1 className="mt-2 text-3xl font-bold text-bordo">
            Dashboard de ventas
          </h1>
        </div>
        <p className="text-sm text-cafe/70">Cargando dashboard...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
          <h1 className="text-3xl font-bold text-bordo">Dashboard de ventas</h1>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          No se pudo cargar el dashboard. Verificá la conexión e intentá de
          nuevo.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
              Resumen
            </p>
            <h1 className="mt-2 text-3xl font-bold text-bordo">
              Dashboard de ventas
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-cafe/85">
              Resumen general del desempeño comercial del negocio en el período
              seleccionado.
            </p>
          </div>

          <DashboardRangeFilter value={range} onChange={setRange} />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Ventas brutas"
          value={`$${data.summary.grossSales.toLocaleString("es-AR")}`}
        />
        <KpiCard
          title="Pedidos"
          value={data.summary.totalOrders.toLocaleString("es-AR")}
        />
        <KpiCard
          title="Ticket promedio"
          value={`$${data.summary.averageTicket.toLocaleString("es-AR")}`}
        />
        <KpiCard
          title="Items vendidos"
          value={data.summary.totalItemsSold.toLocaleString("es-AR")}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <SalesTrendChart data={data.trend} />

        <div className="space-y-6">
          <TopProductsList data={data.topProducts} />
          <SalesByChannelList data={data.byPaymentMethod} />
        </div>
      </div>

      <RecentSalesTable data={data.recentSales} />
    </div>
  );
}
