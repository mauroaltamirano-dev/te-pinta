import { useState, useMemo, useCallback } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp, Copy, Check, Filter } from "lucide-react";
import { getOrderById } from "../../services/api/orders.api";

import { useClients } from "../clients/use-clients";
import {
  useHardDeleteOrder,
  useOrderById,
  useOrders,
  useUpdateOrder,
  useUpdateOrderStatus,
} from "./use-orders";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "prepared"
  | "delivered"
  | "cancelled";
type StatusFilter = "active" | OrderStatus | "all" | "completed";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  prepared: "Preparado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, React.CSSProperties> = {
  pending: { background: "var(--warning-soft)", color: "var(--warning-text)" },
  confirmed: { background: "var(--info-soft)", color: "var(--info-text)" },
  prepared: { background: "rgba(192, 122, 82, 0.12)", color: "var(--primary)" },
  delivered: { background: "var(--success-soft)", color: "var(--success-text)" },
  cancelled: { background: "var(--surface-3)", color: "var(--foreground-muted)" },
};

const STATUS_BORDER: Record<OrderStatus, string> = {
  pending: "var(--warning)",
  confirmed: "var(--info)",
  prepared: "var(--primary)",
  delivered: "var(--success)",
  cancelled: "var(--border)",
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  local: "Local",
  phone: "Teléfono",
  other: "Otro",
};

const MAIN_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "En curso" },
  { value: "completed", label: "Finalizados" },
  { value: "all", label: "Todos" },
];

const STATUS_FILTERS: { value: StatusFilter; label: string; style: React.CSSProperties }[] = [
  { value: "pending", label: "Pendiente", style: STATUS_STYLE.pending },
  { value: "confirmed", label: "Confirmado", style: STATUS_STYLE.confirmed },
  { value: "prepared", label: "Preparado", style: STATUS_STYLE.prepared },
  { value: "delivered", label: "Entregado", style: STATUS_STYLE.delivered },
  { value: "cancelled", label: "Cancelado", style: STATUS_STYLE.cancelled },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
};

const SHIFT_LABELS: Record<string, string> = {
  mediodia: "Mediodía",
  tarde: "Tarde",
  noche: "Noche",
};

const SHIFT_STYLE: Record<string, React.CSSProperties> = {
  mediodia: { background: "var(--warning-soft)", color: "var(--warning-text)" },
  tarde:    { background: "rgba(192, 122, 82, 0.12)", color: "var(--primary)" },
  noche:    { background: "var(--info-soft)", color: "var(--info-text)" },
};

const SHIFT_ORDER: Record<string, number> = { mediodia: 1, tarde: 2, noche: 3 };

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(value);
}

function OrderDetailPanel({ orderId, getClientName }: { orderId: string; getClientName: (id: string | null) => string }) {
  const { data, isLoading } = useOrderById(orderId);
  const updateMutation = useUpdateOrder();
  const togglePaid = () => { if (!data) return; updateMutation.mutate({ orderId, data: { isPaid: !data.isPaid } }); };

  return (
    <tr>
      <td colSpan={8} style={{ background: "var(--surface-2)", borderBottom: "2px solid var(--border)", borderLeft: "3px solid var(--info)" }}>
        {isLoading ? (
          <p className="animate-pulse px-6 py-5 text-xs" style={{ color: "var(--foreground-muted)" }}>Cargando detalle…</p>
        ) : data ? (
          <div className="space-y-4 px-6 py-5">
            {(data.customerPhoneSnapshot || data.customerAddressSnapshot) && (
              <div className="flex gap-4 text-xs" style={{ color: "var(--foreground-muted)" }}>
                {data.customerPhoneSnapshot && <p><strong>Tel:</strong> {data.customerPhoneSnapshot}</p>}
                {data.customerAddressSnapshot && <p><strong>Dir:</strong> {data.customerAddressSnapshot}</p>}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 flex-1 min-w-0">
                {[
                  { label: "Subtotal", value: formatMoney(data.subtotalAmount), strong: false },
                  { label: "Descuento", value: formatMoney(data.discountAmount), strong: false },
                  { label: "Entrega", value: formatDate(data.deliveryDate) ?? "Sin fecha", strong: false },
                  { label: "Método", value: PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod, strong: false },
                  { label: "Total", value: formatMoney(data.totalAmount), strong: true },
                ].map(({ label, value, strong }) => (
                  <div key={label} className="rounded-lg p-3" style={{ background: strong ? "var(--surface-3)" : "var(--background)", border: `1px solid ${strong ? "var(--border)" : "var(--border-soft)"}` }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>{label}</p>
                    <p className={`mt-1 text-sm tabular-nums ${strong ? "font-bold" : "font-medium"}`} style={{ color: strong ? "var(--primary)" : "var(--foreground)" }}>{value}</p>
                  </div>
                ))}
              </div>
              <button type="button" onClick={togglePaid} disabled={updateMutation.isPending}
                className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-xs font-semibold transition disabled:opacity-50"
                style={{ minWidth: 90, background: data.isPaid ? "var(--success-soft)" : "var(--surface-3)", borderColor: data.isPaid ? "var(--success)" : "var(--border)", color: data.isPaid ? "var(--success-text)" : "var(--foreground-muted)" }}
                title={data.isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition" style={{ background: data.isPaid ? "var(--success)" : "var(--border)", color: data.isPaid ? "#fff" : "var(--foreground-muted)" }}>{data.isPaid ? "✓" : "○"}</span>
                <span className="uppercase tracking-wider" style={{ fontSize: 10 }}>{data.isPaid ? "Pagado" : "Pendiente"}</span>
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border-soft)" }}>
              <table className="min-w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--surface-3)" }}>
                    {["Producto", "Cant.", "P. unitario", "Costo unit.", "Subtotal"].map((col, i) => (
                      <th key={col} className={`border-b px-4 py-2 text-[10px] font-semibold uppercase tracking-wider ${i > 1 ? "text-right" : "text-left"}`} style={{ borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr key={item.id} style={{ borderBottom: "1px solid var(--border-soft)" }}>
                      <td className="px-4 py-2 font-medium" style={{ color: "var(--foreground)" }}>{item.productNameSnapshot}</td>
                      <td className="px-4 py-2 tabular-nums" style={{ color: "var(--foreground-muted)" }}>{item.quantity}</td>
                      <td className="px-4 py-2 text-right tabular-nums" style={{ color: "var(--foreground-muted)" }}>{formatMoney(item.unitSalePriceSnapshot)}</td>
                      <td className="px-4 py-2 text-right tabular-nums" style={{ color: "var(--foreground-muted)" }}>{formatMoney(item.unitCostSnapshot)}</td>
                      <td className="px-4 py-2 text-right font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{formatMoney(item.lineSubtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.notes && (
              <p className="rounded-lg border px-4 py-2.5 text-xs" style={{ background: "var(--background)", borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground-soft)" }}>Notas:</span>{" "}{data.notes}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border px-4 py-2.5 text-xs" style={{ background: "var(--background)", borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground-soft)" }}>Cliente:</span>{" "}{data.customerNameSnapshot || getClientName(data.clientId)}
              </div>
              <div className="rounded-lg border px-4 py-2.5 text-xs" style={{ background: "var(--background)", borderColor: "var(--border-soft)" }}>
                <p className="font-semibold" style={{ color: "var(--foreground-soft)" }}>Entrega</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span style={{ color: "var(--foreground-muted)" }}>{formatDate(data.deliveryDate) ?? "Sin fecha"}</span>
                  {data.deliveryShift && (
                    <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={SHIFT_STYLE[data.deliveryShift]}>
                      {SHIFT_LABELS[data.deliveryShift]}
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-lg border px-4 py-2.5 text-xs" style={{ background: "var(--background)", borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}>
                <span className="font-semibold" style={{ color: "var(--foreground-soft)" }}>Pago:</span>{" "}{data.isPaid ? "Pagado" : "Pendiente"} · {PAYMENT_METHOD_LABELS[data.paymentMethod] ?? data.paymentMethod}
              </div>
            </div>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

type SortKey = "client" | "delivery" | "payment" | "status" | "channel" | "total";
type SortDirection = "asc" | "desc";

export function OrdersTable({ selectedOrderId, onEditOrder, onCreateOrder }: { selectedOrderId: string | null; onEditOrder: (orderId: string) => void; onCreateOrder: () => void }) {
  const { data: orders, isLoading } = useOrders();
  const { data: clients } = useClients();
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [filterCreatedDate, setFilterCreatedDate] = useState("");
  const [filterDeliveryDate, setFilterDeliveryDate] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);
  const [productionTicketText, setProductionTicketText] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const getClientName = useCallback((clientId: string | null) => {
    if (!clientId) return "Consumidor final";
    return clients?.find((c) => c.id === clientId)?.name ?? "—";
  }, [clients]);

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = orders;
    if (statusFilter === "active") {
      result = result.filter((o) => o.status !== "cancelled" && !(o.status === "delivered" && o.isPaid));
    } else if (statusFilter === "completed") {
      result = result.filter((o) => o.status === "delivered" && o.isPaid);
    } else if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (filterCreatedDate) {
      result = result.filter((o) => {
        const d = new Date(o.createdAt);
        const parts = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")];
        return parts.join("-") === filterCreatedDate;
      });
    }
    if (filterDeliveryDate) {
      result = result.filter((o) => {
        if (!o.deliveryDate) return false;
        const d = new Date(o.deliveryDate);
        const parts = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")];
        return parts.join("-") === filterDeliveryDate;
      });
    }

    if (sortConfig) {
      result = [...result].sort((a, b) => {
        if (sortConfig.key === "client") {
          const nameA = a.customerNameSnapshot || getClientName(a.clientId);
          const nameB = b.customerNameSnapshot || getClientName(b.clientId);
          return sortConfig.direction === "asc" ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        }
        if (sortConfig.key === "delivery") {
          const dateA = a.deliveryDate ? new Date(a.deliveryDate).getTime() : 0;
          const dateB = b.deliveryDate ? new Date(b.deliveryDate).getTime() : 0;
          const diff = sortConfig.direction === "asc" ? dateA - dateB : dateB - dateA;
          if (diff !== 0) return diff;
          const shiftA = a.deliveryShift ? (SHIFT_ORDER[a.deliveryShift] ?? 99) : 99;
          const shiftB = b.deliveryShift ? (SHIFT_ORDER[b.deliveryShift] ?? 99) : 99;
          return sortConfig.direction === "asc" ? shiftA - shiftB : shiftB - shiftA;
        }
        if (sortConfig.key === "payment") {
          return sortConfig.direction === "asc" ? (a.isPaid ? 1 : 0) - (b.isPaid ? 1 : 0) : (b.isPaid ? 1 : 0) - (a.isPaid ? 1 : 0);
        }
        if (sortConfig.key === "status") {
          const priority: Record<string, number> = { pending: 1, confirmed: 2, prepared: 3, delivered: 4, cancelled: 5 };
          return sortConfig.direction === "asc" ? priority[a.status] - priority[b.status] : priority[b.status] - priority[a.status];
        }
        if (sortConfig.key === "channel") {
          const chanA = CHANNEL_LABELS[a.channel] || a.channel;
          const chanB = CHANNEL_LABELS[b.channel] || b.channel;
          return sortConfig.direction === "asc" ? chanA.localeCompare(chanB) : chanB.localeCompare(chanA);
        }
        if (sortConfig.key === "total") {
          return sortConfig.direction === "asc" ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
        }
        return 0;
      });
    }

    return result;
  }, [orders, statusFilter, filterCreatedDate, filterDeliveryDate, sortConfig, getClientName]);

  const statusMutation = useUpdateOrderStatus();
  const updateMutation = useUpdateOrder();
  const hardDeleteMutation = useHardDeleteOrder();

  const toggleSelection = (orderId: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.size === filteredOrders.length && filteredOrders.length > 0) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map(o => o.id)));
    }
  };

  const generateTicket = async () => {
    setIsGeneratingTicket(true);
    let text = "";
    try {
      const promises = Array.from(selectedOrderIds).map(id => getOrderById(id));
      const results = await Promise.all(promises);
      for (const res of results) {
        if (!res) continue;
        const name = res.customerNameSnapshot || getClientName(res.clientId) || "Sin nombre";
        const itemsStr = res.items.map((i) => `${i.quantity} ${i.productNameSnapshot}`).join(" - ");
        text += `${name.trim()} : ${itemsStr}\n`;
      }
      setProductionTicketText(text.trim());
      setIsTicketModalOpen(true);
    } catch (e) {
      console.error(e);
      alert("Error al armar ticket de producción");
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  const copyTicket = () => {
    navigator.clipboard.writeText(productionTicketText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg" style={{ background: "var(--surface-3)", opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="overflow-hidden rounded-xl border relative animate-fade-in" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="border-b px-5 py-4" style={{ borderColor: "var(--border-soft)" }}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Libro de pedidos</h2>
              <p className="mt-0.5 text-xs" style={{ color: "var(--foreground-muted)" }}>{filteredOrders.length} pedido{filteredOrders.length !== 1 ? "s" : ""}</p>
            </div>
            <button type="button" onClick={onCreateOrder} className="rounded-lg px-4 py-2 text-xs font-semibold transition" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>+ Nuevo pedido</button>
          </div>

          {/* ── Main filter chips ── */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} style={{ color: "var(--foreground-faint)" }} className="shrink-0 mr-0.5" />
            {MAIN_FILTERS.map((tab) => (
              <button key={tab.value} type="button" onClick={() => setStatusFilter(tab.value)}
                className="rounded-md px-2.5 py-1 text-xs font-medium transition"
                style={{ background: statusFilter === tab.value ? "rgba(192, 122, 82, 0.12)" : "transparent", color: statusFilter === tab.value ? "var(--primary)" : "var(--foreground-muted)" }}
                onMouseEnter={(e) => { if (statusFilter !== tab.value) e.currentTarget.style.background = "var(--surface-2)"; }}
                onMouseLeave={(e) => { if (statusFilter !== tab.value) e.currentTarget.style.background = "transparent"; }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── Status sub-filters ── */}
          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button key={tab.value} type="button" onClick={() => setStatusFilter(isActive ? "active" : tab.value)}
                  className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition"
                  style={isActive ? { ...tab.style } : { background: "transparent", color: "var(--foreground-muted)" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "var(--surface-2)"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: isActive ? (tab.style.color as string) : "var(--foreground-faint)" }} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* ── Date filters ── */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-created-date" className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-faint)" }}>Creación</label>
              <div className="flex items-center gap-1.5">
                <input id="filter-created-date" type="date" value={filterCreatedDate} onChange={(e) => setFilterCreatedDate(e.target.value)} className="rounded-lg border px-2.5 py-1 text-xs outline-none transition" style={{ background: "var(--surface)", borderColor: filterCreatedDate ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }} />
                {filterCreatedDate && <button type="button" onClick={() => setFilterCreatedDate("")} className="rounded-md px-1.5 py-1 text-xs transition" style={{ color: "var(--foreground-muted)" }}>×</button>}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="filter-delivery-date" className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-faint)" }}>Entrega</label>
              <div className="flex items-center gap-1.5">
                <input id="filter-delivery-date" type="date" value={filterDeliveryDate} onChange={(e) => setFilterDeliveryDate(e.target.value)} className="rounded-lg border px-2.5 py-1 text-xs outline-none transition" style={{ background: "var(--surface)", borderColor: filterDeliveryDate ? "var(--primary)" : "var(--border)", color: "var(--foreground)" }} />
                {filterDeliveryDate && <button type="button" onClick={() => setFilterDeliveryDate("")} className="rounded-md px-1.5 py-1 text-xs transition" style={{ color: "var(--foreground-muted)" }}>×</button>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr>
              {[
                { label: "✓", sortKey: null, checkbox: true },
                { label: "Cliente", sortKey: "client" },
                { label: "Entrega", sortKey: "delivery" },
                { label: "Pago", sortKey: "payment" },
                { label: "Estado", sortKey: "status" },
                { label: "Canal", sortKey: "channel" },
                { label: "Total", sortKey: "total" },
                { label: "", sortKey: null },
              ].map(({ label, sortKey, checkbox }) => (
                <th key={label || "checkbox"} className="border-b px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider transition"
                  style={{ borderColor: "var(--border-soft)", color: "var(--foreground-faint)", cursor: sortKey ? "pointer" : "default", userSelect: "none" }}
                  onClick={() => {
                    if (checkbox) return toggleSelectAll();
                    if (!sortKey) return;
                    setSortConfig((prev) => {
                      if (prev?.key === sortKey) return { key: sortKey as SortKey, direction: prev.direction === "asc" ? "desc" : "asc" };
                      return { key: sortKey as SortKey, direction: "desc" };
                    });
                  }}
                >
                  <div className="flex items-center gap-1.5 w-fit">
                    {checkbox ? (
                      <input type="checkbox" className="h-4 w-4 rounded pointer-events-none" style={{ accentColor: "var(--primary)" }} checked={filteredOrders.length > 0 && selectedOrderIds.size === filteredOrders.length} onChange={() => {}} />
                    ) : label}
                    {sortKey && (
                      <span className="text-[9px] transition-opacity" style={{ opacity: sortConfig?.key === sortKey ? 1 : 0.2 }}>
                        {sortConfig?.key === sortKey && sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
                  {orders?.length === 0 ? "No hay pedidos registrados." : "No hay pedidos con el filtro seleccionado."}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                const showDetail = detailOrderId === order.id;
                return (
                  <>
                    <tr key={order.id} className="transition"
                      style={{
                        background: isSelected || selectedOrderIds.has(order.id) ? "var(--warning-soft)" : "transparent",
                        borderLeft: isSelected ? "3px solid var(--warning)" : `3px solid ${STATUS_BORDER[order.status as OrderStatus] ?? "transparent"}`,
                      }}
                      onMouseEnter={(e) => { if (!isSelected && !selectedOrderIds.has(order.id)) e.currentTarget.style.background = "var(--surface-hover)"; }}
                      onMouseLeave={(e) => { if (!isSelected && !selectedOrderIds.has(order.id)) e.currentTarget.style.background = "transparent"; }}
                    >
                      <td className="border-b px-5 py-3 w-10" style={{ borderColor: "var(--border-soft)" }}>
                        <input type="checkbox" checked={selectedOrderIds.has(order.id)} onChange={() => toggleSelection(order.id)} className="h-4 w-4 rounded" style={{ accentColor: "var(--primary)", cursor: "pointer" }} />
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        <p className="text-[13px] font-medium leading-snug" style={{ color: isSelected ? "var(--warning-text)" : "var(--foreground)" }}>{order.customerNameSnapshot || getClientName(order.clientId)}</p>
                        <p className="mt-0.5 text-xs tabular-nums" style={{ color: "var(--foreground-muted)" }}>{new Date(order.createdAt).toLocaleDateString("es-AR")}</p>
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        {order.deliveryDate ? (
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-medium tabular-nums leading-snug" style={{ color: "var(--foreground-soft)" }}>{formatDate(order.deliveryDate)}</span>
                            {order.deliveryShift ? (
                              <span className="inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider" style={SHIFT_STYLE[order.deliveryShift]}>
                                {SHIFT_LABELS[order.deliveryShift]}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-xs" style={{ color: "var(--foreground-faint)" }}>Sin fecha</span>
                        )}
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        <div className="flex flex-col gap-1">
                          <button type="button" onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ orderId: order.id, data: { isPaid: !order.isPaid } }); }} disabled={updateMutation.isPending && updateMutation.variables?.orderId === order.id}
                            className="inline-flex w-fit items-center gap-1.5 rounded-md px-2 py-0.5 text-[11px] font-semibold transition hover:scale-[1.03] active:scale-95 disabled:pointer-events-none disabled:opacity-50"
                            style={{ background: order.isPaid ? "var(--success-soft)" : "var(--surface-3)", color: order.isPaid ? "var(--success)" : "var(--foreground-muted)", cursor: "pointer" }}
                            title={order.isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
                          >
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] text-white" style={{ background: order.isPaid ? "var(--success)" : "var(--border)" }}>{order.isPaid ? "✓" : ""}</span>
                            {order.isPaid ? "Pagado" : "Pendiente"}
                          </button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ orderId: order.id, data: { paymentMethod: order.paymentMethod === "cash" ? "transfer" : "cash" } }); }} disabled={updateMutation.isPending && updateMutation.variables?.orderId === order.id}
                            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-dashed px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition hover:border-solid disabled:pointer-events-none disabled:opacity-50"
                            style={{ borderColor: "var(--border)", color: "var(--foreground-muted)", cursor: "pointer" }}
                            title="Cambiar método de pago"
                          >
                            <span className="text-[11px]">{order.paymentMethod === "cash" ? "💵" : "🏦"}</span>
                            {PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </button>
                        </div>
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        <select value={order.status} onChange={(e) => statusMutation.mutate({ orderId: order.id, status: e.target.value as OrderStatus })}
                          className="rounded-md border-0 px-2 py-0.5 text-[11px] font-semibold outline-none transition"
                          style={{ ...STATUS_STYLE[order.status as OrderStatus], cursor: "pointer", width: "fit-content" }}
                        >
                          {Object.entries(STATUS_LABELS).map(([value, label]) => (<option key={value} value={value}>{label}</option>))}
                        </select>
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--surface-3)", color: "var(--foreground-soft)" }}>{CHANNEL_LABELS[order.channel] ?? order.channel}</span>
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        <p className="text-[13px] font-semibold tabular-nums" style={{ color: "var(--foreground)" }}>{formatMoney(order.totalAmount)}</p>
                      </td>
                      <td className="border-b px-5 py-3" style={{ borderColor: "var(--border-soft)" }}>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setDetailOrderId((prev) => prev === order.id ? null : order.id)}
                            className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition"
                            style={showDetail ? { background: "var(--info-soft)", borderColor: "var(--info)", color: "var(--info-text)" } : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground-soft)" }}
                          >
                            {showDetail ? <><ChevronUp size={12} /> Ocultar</> : <><ChevronDown size={12} /> Detalle</>}
                          </button>
                          <button type="button" onClick={() => onEditOrder(order.id)} disabled={!order.isActive}
                            className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                            style={isSelected ? { background: "var(--warning)", borderColor: "var(--warning)", color: "#fff" } : { background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--foreground-soft)" }}
                          >
                            <Pencil size={12} /> {isSelected ? "Editando" : "Editar"}
                          </button>
                          <button type="button" onClick={() => { if (window.confirm(`¿Eliminar el pedido de "${getClientName(order.clientId)}"? Esta acción no se puede deshacer.`)) hardDeleteMutation.mutate(order.id); }} disabled={hardDeleteMutation.isPending}
                            className="flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                            style={{ background: "var(--danger-soft)", borderColor: "var(--danger)", color: "var(--danger-text)" }}
                          >
                            <Trash2 size={12} /> Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                    {showDetail && <OrderDetailPanel key={`detail-${order.id}`} orderId={order.id} getClientName={getClientName} />}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {(statusMutation.isError || hardDeleteMutation.isError) && (
        <div className="border-t px-5 py-3 text-sm" style={{ borderColor: "var(--danger)", background: "var(--danger-soft)", color: "var(--danger-text)" }}>
          Ocurrió un error al realizar la operación.
        </div>
      )}

      {/* Floating Action Bar */}
      {selectedOrderIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-between gap-4 rounded-xl px-5 py-2.5 shadow-2xl animate-fade-in z-40 border" style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>{selectedOrderIds.size}</span>
            <span className="text-xs font-semibold">seleccionados</span>
          </div>
          <button onClick={generateTicket} disabled={isGeneratingTicket} className="rounded-lg px-4 py-1.5 text-xs font-semibold transition hover:opacity-90 disabled:opacity-50" style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}>
            {isGeneratingTicket ? "Generando..." : "Generar ticket"}
          </button>
        </div>
      )}

      {/* Ticket Preview Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-fade-in backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border shadow-xl flex flex-col overflow-hidden animate-slide-up" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="flex items-center justify-between border-b px-6 py-4" style={{ borderColor: "var(--border-soft)", background: "var(--surface-2)" }}>
              <h3 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>Ticket de producción</h3>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-xl hover:opacity-70 transition" style={{ color: "var(--foreground-muted)" }}>×</button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap rounded-lg border p-4 text-sm font-mono leading-relaxed" style={{ background: "var(--background)", borderColor: "var(--border-soft)", color: "var(--foreground-soft)" }}>{productionTicketText}</pre>
            </div>
            <div className="border-t p-5 flex justify-end gap-3" style={{ borderColor: "var(--border-soft)" }}>
              <button onClick={() => setIsTicketModalOpen(false)} className="rounded-lg px-4 py-2 text-xs font-semibold transition hover:opacity-80 border" style={{ borderColor: "var(--border)", color: "var(--foreground-soft)", background: "transparent" }}>Cerrar</button>
              <button onClick={copyTicket} className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition hover:opacity-90" style={{ background: copied ? "var(--success)" : "var(--primary)", color: copied ? "#fff" : "var(--primary-foreground)" }}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "¡Copiado!" : "Copiar ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
