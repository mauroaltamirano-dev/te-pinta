import { useCallback, useState } from "react";
import { MdAdd } from "react-icons/md";

import { Drawer } from "../../components/ui/Drawer";
import { PurchaseForm } from "../../features/purchases/purchase-form";
import { PurchasesSummaryCards } from "../../features/purchases/purchases-summary-cards";
import { PurchasesTable } from "../../features/purchases/purchases-table";

export function PurchasesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);

  const openNew = useCallback(() => {
    setSelectedPurchaseId(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((id: string) => {
    setSelectedPurchaseId(id);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setSelectedPurchaseId(null);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Egresos
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">
            Compras y gastos
          </h1>
          <p className="mt-2 max-w-3xl text-sm text-soft">
            Registrá compras de ingredientes, gastos operativos e inversiones.
            Todos los movimientos impactan en el análisis del negocio y en el
            libro contable.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <MdAdd size={18} />
          Nueva compra
        </button>
      </div>

      <PurchasesSummaryCards />

      <PurchasesTable onEdit={openEdit} />

      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <PurchaseForm purchaseId={selectedPurchaseId} onCancel={closeDrawer} />
      </Drawer>
    </div>
  );
}
