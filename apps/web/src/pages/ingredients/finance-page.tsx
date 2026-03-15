import { PurchasesLedgerTable } from "../../features/purchases/purchases-ledger-table";
import { PurchasesSummaryCards } from "../../features/purchases/purchases-summary-cards";

export function FinancePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Egresos
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">
          Finanzas / Libro contable
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Resumen visual de todas las compras, gastos operativos e inversiones
          registradas. Filtrá por tipo para analizar cada categoría por
          separado.
        </p>
      </section>

      <PurchasesSummaryCards />

      <PurchasesLedgerTable />
    </div>
  );
}
