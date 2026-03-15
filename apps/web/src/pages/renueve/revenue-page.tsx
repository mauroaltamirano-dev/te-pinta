import { OrdersRevenueTable } from "../../features/orders/orders-revenue-table";
import { RevenueSummaryCards } from "../../features/dashboard/revenue-summary-cards";

export function RevenuePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Resultados
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Ingresos</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Resumen visual de los pedidos entregados, ingresos generados y
          resultado estimado del negocio comparado con los egresos registrados.
        </p>
      </section>

      <RevenueSummaryCards />

      <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
        <div className="border-b border-sombra px-5 py-4">
          <h2 className="text-lg font-bold text-bordo">Pedidos entregados</h2>
          <p className="mt-1 text-sm text-cafe/75">
            Pedidos contabilizados como ingreso en el resumen actual del negocio.
          </p>
        </div>

        <OrdersRevenueTable />
      </section>
    </div>
  );
}
