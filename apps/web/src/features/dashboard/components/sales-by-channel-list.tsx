import type { SalesByPaymentMethodItem } from "../../../services/api/dashboard.api";

type Props = {
  data: SalesByPaymentMethodItem[];
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
    notation: "compact",
  }).format(value);
}

export function SalesByChannelList({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.total, 0);

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
          Ventas por canal
        </h3>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Distribución del período
        </p>
      </div>

      {/* Lista */}
      <div className="space-y-1 p-3">
        {data.length === 0 ? (
          <p
            className="py-8 text-center text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Sin datos en el período seleccionado.
          </p>
        ) : (
          data.map((item) => {
            const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
            return (
              <div
                key={item.paymentMethod}
                className="rounded-xl px-3 py-2.5 transition"
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background =
                    "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background =
                    "transparent")
                }
              >
                <div className="flex items-center justify-between">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {CHANNEL_LABELS[item.paymentMethod] ?? item.paymentMethod}
                  </p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs tabular-nums"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {pct}%
                    </span>
                    <span
                      className="text-xs font-bold tabular-nums"
                      style={{ color: "var(--foreground)" }}
                    >
                      {formatMoney(item.total)}
                    </span>
                  </div>
                </div>

                {/* Barra proporcional */}
                <div
                  className="mt-1.5 h-1.5 overflow-hidden rounded-full"
                  style={{ background: "var(--surface-3)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: "var(--accent-strong)",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
