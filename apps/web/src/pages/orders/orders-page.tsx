import { useState, useCallback, useMemo } from "react";

import type { Order } from "../../services/api/orders.api";
import { OrderForm } from "../../features/orders/order-form";
import { Drawer } from "../../components/ui/Drawer";
import { OrdersTable } from "../../features/orders/orders-table";
import { useOrders } from "../../features/orders/use-orders";
import { OrdersOperationalSummary } from "../../features/orders/orders-operational-summary";

/* ── Página ─────────────────────────────────────────────────── */
export function OrdersPage() {
  const { data: orders } = useOrders();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = useMemo<Order | null>(() => {
    if (!orders || !selectedOrderId) return null;
    return orders.find((o) => o.id === selectedOrderId) ?? null;
  }, [orders, selectedOrderId]);

  const openNew = useCallback(() => {
    setSelectedOrderId(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Limpiar el ID seleccionado con un pequeño delay para que
    // la animación de cierre no muestre el cambio de título
    setTimeout(() => setSelectedOrderId(null), 300);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}

      <OrdersOperationalSummary />

      {/* ── Tabla full-width ────────────────────────────────── */}
      <OrdersTable
        selectedOrderId={selectedOrderId}
        onEditOrder={openEdit}
        onCreateOrder={openNew}
      />

      {/* ── Drawer ──────────────────────────────────────────── */}
      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <OrderForm order={selectedOrder} onCancelEdit={closeDrawer} />
      </Drawer>
    </div>
  );
}
