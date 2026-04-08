import { OrdersRevenueTable } from "../../features/orders/orders-revenue-table";
import { RevenueSummaryCards } from "../../features/dashboard/components/revenue-summary-cards";

export function RevenuePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Resultados
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Ingresos</h1>
        </div>
      </div>

      <div className="max-w-3xl">
        <p className="text-sm leading-6 text-soft">
          Resumen visual de los pedidos entregados, ingresos generados y resultado estimado del negocio comparado con los egresos registrados.
        </p>
      </div>

      <RevenueSummaryCards />

      <div>
        <OrdersRevenueTable />
      </div>
    </div>
  );
}
