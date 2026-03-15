import { IngredientsNeededTable } from "../../features/production/ingredients-needed-table";

export function ProductionPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Operaciones
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Producción</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Ingredientes necesarios para cumplir con los pedidos pendientes y
          confirmados. Usá esta vista para planificar compras y preparar la
          producción del día.
        </p>
      </section>

      <IngredientsNeededTable />
    </div>
  );
}
