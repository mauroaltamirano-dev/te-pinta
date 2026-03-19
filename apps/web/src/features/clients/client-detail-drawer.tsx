import { MdClose, MdPhone, MdLocationOn, MdNotes } from "react-icons/md";
import { useClientStats } from "./use-clients";

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
  clientId: string;
  onClose: () => void;
};

export function ClientDetailDrawer({ clientId, onClose }: Props) {
  const { data, isLoading, isError } = useClientStats(clientId);

  return (
    <div className="flex h-full flex-col">
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-start justify-between border-b px-6 py-5 shrink-0"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface-2)",
        }}
      >
        <div className="min-w-0 flex-1 pr-4">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--foreground-muted)" }}
          >
            Perfil de cliente
          </p>
          <h2
            className="mt-0.5 truncate text-lg font-bold"
            style={{ color: "var(--foreground)" }}
          >
            {data?.client.name ?? "…"}
          </h2>

          {/* Info rápida */}
          {data?.client && (
            <div className="mt-2 space-y-1">
              {data.client.phone && (
                <p
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <MdPhone size={12} />
                  {data.client.phone}
                </p>
              )}
              {data.client.address && (
                <p
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <MdLocationOn size={12} />
                  {data.client.address}
                </p>
              )}
              {data.client.notes && (
                <p
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <MdNotes size={12} />
                  {data.client.notes}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1.5 transition"
          style={{ color: "var(--foreground-muted)" }}
        >
          <MdClose size={20} />
        </button>
      </div>

      {/* ── Cuerpo scrollable ───────────────────────────────── */}
      <div className="flex-1 overflow-y-auto space-y-5 px-6 py-5">
        {isLoading && (
          <p
            className="animate-pulse text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Cargando historial…
          </p>
        )}

        {isError && (
          <div
            className="rounded-xl border px-4 py-3 text-sm"
            style={{
              background: "var(--danger-soft)",
              borderColor: "var(--danger)",
              color: "var(--danger-text)",
            }}
          >
            No se pudo cargar el historial del cliente.
          </div>
        )}

        {data && (
          <>
            {/* ── Stats ─────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                { label: "Pedidos", value: String(data.stats.totalOrders) },
                {
                  label: "Total gastado",
                  value: formatMoney(data.stats.totalSpent),
                },
                {
                  label: "Ticket promedio",
                  value: formatMoney(data.stats.averageTicket),
                },
                { label: "Unidades", value: String(data.stats.totalUnits) },
                {
                  label: "Docenas",
                  value: String(Math.floor(data.stats.totalUnits / 12)),
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border p-3"
                  style={{
                    background: "var(--surface-2)",
                    borderColor: "var(--border-soft)",
                  }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    {label}
                  </p>
                  <p
                    className="mt-1 text-lg font-bold tabular-nums"
                    style={{ color: "var(--foreground)" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Historial de pedidos ───────────────────────── */}
            <div>
              <p
                className="mb-3 text-xs font-semibold uppercase tracking-wider"
                style={{ color: "var(--foreground-muted)" }}
              >
                Historial de pedidos entregados
              </p>

              {data.orders.length === 0 ? (
                <p
                  className="text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Este cliente todavía no tiene pedidos entregados.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.orders.map((order) => (
                    <div
                      key={order.id}
                      className="overflow-hidden rounded-xl border"
                      style={{
                        background: "var(--surface-2)",
                        borderColor: "var(--border-soft)",
                      }}
                    >
                      {/* Header del pedido */}
                      <div
                        className="flex items-center justify-between border-b px-4 py-3"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        <div className="flex items-center gap-2">
                          <p
                            className="text-xs tabular-nums"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            {new Date(order.createdAt).toLocaleDateString(
                              "es-AR",
                            )}
                          </p>
                          <span
                            className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                            style={{
                              background: "var(--surface-3)",
                              color: "var(--foreground-soft)",
                            }}
                          >
                            {CHANNEL_LABELS[order.channel] ?? order.channel}
                          </span>
                        </div>
                        <p
                          className="text-sm font-bold tabular-nums"
                          style={{ color: "var(--primary)" }}
                        >
                          {formatMoney(order.totalAmount)}
                        </p>
                      </div>

                      {/* Items del pedido */}
                      <div
                        className="divide-y px-4 py-2"
                        style={{ borderColor: "var(--border-soft)" }}
                      >
                        {order.items.map((item, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between py-1.5"
                          >
                            <p
                              className="text-xs"
                              style={{ color: "var(--foreground)" }}
                            >
                              <span
                                className="mr-2 font-semibold tabular-nums"
                                style={{ color: "var(--foreground-muted)" }}
                              >
                                ×{item.quantity}
                              </span>
                              {item.productNameSnapshot}
                            </p>
                            <p
                              className="text-xs tabular-nums"
                              style={{ color: "var(--foreground-muted)" }}
                            >
                              {formatMoney(item.lineSubtotal)}
                            </p>
                          </div>
                        ))}
                      </div>

                      {order.notes && (
                        <p
                          className="border-t px-4 py-2 text-xs italic"
                          style={{
                            borderColor: "var(--border-soft)",
                            color: "var(--foreground-muted)",
                          }}
                        >
                          {order.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
