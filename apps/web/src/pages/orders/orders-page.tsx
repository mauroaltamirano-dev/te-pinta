import { OrderForm } from "../../features/orders/order-form";
import { OrdersTable } from "../../features/orders/orders-table";

export function OrdersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Ventas
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Pedidos</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Registrá los pedidos que recibís y hacé seguimiento de su estado
          desde que se toman hasta que se entregan. Cada pedido queda asentado
          como venta del negocio.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div>
          <OrderForm />
        </div>

        <div>
          <OrdersTable />
        </div>
      </section>
    </div>
  );
}
