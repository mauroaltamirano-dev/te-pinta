import { PurchaseForm } from "../../features/purchases/purchase-form";
import { PurchasesTable } from "../../features/purchases/purchases-table";

export function PurchasesPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Egresos
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Compras y gastos</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Registrá las compras de ingredientes, gastos operativos e inversiones
          del negocio. Todos los movimientos quedan asentados en el libro de
          cuentas para el análisis de resultados.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div>
          <PurchaseForm />
        </div>

        <div>
          <PurchasesTable />
        </div>
      </section>
    </div>
  );
}
