import { useState, useMemo } from "react";
import { MdEdit, MdPowerSettingsNew } from "react-icons/md";

import {
  useCategories,
  useDeactivateCategory,
  useReactivateCategory,
} from "./use-categories";

type CategoriesTableProps = {
  selectedCategoryId?: string | null;
  onEditCategory: (categoryId: string) => void;
};

type FilterType = "active" | "all" | "inactive";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "active", label: "Activas" },
  { value: "all", label: "Todas" },
  { value: "inactive", label: "Inactivas" },
];

export function CategoriesTable({
  selectedCategoryId,
  onEditCategory,
}: CategoriesTableProps) {
  const [filter, setFilter] = useState<FilterType>("active");

  const { data, isLoading } = useCategories({
    includeInactive: filter !== "active",
  });

  const deactivateMutation = useDeactivateCategory();
  const reactivateMutation = useReactivateCategory();
  const isToggling =
    deactivateMutation.isPending || reactivateMutation.isPending;

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (filter === "inactive") return data.filter((c) => !c.isActive);
    if (filter === "active") return data.filter((c) => c.isActive);
    return data;
  }, [data, filter]);

  // ── Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border px-6 py-12 text-sm"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--foreground-muted)",
        }}
      >
        <span className="animate-pulse">Cargando categorías…</span>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
        style={{
          borderColor: "var(--border-soft)",
          background: "var(--surface-2)",
        }}
      >
        <div>
          <h2
            className="text-sm font-semibold"
            style={{ color: "var(--foreground)" }}
          >
            Listado
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: "var(--foreground-muted)" }}
          >
            {filteredData.length} categoría
            {filteredData.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtro por estado */}
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

      {/* ── Tabla ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Nombre", "Descripción", "Estado", ""].map((col) => (
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
            {filteredData.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No hay categorías{" "}
                  {filter === "inactive"
                    ? "inactivas"
                    : filter === "active"
                      ? "activas"
                      : ""}{" "}
                  registradas.
                </td>
              </tr>
            ) : (
              filteredData.map((category) => {
                const isSelected = selectedCategoryId === category.id;

                return (
                  <tr
                    key={category.id}
                    className="transition"
                    style={{
                      background: isSelected
                        ? "var(--warning-soft)"
                        : "transparent",
                      borderLeft: isSelected
                        ? "3px solid var(--warning)"
                        : "3px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "var(--surface-hover)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected)
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "transparent";
                    }}
                  >
                    {/* Nombre */}
                    <td
                      className="border-b px-5 py-3.5 font-medium"
                      style={{
                        borderColor: "var(--border-soft)",
                        color: isSelected
                          ? "var(--warning-text)"
                          : "var(--foreground)",
                      }}
                    >
                      {category.name}
                    </td>

                    {/* Descripción */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{
                        borderColor: "var(--border-soft)",
                        color: "var(--foreground-muted)",
                      }}
                    >
                      {category.description ?? (
                        <span style={{ color: "var(--foreground-faint)" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={
                          category.isActive
                            ? {
                                background: "var(--success-soft)",
                                color: "var(--success-text)",
                              }
                            : {
                                background: "var(--surface-3)",
                                color: "var(--foreground-muted)",
                              }
                        }
                      >
                        <span
                          className="mr-1.5 h-1.5 w-1.5 rounded-full"
                          style={{
                            background: category.isActive
                              ? "var(--success)"
                              : "var(--foreground-faint)",
                          }}
                        />
                        {category.isActive ? "Activa" : "Inactiva"}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <div className="flex items-center gap-2">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => onEditCategory(category.id)}
                          disabled={isToggling}
                          title="Editar"
                          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            background: isSelected
                              ? "var(--warning)"
                              : "var(--surface-2)",
                            borderColor: isSelected
                              ? "var(--warning)"
                              : "var(--border)",
                            color: isSelected
                              ? "#fff"
                              : "var(--foreground-soft)",
                          }}
                        >
                          <MdEdit size={13} />
                          <span>Editar</span>
                        </button>

                        {/* Activar / Desactivar */}
                        {category.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Desactivar "${category.name}"?`,
                                )
                              ) {
                                deactivateMutation.mutate(category.id);
                              }
                            }}
                            disabled={isToggling}
                            title="Desactivar"
                            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              background: "var(--surface-2)",
                              borderColor: "var(--border)",
                              color: "var(--foreground-muted)",
                            }}
                          >
                            <MdPowerSettingsNew size={13} />
                            <span>Desactivar</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(`¿Activar "${category.name}"?`)
                              ) {
                                reactivateMutation.mutate(category.id);
                              }
                            }}
                            disabled={isToggling}
                            title="Activar"
                            className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                              background: "var(--success-soft)",
                              borderColor: "var(--success)",
                              color: "var(--success-text)",
                            }}
                          >
                            <MdPowerSettingsNew size={13} />
                            <span>Activar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
