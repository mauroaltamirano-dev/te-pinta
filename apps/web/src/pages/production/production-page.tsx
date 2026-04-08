import { IngredientsNeededTable } from "../../features/production/ingredients-needed-table";

export function ProductionPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Operaciones
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Producción</h1>
        </div>
      </div>

      <div className="max-w-2xl">
        <p className="text-sm leading-6 text-soft">
          Ingredientes necesarios para cumplir con los pedidos pendientes y confirmados. Usá esta vista para planificar compras y preparar la producción del día.
        </p>
      </div>

      {/* ── Contenido ────────────────────────────────────────── */}
      <div>
        <IngredientsNeededTable />
      </div>
    </div>
  );
}
