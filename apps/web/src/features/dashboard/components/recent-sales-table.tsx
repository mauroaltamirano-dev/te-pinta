import type { RecentSaleItem } from "../../../services/api/dashboard.api";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "prepared"
  | "delivered"
  | "cancelled";

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
  prepared: {
    background: "rgba(192, 122, 82, 0.12)",
    color: "var(--primary)",
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

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

type Props = {
  data: RecentSaleItem[];
};

export function RecentSalesTable({ data }: Props) {
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
        className="border-b px-5 py-4"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface-2)",
        }}
      >
        <h3
          className="text-sm font-semibold"
          style={{ color: "var(--foreground)" }}
        >
          Últimas ventas
        </h3>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Pedidos más recientes del período
        </p>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-[560px] w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Cliente", "Canal", "Estado", "Fecha", "Total"].map(
                (col, i) => (
                  <th
                    key={col}
                    className={`border-b px-5 py-3 text-xs font-semibold uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Sin ventas en el período seleccionado.
                </td>
              </tr>
            ) : (
              data.map((sale) => (
                <tr
                  key={sale.id}
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
                    className="border-b px-5 py-3.5 font-medium"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground)",
                    }}
                  >
                    {sale.customerName ?? "Consumidor final"}
                  </td>
                  <td
                    className="border-b px-5 py-3.5 text-xs"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {CHANNEL_LABELS[sale.paymentMethod] ?? sale.paymentMethod}
                  </td>
                  <td
                    className="border-b px-5 py-3.5"
                    style={{ borderColor: "var(--border-soft)" }}
                  >
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={
                        STATUS_STYLE[sale.status as OrderStatus] ?? {
                          background: "var(--surface-3)",
                          color: "var(--foreground-muted)",
                        }
                      }
                    >
                      {STATUS_LABELS[sale.status as OrderStatus] ?? sale.status}
                    </span>
                  </td>
                  <td
                    className="border-b px-5 py-3.5 text-xs tabular-nums"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground-muted)",
                    }}
                  >
                    {new Date(sale.createdAt).toLocaleDateString("es-AR")}
                  </td>
                  <td
                    className="border-b px-5 py-3.5 text-right font-semibold tabular-nums"
                    style={{
                      borderColor: "var(--border-soft)",
                      color: "var(--foreground)",
                    }}
                  >
                    {formatMoney(sale.total)}
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
