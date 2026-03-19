import { useMemo } from "react";
import { useOrders } from "./use-orders";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

export function OrdersRevenueTable() {
  const { data, isLoading } = useOrders();

  const deliveredOrders = useMemo(
    () => data?.filter((o) => o.status === "delivered") ?? [],
    [data],
  );

  const totalRevenue = useMemo(
    () => deliveredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    [deliveredOrders],
  );

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
        <span className="animate-pulse">Cargando pedidos entregados…</span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface-2)",
        }}
      >
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Pedidos entregados
          </h2>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            {deliveredOrders.length} entregado
            {deliveredOrders.length !== 1 ? "s" : ""}
          </p>
        </div>

        {deliveredOrders.length > 0 && (
          <div className="text-right">
            <p
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: "var(--foreground-muted)" }}
            >
              Total facturado
            </p>
            <p
              className="mt-0.5 text-base font-bold tabular-nums"
              style={{ color: "var(--primary)" }}
            >
              {formatMoney(totalRevenue)}
            </p>
          </div>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-[500px] w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Fecha", "Cliente", "Total", "Notas"].map((col) => (
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
            {deliveredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Todavía no hay pedidos entregados.
                </td>
              </tr>
            ) : (
              deliveredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition"
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "var(--surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLTableRowElement).style.background =
                      "transparent")
                  }
                >
                  <td
                    className="border-b px-5 py-3.5 text-xs tabular-nums"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {new Date(order.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td
                    className="border-b px-5 py-3.5 font-medium"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground)",
                    }}
                  >
                    {order.customerNameSnapshot ?? "Consumidor final"}
                  </td>
                  <td
                    className="border-b px-5 py-3.5 font-semibold tabular-nums"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground)",
                    }}
                  >
                    {formatMoney(order.totalAmount)}
                  </td>
                  <td
                    className="border-b px-5 py-3.5 text-xs"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {order.notes ?? (
                      <span style={{ color: "var(--foreground-faint)" }}>
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
