import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesTrendItem } from "../../../services/api/dashboard.api";

type Props = {
  data: SalesTrendItem[];
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

/* ── Tooltip personalizado ──────────────────────────────────── */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-xl border px-4 py-3 text-sm shadow-lg"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-strong)",
        color: "var(--foreground)",
      }}
    >
      <p className="font-semibold" style={{ color: "var(--foreground-muted)" }}>
        {label ? formatDate(label) : ""}
      </p>
      <p
        className="mt-1 text-base font-bold"
        style={{ color: "var(--primary)" }}
      >
        {formatMoney(payload[0].value)}
      </p>
    </div>
  );
}

export function SalesTrendChart({ data }: Props) {
  const isEmpty = !data || data.length === 0;

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
          Ventas por día
        </h3>
        <p
          className="mt-0.5 text-xs"
          style={{ color: "var(--foreground-muted)" }}
        >
          Evolución de ventas brutas en el período
        </p>
      </div>

      {/* Chart */}
      <div className="h-[280px] p-4">
        {isEmpty ? (
          <div
            className="flex h-full items-center justify-center text-sm"
            style={{ color: "var(--foreground-muted)" }}
          >
            Sin datos en el período seleccionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--primary)"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border-soft)"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                axisLine={false}
                tickLine={false}
                dy={8}
              />

              <YAxis
                tickFormatter={formatMoney}
                tick={{ fontSize: 11, fill: "var(--foreground-muted)" }}
                axisLine={false}
                tickLine={false}
                width={72}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="grossSales"
                stroke="var(--primary)"
                strokeWidth={2.5}
                fill="url(#salesGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--primary)",
                  stroke: "var(--surface)",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
