import { PurchasesLedgerTable } from "../../features/purchases/purchases-ledger-table";
import { PurchasesSummaryCards } from "../../features/purchases/purchases-summary-cards";

export function FinancePage() {
  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="max-w-2xl">
        <p className="text-sm leading-relaxed text-foreground-muted">
          Resumen visual de todas las compras, gastos operativos e inversiones
          registradas. Filtrá por tipo para analizar cada categoría por separado.
        </p>
      </div>

      {/* ── Summary cards ── */}
      <PurchasesSummaryCards />

      {/* ── Ledger table ── */}
      <PurchasesLedgerTable />
    </div>
  );
}
