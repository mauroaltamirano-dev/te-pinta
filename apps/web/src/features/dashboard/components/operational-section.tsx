import { Link } from "react-router-dom";
import { useOperationalDashboard } from "../hooks/use-operational-dashboard";
import { KpiCard } from "./kpi-card";
import { VarietyBreakdownTable } from "./variety-breakdown-table";

function StatusBadge({ status }: { status: "confirmed" | "prepared" }) {
  const map = {
    confirmed: {
      label: "Confirmado",
      color: "var(--info-text)",
      bg: "var(--info-soft)",
    },
    prepared: {
      label: "Preparado",
      color: "var(--primary)",
      bg: "rgba(192, 122, 82, 0.12)",
    },
  } as const;
  const { label, color, bg } = map[status];
  return (
    <span
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}

const STATUS_BORDER: Record<"confirmed" | "prepared", string> = {
  confirmed: "var(--info)",
  prepared: "var(--primary)",
};

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 rounded-2xl border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          />
        ))}
      </div>
      <div
        className="h-40 rounded-2xl border"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      />
    </div>
  );
}

export function OperationalSection() {
  const { data, isLoading, isError } = useOperationalDashboard();

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full animate-pulse"
            style={{ background: "var(--success)" }}
          />
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "var(--foreground-muted)" }}
          >
            Operación actual
          </h2>
        </div>
        <Link
          to="/orders"
          className="text-xs font-medium hover:underline"
          style={{ color: "var(--primary)" }}
        >
          Ver pedidos →
        </Link>
      </div>

      {isLoading && <SectionSkeleton />}

      {isError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "var(--danger-soft)",
            borderColor: "var(--danger)",
            color: "var(--danger-text)",
          }}
        >
          No se pudo cargar el resumen operativo.
        </div>
      )}

      {!isLoading && !isError && data && (
        <>
          {/* KPIs operativos */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Pedidos activos"
              value={data.totalActiveOrders.toLocaleString("es-AR")}
              helper={`${data.confirmedCount} confirmados · ${data.preparedCount} preparados`}
              icon="🧾"
              accent="default"
            />
            <KpiCard
              title="Unidades a realizar"
              value={data.totalUnits.toLocaleString("es-AR")}
              helper="Solo pedidos confirmados"
              icon="🫓"
            />
            <KpiCard
              title="Docenas a realizar"
              value={data.totalDozens.toFixed(1)}
              helper="Equivalente en docenas"
              icon="📦"
            />
            <KpiCard
              title="Variedades"
              value={data.varieties.length.toLocaleString("es-AR")}
              helper="Productos distintos activos"
              icon="🎨"
            />
          </div>

          {/* Detalle: variedades + pedidos activos */}
          <div className="grid gap-4 xl:grid-cols-[1fr_1.5fr]">
            {/* Variedades en curso */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--foreground-muted)" }}
              >
                Variedades en curso
              </p>
              {data.varieties.length === 0 ? (
                <p
                  className="text-sm py-4 text-center"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No hay variedades activas
                </p>
              ) : (
                <VarietyBreakdownTable rows={data.varieties} showDozens />
              )}
            </div>

            {/* Pedidos activos */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wider mb-4"
                style={{ color: "var(--foreground-muted)" }}
              >
                Pedidos en curso
              </p>
              {data.activeOrders.length === 0 ? (
                <p
                  className="text-sm py-6 text-center"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No hay pedidos activos
                </p>
              ) : (
                <ul className="space-y-2">
                  {data.activeOrders.map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between rounded-xl px-4 py-3"
                      style={{
                        background: "var(--surface-2)",
                        borderLeft: `3px solid ${STATUS_BORDER[order.status]}`,
                      }}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span
                          className="text-sm font-medium truncate"
                          style={{ color: "var(--foreground)" }}
                        >
                          {order.customerName ?? "Cliente sin nombre"}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {order.totalUnits} u.
                          {order.deliveryDate
                            ? ` · Entrega ${new Date(order.deliveryDate).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}`
                            : ""}
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}

      {/* Estado vacío */}
      {!isLoading && !isError && data && data.totalActiveOrders === 0 && (
        <div
          className="rounded-2xl border border-dashed py-8 text-center text-sm"
          style={{ borderColor: "var(--border)", color: "var(--foreground-muted)" }}
        >
          No hay pedidos activos en este momento.
        </div>
      )}
    </section>
  );
}
