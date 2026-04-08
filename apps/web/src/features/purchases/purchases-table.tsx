import { useMemo, useState } from "react";
import { MdEdit, MdDeleteForever } from "react-icons/md";

import { usePurchases, useDeletePurchase } from "./use-purchases";

const TYPE_LABELS: Record<string, string> = {
  all: "Todos",
  ingredient: "Ingrediente",
  operational: "Operativo",
  investment: "Inversión",
};

function getTypeStyle(type: string): React.CSSProperties {
  if (type === "ingredient") {
    return {
      background: "var(--info-soft)",
      color: "var(--info)",
    };
  }

  if (type === "operational") {
    return {
      background: "var(--warning-soft)",
      color: "var(--warning)",
    };
  }

  if (type === "investment") {
    return {
      background: "var(--surface-3)",
      color: "var(--foreground-soft)",
    };
  }

  return {
    background: "var(--surface-3)",
    color: "var(--foreground-soft)",
  };
}

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

type FilterType = "all" | "ingredient" | "operational" | "investment";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "ingredient", label: "Ingredientes" },
  { value: "operational", label: "Operativos" },
  { value: "investment", label: "Inversiones" },
];

export function PurchasesTable({ onEdit }: { onEdit?: (id: string) => void }) {
  const { data, isLoading } = usePurchases();
  const deleteMutation = useDeletePurchase();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (filter === "all") return data;
    return data.filter((purchase) => purchase.type === filter);
  }, [data, filter]);

  if (isLoading) {
    return (
      <div
        className="rounded-3xl border px-6 py-12 text-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
        }}
      >
        Cargando compras...
      </div>
    );
  }

  return (
    <section
      className="overflow-hidden rounded-3xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        className="border-b px-5 py-4"
        style={{
          background: "var(--surface-2)",
          borderColor: "var(--border-soft)",
        }}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2
              className="text-sm font-semibold"
              style={{ color: "var(--foreground)" }}
            >
              Historial de compras
            </h2>
            <p
              className="mt-1 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              Registro de compras de ingredientes, gastos operativos e
              inversiones.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                background: "var(--surface-3)",
                color: "var(--foreground-muted)",
              }}
            >
              {filteredData.length} registro
              {filteredData.length !== 1 ? "s" : ""}
            </span>

            <div
              className="flex gap-1 rounded-xl border p-1"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
              }}
            >
              {FILTERS.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setFilter(tab.value)}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold transition"
                  style={
                    filter === tab.value
                      ? {
                          background: "var(--primary)",
                          color: "var(--primary-foreground)",
                        }
                      : {
                          background: "transparent",
                          color: "var(--foreground-muted)",
                        }
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[860px] w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {[
                "Fecha",
                "Tipo",
                "Descripción",
                "Cantidad",
                "Unidad",
                "Precio unit.",
                "Total",
                "Proveedor",
                "",
              ].map((col) => (
                <th
                  key={col}
                  className="border-b px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: "var(--border-soft)",
                    color: "var(--foreground-muted)",
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredData.map((purchase) => (
              <tr
                key={purchase.id}
                className="transition"
                style={{
                  borderBottom: "1px solid var(--border-soft)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    "var(--surface-hover)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    "transparent";
                }}
              >
                <td
                  className="px-5 py-4 text-sm"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  {formatDate(purchase.date)}
                </td>

                <td className="px-5 py-4 text-sm">
                  <span
                    className="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={getTypeStyle(purchase.type)}
                  >
                    {TYPE_LABELS[purchase.type] ?? purchase.type}
                  </span>
                </td>

                <td
                  className="px-5 py-4 text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  {purchase.nameSnapshot}
                </td>

                <td
                  className="px-5 py-4 text-sm"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  {purchase.quantity ?? "—"}
                </td>

                <td
                  className="px-5 py-4 text-sm"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  {purchase.unit ?? "—"}
                </td>

                <td
                  className="px-5 py-4 text-sm"
                  style={{ color: "var(--foreground-soft)" }}
                >
                  {purchase.unitPrice != null
                    ? formatMoney(purchase.unitPrice)
                    : "—"}
                </td>

                <td
                  className="px-5 py-4 text-sm font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  {formatMoney(purchase.totalAmount)}
                </td>

                <td
                  className="px-5 py-4 text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  {purchase.supplier ?? "—"}
                </td>

                <td className="px-5 py-4 text-sm text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEdit && (
                      <button
                        type="button"
                        onClick={() => onEdit(purchase.id)}
                        className="flex items-center gap-1 auto-cols-auto rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition"
                        style={{
                          background: "var(--surface-2)",
                          borderColor: "var(--border)",
                          color: "var(--foreground-soft)",
                        }}
                        title="Editar"
                      >
                        <MdEdit size={14} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Eliminar este registro? Esta acción no se puede deshacer.",
                          )
                        ) {
                          deleteMutation.mutate(purchase.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        background: "var(--danger-soft)",
                        borderColor: "var(--danger)",
                        color: "var(--danger-text)",
                      }}
                      title="Eliminar"
                    >
                      <MdDeleteForever size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {!filteredData.length ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No hay registros para el filtro seleccionado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
