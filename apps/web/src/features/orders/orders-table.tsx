import { useState } from "react";

import { useClients } from "../clients/use-clients";
import { useOrderById, useOrders, useUpdateOrderStatus } from "./use-orders";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  preparing: "En preparación",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-600",
};

const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  local: "Local",
  phone: "Teléfono",
  other: "Otro",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

export function OrdersTable() {
  const { data: orders, isLoading } = useOrders();
  const { data: clients } = useClients();
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const detailQuery = useOrderById(selectedOrderId);
  const statusMutation = useUpdateOrderStatus();

  const getClientName = (clientId: string | null) => {
    if (!clientId) return "Sin cliente";

    return clients?.find((client) => client.id === clientId)?.name ?? clientId;
  };

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
        <div className="border-b border-sombra px-5 py-4">
          <h2 className="text-lg font-bold text-bordo">Listado de pedidos</h2>
          <p className="mt-1 text-sm text-cafe/75">
            Todos los pedidos registrados. Podés cambiar el estado directamente
            desde esta vista.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[680px] w-full">
            <thead className="bg-arena/70">
              <tr>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Cliente
                </th>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Estado
                </th>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Canal
                </th>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Total
                </th>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              {orders?.map((order) => (
                <tr key={order.id} className="transition hover:bg-arena/30">
                  <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                    {getClientName(order.clientId)}
                  </td>

                  <td className="border-b border-sombra px-5 py-4 text-sm">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({
                          orderId: order.id,
                          status: e.target.value as
                            | "pending"
                            | "confirmed"
                            | "preparing"
                            | "delivered"
                            | "cancelled",
                        })
                      }
                      className={[
                        "rounded-2xl border border-sombra px-3 py-1.5 text-xs font-semibold outline-none transition focus:border-bordo",
                        STATUS_COLORS[order.status] ?? "bg-arena text-cafe",
                      ].join(" ")}
                    >
                      {Object.entries(STATUS_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                    {CHANNEL_LABELS[order.channel] ?? order.channel}
                  </td>

                  <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-cafe">
                    {formatMoney(order.totalAmount)}
                  </td>

                  <td className="border-b border-sombra px-5 py-4">
                    <button
                      onClick={() =>
                        setSelectedOrderId((prev) =>
                          prev === order.id ? "" : order.id,
                        )
                      }
                      className="rounded-2xl border border-sombra bg-arena px-3 py-2 text-sm font-semibold text-cafe transition hover:bg-sombra/60"
                    >
                      {selectedOrderId === order.id
                        ? "Ocultar detalle"
                        : "Ver detalle"}
                    </button>
                  </td>
                </tr>
              ))}

              {!orders?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-cafe/65"
                  >
                    Todavía no hay pedidos registrados.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {statusMutation.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statusMutation.error instanceof Error
            ? statusMutation.error.message
            : "No se pudo actualizar el estado del pedido"}
        </div>
      ) : null}

      {selectedOrderId ? (
        <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
          <div className="border-b border-sombra px-5 py-4">
            <h3 className="text-lg font-bold text-bordo">Detalle del pedido</h3>
            <p className="mt-1 text-sm text-cafe/75">
              Información completa del pedido seleccionado y sus ítems.
            </p>
          </div>

          {detailQuery.isLoading ? (
            <p className="px-5 py-6 text-sm text-cafe/70">Cargando detalle...</p>
          ) : null}

          {detailQuery.data ? (
            <div className="space-y-5 p-5">
              <div className="grid gap-3 rounded-2xl border border-sombra bg-arena/40 px-4 py-4 text-sm sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                    Cliente
                  </p>
                  <p className="mt-1 font-medium text-bordo">
                    {getClientName(detailQuery.data.clientId)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                    Estado
                  </p>
                  <p className="mt-1 font-medium text-cafe">
                    {STATUS_LABELS[detailQuery.data.status] ?? detailQuery.data.status}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                    Subtotal
                  </p>
                  <p className="mt-1 font-medium text-cafe">
                    {formatMoney(detailQuery.data.subtotalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                    Descuento
                  </p>
                  <p className="mt-1 font-medium text-cafe">
                    {formatMoney(detailQuery.data.discountAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
                    Total
                  </p>
                  <p className="mt-1 font-bold text-bordo">
                    {formatMoney(detailQuery.data.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-sombra">
                <table className="min-w-full">
                  <thead className="bg-arena/70">
                    <tr>
                      <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                        Producto
                      </th>
                      <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                        Cantidad
                      </th>
                      <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                        P. unitario
                      </th>
                      <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                        Costo unit.
                      </th>
                      <th className="border-b border-sombra px-5 py-3 text-left text-sm font-semibold text-cafe">
                        Subtotal línea
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailQuery.data.items.map((item) => (
                      <tr key={item.id} className="transition hover:bg-arena/20">
                        <td className="border-b border-sombra px-5 py-3 text-sm font-medium text-bordo">
                          {item.productNameSnapshot}
                        </td>
                        <td className="border-b border-sombra px-5 py-3 text-sm text-cafe">
                          {item.quantity}
                        </td>
                        <td className="border-b border-sombra px-5 py-3 text-sm text-cafe">
                          {formatMoney(item.unitSalePriceSnapshot)}
                        </td>
                        <td className="border-b border-sombra px-5 py-3 text-sm text-cafe">
                          {formatMoney(item.unitCostSnapshot)}
                        </td>
                        <td className="border-b border-sombra px-5 py-3 text-sm font-medium text-cafe">
                          {formatMoney(item.lineSubtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
