import { useState, useEffect, useCallback, useMemo } from "react";
import { MdAdd } from "react-icons/md";

import type { Order } from "../../services/api/orders.api";
import { OrderForm } from "../../features/orders/order-form";
import { Drawer } from "../../components/ui/Drawer";
import { OrdersTable } from "../../features/orders/orders-table";
import { useOrders } from "../../features/orders/use-orders";

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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Ventas
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Pedidos</h1>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <MdAdd size={18} />
          Nuevo pedido
        </button>
      </div>

      {/* ── Tabla full-width ────────────────────────────────── */}
      <OrdersTable selectedOrderId={selectedOrderId} onEditOrder={openEdit} />

      {/* ── Drawer ──────────────────────────────────────────── */}
      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <OrderForm order={selectedOrder} onClose={closeDrawer} />
      </Drawer>
    </div>
  );
}
