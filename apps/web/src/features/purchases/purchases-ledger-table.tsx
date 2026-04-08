import { useMemo, useState } from "react";
import { Filter } from "lucide-react";

import { usePurchases } from "./use-purchases";

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

const TYPE_LABELS: Record<string, string> = {
  all: "Todos",
  ingredient: "Ingredientes",
  operational: "Operativos",
  investment: "Inversiones",
};

const TYPE_BORDER: Record<string, string> = {
  ingredient: "var(--info)",
  operational: "var(--warning)",
  investment: "var(--success)",
};

const TYPE_BADGE_BG: Record<string, string> = {
  ingredient: "var(--info-soft)",
  operational: "var(--warning-soft)",
  investment: "var(--success-soft)",
};

const TYPE_BADGE_TEXT: Record<string, string> = {
  ingredient: "var(--info-text)",
  operational: "var(--warning-text)",
  investment: "var(--success-text)",
};

type FilterValue = "all" | "ingredient" | "operational" | "investment";

const FILTER_OPTIONS: FilterValue[] = [
  "all",
  "ingredient",
  "operational",
  "investment",
];

export function PurchasesLedgerTable() {
  const { data, isLoading } = usePurchases();
  const [typeFilter, setTypeFilter] = useState<FilterValue>("all");

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (typeFilter === "all") return data;
    return data.filter((purchase) => purchase.type === typeFilter);
  }, [data, typeFilter]);

  if (isLoading) {
    return (
      <div
        className="rounded-xl border p-6"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
        }}
      >
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded-lg"
              style={{
                background: "var(--surface-3)",
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-xl border animate-fade-in"
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* ── Header con filtros ── */}
      <div
        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderBottom: "1px solid var(--border-soft)",
        }}
      >
        <div>
          <h2
            className="text-sm font-bold"
            style={{ color: "var(--foreground)" }}
          >
            Libro de movimientos
          </h2>
          <p
            className="mt-0.5 text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            {filteredData.length} registros
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5">
          <Filter
            size={13}
            style={{ color: "var(--foreground-faint)" }}
            className="shrink-0 mr-0.5"
          />
          {FILTER_OPTIONS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setTypeFilter(value)}
              className="rounded-md px-2.5 py-1 text-xs font-medium transition"
              style={{
                background:
                  typeFilter === value
                    ? "rgba(192, 122, 82, 0.12)"
                    : "transparent",
                color:
                  typeFilter === value
                    ? "var(--primary)"
                    : "var(--foreground-muted)",
              }}
              onMouseEnter={(e) => {
                if (typeFilter !== value) {
                  e.currentTarget.style.background = "var(--surface-2)";
                }
              }}
              onMouseLeave={(e) => {
                if (typeFilter !== value) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              {TYPE_LABELS[value]}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-sm">
          <thead>
            <tr>
              {["Fecha", "Tipo", "Descripción", "Proveedor", "Total"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-5 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider"
                    style={{
                      color: "var(--foreground-faint)",
                      borderBottom: "1px solid var(--border-soft)",
                      background: "var(--surface)",
                    }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((purchase) => (
              <tr
                key={purchase.id}
                className="transition"
                style={{
                  borderLeft: `3px solid ${TYPE_BORDER[purchase.type] ?? "var(--border)"}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <td
                  className="px-5 py-3 tabular-nums"
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    color: "var(--foreground-muted)",
                    fontSize: "13px",
                  }}
                >
                  {formatDate(purchase.date)}
                </td>
                <td
                  className="px-5 py-3"
                  style={{ borderBottom: "1px solid var(--border-soft)" }}
                >
                  <span
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      background:
                        TYPE_BADGE_BG[purchase.type] ?? "var(--surface-3)",
                      color:
                        TYPE_BADGE_TEXT[purchase.type] ??
                        "var(--foreground-soft)",
                    }}
                  >
                    {TYPE_LABELS[purchase.type] ?? purchase.type}
                  </span>
                </td>
                <td
                  className="px-5 py-3 font-medium"
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    color: "var(--foreground)",
                    fontSize: "13px",
                  }}
                >
                  {purchase.nameSnapshot}
                  {purchase.notes && (
                    <span
                      className="ml-2 text-[11px] font-normal"
                      style={{ color: "var(--foreground-faint)" }}
                    >
                      {purchase.notes}
                    </span>
                  )}
                </td>
                <td
                  className="px-5 py-3"
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    color: "var(--foreground-muted)",
                    fontSize: "13px",
                  }}
                >
                  {purchase.supplier ?? "—"}
                </td>
                <td
                  className="px-5 py-3 font-semibold tabular-nums"
                  style={{
                    borderBottom: "1px solid var(--border-soft)",
                    color: "var(--foreground)",
                    fontSize: "13px",
                  }}
                >
                  {formatMoney(purchase.totalAmount)}
                </td>
              </tr>
            ))}

            {!filteredData.length ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No hay registros contables para el filtro seleccionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
