import { useState } from "react";

import { useSalesDashboard } from "../../hooks/dashboard/use-sales-dashboard";
import { DashboardRangeFilter } from "../../features/dashboard/components/dashboard-range-filter";
import { KpiCard } from "../../features/dashboard/components/kpi-card";
import { RevenueSummaryCards } from "../../features/dashboard/components/revenue-summary-cards";
import { SalesTrendChart } from "../../features/dashboard/components/sales-trend-chart";
import { RecentSalesTable } from "../../features/dashboard/components/recent-sales-table";
import { TopProductsList } from "../../features/dashboard/components/top-products-list";
import { SalesByChannelList } from "../../features/dashboard/components/sales-by-channel-list";
import type { DashboardRange } from "../../services/api/dashboard.api";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

/* ── Skeleton de carga ──────────────────────────────────────── */
function DashboardSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border)",
            }}
          />
        ))}
      </div>
      <div
        className="h-72 rounded-2xl border"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      />
    </div>
  );
}

/* ── Página principal ───────────────────────────────────────── */
export function SalesDashboardPage() {
  const [range, setRange] = useState<DashboardRange>("7d");
  const { data, isLoading, isError } = useSalesDashboard(range);

  const RANGE_LABELS: Record<DashboardRange, string> = {
    today: "hoy",
    "7d": "los últimos 7 días",
    "30d": "los últimos 30 días",
    month: "este mes",
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Resumen
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Dashboard</h1>
        </div>
        <DashboardRangeFilter value={range} onChange={setRange} />
      </div>

      {/* ── Resumen global (ingresos vs egresos) ────────────── */}
      <RevenueSummaryCards />

      {/* ── Loading / Error ────────────────────────────────── */}
      {isLoading && <DashboardSkeleton />}

      {isError && (
        <div
          className="rounded-xl border px-5 py-4 text-sm"
          style={{
            background: "var(--danger-soft)",
            borderColor: "var(--danger)",
            color: "var(--danger-text)",
          }}
        >
          No se pudo cargar el dashboard. Verificá la conexión e intentá de
          nuevo.
        </div>
      )}

      {/* ── Contenido ──────────────────────────────────────── */}
      {!isLoading && !isError && data && (
        <>
          {/* KPIs del período */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="Ventas brutas"
              value={formatMoney(data.summary.grossSales)}
              helper={`En ${RANGE_LABELS[range]}`}
              icon="💰"
              accent="default"
            />
            <KpiCard
              title="Pedidos"
              value={data.summary.totalOrders.toLocaleString("es-AR")}
              helper="Pedidos entregados"
              icon="📦"
            />
            <KpiCard
              title="Ticket promedio"
              value={formatMoney(data.summary.averageTicket)}
              helper="Por pedido entregado"
              icon="🧾"
            />
            <KpiCard
              title="Items vendidos"
              value={data.summary.totalItemsSold.toLocaleString("es-AR")}
              helper="Unidades en el período"
              icon="🫓"
            />
          </div>

          {/* Gráfico + side panel */}
          <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
            <SalesTrendChart data={data.trend} />

            <div className="flex flex-col gap-5">
              <TopProductsList data={data.topProducts} />
              <SalesByChannelList data={data.byPaymentMethod} />
            </div>
          </div>

          {/* Últimas ventas */}
          <RecentSalesTable data={data.recentSales} />
        </>
      )}
    </div>
  );
}
