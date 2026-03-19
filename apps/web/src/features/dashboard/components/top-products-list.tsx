import type { TopProductItem } from "../../../services/api/dashboard.api";

type Props = {
  data: TopProductItem[];
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

export function TopProductsList({ data }: Props) {
  const maxQty =
    data.length > 0 ? Math.max(...data.map((p) => p.quantitySold)) : 1;

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
          Top productos
        </h3>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Más vendidos en el período
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
          data.map((product, index) => {
            const pct = Math.round((product.quantitySold / maxQty) * 100);
            return (
              <div
                key={product.productId}
                className="group rounded-xl px-3 py-2.5 transition"
                style={{ background: "transparent" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background =
                    "var(--surface-hover)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background =
                    "transparent")
                }
              >
                <div className="flex items-center gap-3">
                  {/* Posición */}
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{
                      background:
                        index === 0
                          ? "var(--primary)"
                          : index === 1
                            ? "var(--surface-3)"
                            : index === 2
                              ? "var(--surface-3)"
                              : "var(--surface-2)",
                      color:
                        index === 0
                          ? "var(--primary-foreground)"
                          : "var(--foreground-muted)",
                    }}
                  >
                    {index + 1}
                  </span>

                  {/* Nombre + barra */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className="truncate text-xs font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {product.productName}
                      </p>
                      <p
                        className="ml-2 shrink-0 text-xs font-bold tabular-nums"
                        style={{ color: "var(--primary)" }}
                      >
                        {formatMoney(product.totalSales)}
                      </p>
                    </div>

                    {/* Barra de progreso */}
                    <div
                      className="mt-1.5 h-1.5 overflow-hidden rounded-full"
                      style={{ background: "var(--surface-3)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background:
                            index === 0
                              ? "var(--primary)"
                              : "var(--accent-strong)",
                        }}
                      />
                    </div>

                    <p
                      className="mt-1 text-xs tabular-nums"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {product.quantitySold} vendido
                      {product.quantitySold !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
