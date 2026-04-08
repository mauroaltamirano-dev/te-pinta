import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, ClipboardList, Box, CircleDot, CalendarDays } from "lucide-react";

import { useOperationalOrdersSummary } from "./use-orders";

function formatDozens(value: number) {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function todayLocalInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const CARD_DEFS = [
  {
    key: "orders",
    label: "PEDIDOS A REALIZAR",
    border: "var(--primary)",
    iconBg: "rgba(192, 122, 82, 0.12)",
    iconColor: "var(--primary)",
    icon: ClipboardList,
    getValue: (d: { ordersCount: number }) => String(d.ordersCount),
    valueColor: "var(--foreground)",
    sub: "Solo pedidos confirmados",
  },
  {
    key: "units",
    label: "UNIDADES A REALIZAR",
    border: "var(--info)",
    iconBg: "var(--info-soft)",
    iconColor: "var(--info-text)",
    icon: Box,
    getValue: (d: { totalUnits: number }) => String(d.totalUnits),
    valueColor: "var(--foreground)",
    sub: "Unidades pedidas",
  },
  {
    key: "dozens",
    label: "DOCENAS A REALIZAR",
    border: "var(--success)",
    iconBg: "var(--success-soft)",
    iconColor: "var(--success-text)",
    icon: CircleDot,
    getValue: (d: { totalDozens: number }) => formatDozens(d.totalDozens),
    valueColor: "var(--primary)",
    sub: "Equivalencia en docenas",
  },
] as const;

export function OrdersOperationalSummary() {
  const [useDateFilter, setUseDateFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState(todayLocalInputValue());
  const [expanded, setExpanded] = useState(false);

  const queryDate = useDateFilter ? selectedDate : undefined;
  const { data, isLoading } = useOperationalOrdersSummary(queryDate);

  const topVarieties = useMemo(() => data?.varieties ?? [], [data]);

  return (
    <section
      className="space-y-3 animate-fade-in"
    >
      {/* ── Header row ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className="text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            Resumen de producción de pedidos <strong>Confirmados</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseDateFilter(!useDateFilter)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition"
            style={{
              background: useDateFilter ? "rgba(192, 122, 82, 0.12)" : "transparent",
              color: useDateFilter ? "var(--primary)" : "var(--foreground-muted)",
            }}
          >
            <CalendarDays size={13} />
            Filtrar por entrega
          </button>

          {useDateFilter && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border px-2.5 py-1 text-xs outline-none transition"
              style={{
                background: "var(--surface)",
                borderColor: "var(--primary)",
                color: "var(--foreground)",
              }}
            />
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border p-4"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                borderLeft: "3px solid var(--border)",
              }}
            >
              <div className="h-3 w-24 rounded" style={{ background: "var(--surface-3)" }} />
              <div className="mt-3 h-7 w-16 rounded" style={{ background: "var(--surface-3)" }} />
              <div className="mt-2 h-3 w-32 rounded" style={{ background: "var(--surface-3)" }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          {CARD_DEFS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="rounded-xl border p-4 transition"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderLeft: `3px solid ${card.border}`,
                  boxShadow: "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: "var(--foreground-muted)" }}
                    >
                      {card.label}
                    </p>
                    <p
                      className="mt-2 text-2xl font-bold tabular-nums leading-none"
                      style={{ color: card.valueColor }}
                    >
                      {card.getValue(data ?? { ordersCount: 0, totalUnits: 0, totalDozens: 0 })}
                    </p>
                    <p
                      className="mt-2 text-xs"
                      style={{ color: "var(--foreground-faint)" }}
                    >
                      {card.sub}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-lg p-1.5"
                    style={{ background: card.iconBg }}
                  >
                    <Icon size={16} style={{ color: card.iconColor }} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Variedades accordion ── */}
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between px-5 py-3 text-left transition"
          style={{ color: "var(--foreground)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          <div>
            <p className="text-sm font-semibold">Variedades actuales</p>
            <p
              className="mt-0.5 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              {topVarieties.length} variedad
              {topVarieties.length !== 1 ? "es" : ""}
            </p>
          </div>

          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "var(--surface-2)",
              color: "var(--foreground-soft)",
            }}
          >
            {expanded ? (
              <ChevronUp size={15} />
            ) : (
              <ChevronDown size={15} />
            )}
          </span>
        </button>

        {expanded && (
          <div
            className="border-t px-5 py-3"
            style={{ borderColor: "var(--border-soft)" }}
          >
            {topVarieties.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--foreground-muted)" }}
              >
                No hay pedidos actuales para el criterio seleccionado.
              </p>
            ) : (
              <div className="space-y-1">
                {topVarieties.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center justify-between rounded-lg px-3 py-2 transition"
                    style={{
                      borderLeft: "3px solid var(--primary)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--surface-2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <p
                      className="truncate text-sm font-medium"
                      style={{ color: "var(--foreground)" }}
                    >
                      {item.productName}
                    </p>

                    <div className="ml-4 flex items-center gap-4 text-sm tabular-nums">
                      <span style={{ color: "var(--foreground-muted)" }}>
                        {item.units} un.
                      </span>
                      <span
                        className="font-semibold"
                        style={{ color: "var(--primary)" }}
                      >
                        {formatDozens(item.dozens)} doc.
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
