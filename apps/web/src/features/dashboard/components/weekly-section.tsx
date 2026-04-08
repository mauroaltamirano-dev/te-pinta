import { Link } from "react-router-dom";
import type { WeeklyClosure } from "../../../services/api/weekly-closures.api";
import { useClosureMetrics } from "../hooks/use-weekly-closures";
import { KpiCard } from "./kpi-card";
import { BreakdownList } from "./breakdown-list";
import { VarietyBreakdownTable } from "./variety-breakdown-table";

type Props = {
  closure: WeeklyClosure;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

function MetricSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
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
      <div className="grid gap-4 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-36 rounded-2xl border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function WeeklySection({ closure }: Props) {
  const { data: metrics, isLoading, isError } = useClosureMetrics(closure.id);

  const closureLabel = (() => {
    const start = new Date(closure.startDate).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
    });
    const end = new Date(closure.endDate).toLocaleDateString("es-AR", {
      day: "numeric",
      month: "long",
    });
    return closure.name ?? `${start} – ${end}`;
  })();

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            className="text-sm font-semibold uppercase tracking-widest"
            style={{ color: "var(--foreground-muted)" }}
          >
            Resumen semanal
          </h2>
          <p
            className="text-base font-semibold mt-0.5"
            style={{ color: "var(--foreground)" }}
          >
            {closureLabel}
            {closure.status === "open" && (
              <span
                className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  background: "var(--success-soft)",
                  color: "var(--success-text)",
                }}
              >
                abierta
              </span>
            )}
          </p>
        </div>
        <Link
          to="/weekly-closures"
          className="text-xs font-medium hover:underline"
          style={{ color: "var(--primary)" }}
        >
          Ver cierres →
        </Link>
      </div>

      {isLoading && <MetricSkeleton />}

      {isError && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            background: "var(--danger-soft)",
            borderColor: "var(--danger)",
            color: "var(--danger-text)",
          }}
        >
          No se pudieron cargar las métricas del cierre.
        </div>
      )}

      {!isLoading && !isError && metrics && (
        <>
          {/* KPIs principales */}
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Ingresos brutos"
              value={formatMoney(metrics.grossRevenue)}
              helper={`Ticket prom. ${formatMoney(metrics.averageTicket)}`}
              icon="💰"
              accent="default"
            />
            <KpiCard
              title="Gastos"
              value={formatMoney(metrics.totalPurchases)}
              helper="Ingredientes + operacional"
              icon="🧾"
              accent="danger"
            />
            <KpiCard
              title="Resultado estimado"
              value={formatMoney(metrics.estimatedProfit)}
              helper={
                metrics.estimatedProfit >= 0
                  ? "Resultado positivo"
                  : "Resultado negativo"
              }
              icon={metrics.estimatedProfit >= 0 ? "📈" : "📉"}
              accent={metrics.estimatedProfit >= 0 ? "success" : "danger"}
            />
            <KpiCard
              title="Pedidos"
              value={metrics.totalOrders.toLocaleString("es-AR")}
              helper={`${metrics.totalDeliveredOrders} entregados · ${metrics.cancelledOrders} cancelados`}
              icon="📦"
            />
          </div>

          {/* KPIs secundarios */}
          <div className="grid gap-3 sm:grid-cols-3">
            <KpiCard
              title="Unidades"
              value={metrics.totalUnits.toLocaleString("es-AR")}
              helper="Unidades totales entregadas"
              icon="🫓"
            />
            <KpiCard
              title="Docenas"
              value={metrics.totalDozens.toFixed(1)}
              helper="Equivalente en docenas"
              icon="📋"
            />
            <KpiCard
              title="Descuentos"
              value={formatMoney(metrics.totalDiscounts)}
              helper="Total descontado en el período"
              icon="🏷️"
            />
          </div>

          {/* Breakdowns + Top variedades */}
          <div className="grid gap-4 xl:grid-cols-3">
            {/* Top variedades */}
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
                Top variedades
              </p>
              <VarietyBreakdownTable
                rows={metrics.topVarieties}
                showDozens={false}
                emptyText="Sin variedades registradas"
              />
            </div>

            {/* Breakdown por canal */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <BreakdownList
                title="Por canal"
                items={Object.entries(metrics.breakdownByChannel).map(
                  ([label, value]) => ({
                    label,
                    value,
                    isCount: true,
                  }),
                )}
                emptyText="Sin datos de canal"
              />

              <div className="mt-5">
                <BreakdownList
                  title="Por estado"
                  items={Object.entries(metrics.breakdownByStatus)
                    .filter(([, v]) => v > 0)
                    .map(([label, value]) => ({
                      label,
                      value,
                      isCount: true,
                    }))}
                  emptyText="Sin datos de estado"
                />
              </div>
            </div>

            {/* Gastos por tipo */}
            <div
              className="rounded-2xl border p-5"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
              }}
            >
              <BreakdownList
                title="Gastos por tipo"
                items={Object.entries(metrics.breakdownByPurchaseType)
                  .filter(([, v]) => v > 0)
                  .map(([label, value]) => ({
                    label,
                    value,
                    isCount: false,
                  }))}
                emptyText="Sin compras registradas"
              />

              {/* Mini resumen de costos */}
              <div
                className="mt-5 space-y-2 pt-4"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--foreground-muted)" }}>
                    Ingredientes
                  </span>
                  <span
                    className="tabular-nums font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {formatMoney(metrics.totalIngredientPurchases)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--foreground-muted)" }}>
                    Operacional
                  </span>
                  <span
                    className="tabular-nums font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {formatMoney(metrics.totalOperationalPurchases)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--foreground-muted)" }}>
                    Inversión
                  </span>
                  <span
                    className="tabular-nums font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {formatMoney(metrics.totalInvestmentPurchases)}
                  </span>
                </div>
                <div
                  className="flex justify-between text-sm font-semibold pt-2"
                  style={{
                    borderTop: "1px solid var(--border)",
                    color: "var(--foreground)",
                  }}
                >
                  <span>Total gastos</span>
                  <span className="tabular-nums">
                    {formatMoney(metrics.totalPurchases)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
