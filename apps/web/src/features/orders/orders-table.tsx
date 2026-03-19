import { useState, useMemo } from "react";
import {
  MdEdit,
  MdDeleteForever,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";

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
  | "preparing"
  | "delivered"
  | "cancelled";
type StatusFilter = "active" | OrderStatus | "all";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_STYLE: Record<OrderStatus, React.CSSProperties> = {
  pending: { background: "var(--warning-soft)", color: "var(--warning-text)" },
  confirmed: { background: "var(--info-soft)", color: "var(--info-text)" },
  preparing: {
    background: "var(--warning-soft)",
    color: "var(--warning-text)",
  },
  delivered: {
    background: "var(--success-soft)",
    color: "var(--success-text)",
  },
  cancelled: {
    background: "var(--surface-3)",
    color: "var(--foreground-muted)",
  },
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  local: "Local",
  phone: "Teléfono",
  other: "Otro",
};

const MAIN_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "all", label: "Todos" },
];

const STATUS_FILTERS: {
  value: StatusFilter;
  label: string;
  style: React.CSSProperties;
}[] = [
  { value: "pending", label: "Pendiente", style: STATUS_STYLE.pending },
  { value: "confirmed", label: "Confirmado", style: STATUS_STYLE.confirmed },
  {
    value: "preparing",
    label: "En preparación",
    style: STATUS_STYLE.preparing,
  },
  { value: "delivered", label: "Entregado", style: STATUS_STYLE.delivered },
  { value: "cancelled", label: "Cancelado", style: STATUS_STYLE.cancelled },
];

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Efectivo",
  transfer: "Transferencia",
};

function formatDateTime(value: string | null) {
  if (!value) return "Sin definir";

  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function OrderDetailPanel({
  orderId,
  getClientName,
}: {
  orderId: string;
  getClientName: (id: string | null) => string;
}) {
  const { data, isLoading } = useOrderById(orderId);
  const updateMutation = useUpdateOrder();

  const togglePaid = () => {
    if (!data) return;
    updateMutation.mutate({ orderId, data: { isPaid: !data.isPaid } });
  };

  return (
    <tr>
      <td
        colSpan={8}
        style={{
          background: "var(--surface-2)",
          borderBottom: "2px solid var(--border)",
          borderLeft: "3px solid var(--info)",
        }}
      >
        {isLoading ? (
          <p
            className="animate-pulse px-6 py-5 text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            Cargando detalle…
          </p>
        ) : data ? (
          <div className="space-y-4 px-6 py-5">
            <div className="flex flex-wrap items-center gap-3">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 flex-1 min-w-0">
                {[
                  {
                    label: "Subtotal",
                    value: formatMoney(data.subtotalAmount),
                    strong: false,
                  },
                  {
                    label: "Descuento",
                    value: formatMoney(data.discountAmount),
                    strong: false,
                  },
                  {
                    label: "Entrega",
                    value: formatDateTime(data.deliveryDate),
                    strong: false,
                  },
                  {
                    label: "Método",
                    value:
                      PAYMENT_METHOD_LABELS[data.paymentMethod] ??
                      data.paymentMethod,
                    strong: false,
                  },
                  {
                    label: "Total",
                    value: formatMoney(data.totalAmount),
                    strong: true,
                  },
                ].map(({ label, value, strong }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3"
                    style={{
                      background: strong
                        ? "var(--surface-3)"
                        : "var(--background)",
                      border: `1px solid ${
                        strong ? "var(--border)" : "var(--border-soft)"
                      }`,
                    }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {label}
                    </p>
                    <p
                      className={`mt-1 text-sm tabular-nums ${
                        strong ? "font-bold" : "font-medium"
                      }`}
                      style={{
                        color: strong ? "var(--primary)" : "var(--foreground)",
                      }}
                    >
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Toggle pagado */}
              <button
                type="button"
                onClick={togglePaid}
                disabled={updateMutation.isPending}
                className="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition disabled:opacity-50"
                style={{
                  minWidth: 90,
                  background: data.isPaid ? "var(--success-soft)" : "var(--surface-3)",
                  borderColor: data.isPaid ? "var(--success)" : "var(--border)",
                  color: data.isPaid ? "var(--success-text)" : "var(--foreground-muted)",
                }}
                title={data.isPaid ? "Marcar como pendiente" : "Marcar como pagado"}
              >
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full text-lg transition"
                  style={{
                    background: data.isPaid ? "var(--success)" : "var(--border)",
                    color: data.isPaid ? "#fff" : "var(--foreground-muted)",
                  }}
                >
                  {data.isPaid ? "✓" : "○"}
                </span>
                <span className="uppercase tracking-wider" style={{ fontSize: 10 }}>
                  {data.isPaid ? "Pagado" : "Pendiente"}
                </span>
              </button>
            </div>

            <div
              className="overflow-hidden rounded-xl border"
              style={{ borderColor: "var(--border-soft)" }}
            >
              <table className="min-w-full text-xs">
                <thead>
                  <tr style={{ background: "var(--surface-3)" }}>
                    {[
                      "Producto",
                      "Cant.",
                      "P. unitario",
                      "Costo unit.",
                      "Subtotal",
                    ].map((col, i) => (
                      <th
                        key={col}
                        className={`border-b px-4 py-2.5 text-xs font-semibold uppercase tracking-wider ${
                          i > 1 ? "text-right" : "text-left"
                        }`}
                        style={{
                          borderColor: "var(--border-soft)",
                          color: "var(--foreground-muted)",
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition"
                      style={{ borderBottom: "1px solid var(--border-soft)" }}
                    >
                      <td
                        className="px-4 py-2.5 font-medium"
                        style={{ color: "var(--foreground)" }}
                      >
                        {item.productNameSnapshot}
                      </td>
                      <td
                        className="px-4 py-2.5 tabular-nums"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {item.quantity}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right tabular-nums"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {formatMoney(item.unitSalePriceSnapshot)}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right tabular-nums"
                        style={{ color: "var(--foreground-muted)" }}
                      >
                        {formatMoney(item.unitCostSnapshot)}
                      </td>
                      <td
                        className="px-4 py-2.5 text-right font-semibold tabular-nums"
                        style={{ color: "var(--foreground)" }}
                      >
                        {formatMoney(item.lineSubtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data.notes && (
              <p
                className="rounded-xl border px-4 py-2.5 text-xs"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border-soft)",
                  color: "var(--foreground-muted)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Notas:
                </span>{" "}
                {data.notes}
              </p>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div
                className="rounded-xl border px-4 py-3 text-xs"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border-soft)",
                  color: "var(--foreground-muted)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Cliente:
                </span>{" "}
                {data.customerNameSnapshot || getClientName(data.clientId)}
              </div>

              <div
                className="rounded-xl border px-4 py-3 text-xs"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border-soft)",
                  color: "var(--foreground-muted)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Entrega:
                </span>{" "}
                {formatDateTime(data.deliveryDate)}
              </div>

              <div
                className="rounded-xl border px-4 py-3 text-xs"
                style={{
                  background: "var(--background)",
                  borderColor: "var(--border-soft)",
                  color: "var(--foreground-muted)",
                }}
              >
                <span
                  className="font-semibold"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  Pago:
                </span>{" "}
                {data.isPaid ? "Pagado" : "Pendiente"} ·{" "}
                {PAYMENT_METHOD_LABELS[data.paymentMethod] ??
                  data.paymentMethod}
              </div>
            </div>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

export function OrdersTable({
  selectedOrderId,
  onEditOrder,
  onCreateOrder,
}: {
  selectedOrderId: string | null;
  onEditOrder: (orderId: string | null) => void;
  onCreateOrder: () => void;
}) {
  const { data: orders, isLoading } = useOrders();
  const { data: clients } = useClients();
  const [detailOrderId, setDetailOrderId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [filterCreatedDate, setFilterCreatedDate] = useState("");
  const [filterDeliveryDate, setFilterDeliveryDate] = useState("");

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    let result = orders;
    if (statusFilter === "active")
      result = result.filter((o) => o.status !== "cancelled");
    else if (statusFilter !== "all")
      result = result.filter((o) => o.status === statusFilter);

    if (filterCreatedDate) {
      result = result.filter((o) => {
        const d = new Date(o.createdAt);
        return d.toISOString().slice(0, 10) === filterCreatedDate;
      });
    }
    if (filterDeliveryDate) {
      result = result.filter((o) => {
        if (!o.deliveryDate) return false;
        return new Date(o.deliveryDate).toISOString().slice(0, 10) === filterDeliveryDate;
      });
    }
    return result;
  }, [orders, statusFilter, filterCreatedDate, filterDeliveryDate]);

  const statusMutation = useUpdateOrderStatus();
  const hardDeleteMutation = useHardDeleteOrder();

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Consumidor final";
    return clients?.find((c) => c.id === clientId)?.name ?? "—";
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border px-6 py-12 text-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
        }}
      >
        <span className="animate-pulse">Cargando pedidos…</span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="border-b px-5 py-4"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface-2)",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2
                className="text-sm font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                Pedidos
              </h2>
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--foreground-muted)" }}
              >
                Gestioná el listado, estados y detalle de cada pedido.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
                style={{
                  background: "var(--surface-3)",
                  color: "var(--foreground-muted)",
                }}
              >
                {filteredOrders.length} pedido
                {filteredOrders.length !== 1 ? "s" : ""}
              </span>

              <button
                type="button"
                onClick={onCreateOrder}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                }}
              >
                Nuevo pedido
              </button>
            </div>
          </div>

          <div
            className="flex gap-1 self-start rounded-xl border p-1"
            style={{
              background: "var(--background)",
              borderColor: "var(--border)",
            }}
          >
            {MAIN_FILTERS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatusFilter(tab.value)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                style={
                  statusFilter === tab.value
                    ? {
                        background: "var(--primary)",
                        color: "var(--primary-foreground)",
                      }
                    : {
                        background: "transparent",
                        color: "var(--foreground-muted)",
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {STATUS_FILTERS.map((tab) => {
              const isActive = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() =>
                    setStatusFilter(isActive ? "active" : tab.value)
                  }
                  className="flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition"
                  style={
                    isActive
                      ? { ...tab.style, borderColor: "transparent" }
                      : {
                          background: "transparent",
                          borderColor: "var(--border)",
                          color: "var(--foreground-muted)",
                        }
                  }
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: isActive
                        ? (tab.style.color as string)
                        : "var(--foreground-faint)",
                    }}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filtros por fecha */}
          <div
            className="flex flex-wrap gap-3 rounded-xl border px-4 py-3"
            style={{
              background: "var(--background)",
              borderColor: "var(--border-soft)",
            }}
          >
            <div className="flex flex-1 min-w-[160px] flex-col gap-1">
              <label
                htmlFor="filter-created-date"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--foreground-muted)" }}
              >
                Fecha de creación
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="filter-created-date"
                  type="date"
                  value={filterCreatedDate}
                  onChange={(e) => setFilterCreatedDate(e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none transition"
                  style={{
                    background: "var(--surface)",
                    borderColor: filterCreatedDate ? "var(--primary)" : "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                {filterCreatedDate && (
                  <button
                    type="button"
                    onClick={() => setFilterCreatedDate("")}
                    className="rounded-lg border px-2 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: "var(--surface-3)",
                      borderColor: "var(--border)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-1 min-w-[160px] flex-col gap-1">
              <label
                htmlFor="filter-delivery-date"
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--foreground-muted)" }}
              >
                Fecha de entrega
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="filter-delivery-date"
                  type="date"
                  value={filterDeliveryDate}
                  onChange={(e) => setFilterDeliveryDate(e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-1.5 text-xs outline-none transition"
                  style={{
                    background: "var(--surface)",
                    borderColor: filterDeliveryDate ? "var(--primary)" : "var(--border)",
                    color: "var(--foreground)",
                  }}
                />
                {filterDeliveryDate && (
                  <button
                    type="button"
                    onClick={() => setFilterDeliveryDate("")}
                    className="rounded-lg border px-2 py-1.5 text-xs font-semibold transition"
                    style={{
                      background: "var(--surface-3)",
                      borderColor: "var(--border)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[640px] w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {[
                "Cliente",
                "Entrega",
                "Pago",
                "Estado",
                "Canal",
                "Total",
                "",
              ].map((col) => (
                <th
                  key={col}
                  className="border-b px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: "var(--border-soft)",
                    color: "var(--foreground-muted)",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {orders?.length === 0
                    ? "No hay pedidos registrados."
                    : "No hay pedidos con el filtro seleccionado."}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const isSelected = selectedOrderId === order.id;
                const showDetail = detailOrderId === order.id;

                return (
                  <>
                    <tr
                      key={order.id}
                      className="transition"
                      style={{
                        background: isSelected
                          ? "var(--warning-soft)"
                          : "transparent",
                        borderLeft: isSelected
                          ? "3px solid var(--warning)"
                          : "3px solid transparent",
                      }}
                    >
                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <p
                          className="font-medium leading-snug"
                          style={{
                            color: isSelected
                              ? "var(--warning-text)"
                              : "var(--foreground)",
                          }}
                        >
                          {order.customerNameSnapshot ||
                            getClientName(order.clientId)}
                        </p>
                        <p
                          className="mt-0.5 text-xs tabular-nums"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-AR",
                          )}
                        </p>
                      </td>

                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <span
                          className="text-xs"
                          style={{ color: "var(--foreground-soft)" }}
                        >
                          {formatDateTime(order.deliveryDate)}
                        </span>
                      </td>

                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                            style={{
                              background: order.isPaid
                                ? "var(--success-soft)"
                                : "var(--warning-soft)",
                              color: order.isPaid
                                ? "var(--success)"
                                : "var(--warning)",
                            }}
                          >
                            {order.isPaid ? "Pagado" : "Pendiente"}
                          </span>
                          <span
                            className="text-xs"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            {PAYMENT_METHOD_LABELS[order.paymentMethod] ??
                              order.paymentMethod}
                          </span>
                        </div>
                      </td>

                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <select
                          value={order.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              orderId: order.id,
                              status: e.target.value as OrderStatus,
                            })
                          }
                          className="rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none transition"
                          style={{
                            ...STATUS_STYLE[order.status as OrderStatus],
                            cursor: "pointer",
                          }}
                        >
                          {Object.entries(STATUS_LABELS).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ),
                          )}
                        </select>
                      </td>

                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{
                            background: "var(--surface-3)",
                            color: "var(--foreground-soft)",
                          }}
                        >
                          {CHANNEL_LABELS[order.channel] ?? order.channel}
                        </span>
                      </td>

                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <p
                          className="font-semibold tabular-nums"
                          style={{ color: "var(--foreground)" }}
                        >
                          {formatMoney(order.totalAmount)}
                        </p>
                      </td>

                      <td
                        className="border-b px-5 py-3.5"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setDetailOrderId((prev) =>
                                prev === order.id ? null : order.id,
                              )
                            }
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                            style={
                              showDetail
                                ? {
                                    background: "var(--info-soft)",
                                    borderColor: "var(--info)",
                                    color: "var(--info-text)",
                                  }
                                : {
                                    background: "var(--surface-2)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground-soft)",
                                  }
                            }
                          >
                            {showDetail ? (
                              <>
                                <MdExpandLess size={13} />
                                Ocultar
                              </>
                            ) : (
                              <>
                                <MdExpandMore size={13} />
                                Detalle
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              onEditOrder(
                                selectedOrderId === order.id ? null : order.id,
                              )
                            }
                            disabled={!order.isActive}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                            style={
                              isSelected
                                ? {
                                    background: "var(--warning)",
                                    borderColor: "var(--warning)",
                                    color: "#fff",
                                  }
                                : {
                                    background: "var(--surface-2)",
                                    borderColor: "var(--border)",
                                    color: "var(--foreground-soft)",
                                  }
                            }
                          >
                            <MdEdit size={13} />
                            {isSelected ? "Editando" : "Editar"}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Eliminar el pedido de "${getClientName(
                                    order.clientId,
                                  )}"? Esta acción no se puede deshacer.`,
                                )
                              ) {
                                hardDeleteMutation.mutate(order.id);
                              }
                            }}
                            disabled={hardDeleteMutation.isPending}
                            className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                            style={{
                              background: "var(--danger-soft)",
                              borderColor: "var(--danger)",
                              color: "var(--danger-text)",
                            }}
                          >
                            <MdDeleteForever size={13} />
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>

                    {showDetail && (
                      <OrderDetailPanel
                        key={`detail-${order.id}`}
                        orderId={order.id}
                        getClientName={getClientName}
                      />
                    )}
                  </>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {(statusMutation.isError || hardDeleteMutation.isError) && (
        <div
          className="border-t px-5 py-3 text-sm"
          style={{
            borderColor: "var(--danger)",
            background: "var(--danger-soft)",
            color: "var(--danger-text)",
          }}
        >
          Ocurrió un error al realizar la operación.
        </div>
      )}
    </div>
  );
}
