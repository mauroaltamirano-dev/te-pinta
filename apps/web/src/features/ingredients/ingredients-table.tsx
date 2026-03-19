import { useState, useMemo } from "react";
import { MdEdit, MdPowerSettingsNew } from "react-icons/md";

import { useIngredients, useDeactivateIngredient } from "./use-ingredients";
import { useAllRecipeItems, useRecipes } from "../recipes/use-recipes";
import { useProducts } from "../products/use-products";
import { useCategories } from "../categories/use-categories";

/* ── constantes ─────────────────────────────────────────────── */
const UNIT_LABELS: Record<string, string> = {
  kg: "kg",
  g: "g",
  l: "l",
  ml: "ml",
  unit: "u",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

type FilterType = "active" | "all" | "inactive";

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "active", label: "Activos" },
  { value: "all", label: "Todos" },
  { value: "inactive", label: "Inactivos" },
];

/* ── props ──────────────────────────────────────────────────── */
type IngredientsTableProps = {
  selectedIngredientId?: string | null;
  onEditIngredient: (id: string) => void;
};

export function IngredientsTable({
  selectedIngredientId,
  onEditIngredient,
}: IngredientsTableProps) {
  const [filter, setFilter] = useState<FilterType>("active");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const { data, isLoading } = useIngredients({
    includeInactive: filter !== "active",
  });
  const { data: allRecipeItems = [] } = useAllRecipeItems();
  const { data: recipes = [] } = useRecipes();
  const { data: products = [] } = useProducts({ includeInactive: true });
  const { data: categories = [] } = useCategories();

  const deactivateMutation = useDeactivateIngredient();
  const isToggling = deactivateMutation.isPending;

  /**
   * Mapa: ingredientId → Set<categoryId>
   * Join: recipeItem.ingredientId → recipe.productId → product.categoryId
   */
  const ingredientCategoryMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const item of allRecipeItems) {
      const recipe = recipes.find((r) => r.id === item.recipeId);
      if (!recipe) continue;
      const product = products.find((p) => p.id === recipe.productId);
      if (!product?.categoryId) continue;
      if (!map.has(item.ingredientId)) map.set(item.ingredientId, new Set());
      map.get(item.ingredientId)!.add(product.categoryId);
    }
    return map;
  }, [allRecipeItems, recipes, products]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase().trim();
    return data.filter((i) => {
      const matchStatus =
        filter === "inactive"
          ? !i.isActive
          : filter === "active"
            ? i.isActive
            : true;
      const matchSearch =
        !q ||
        i.name.toLowerCase().includes(q) ||
        (i.description ?? "").toLowerCase().includes(q);
      const matchCategory =
        categoryFilter === "all" ||
        (ingredientCategoryMap.get(i.id)?.has(categoryFilter) ?? false);
      return matchStatus && matchSearch && matchCategory;
    });
  }, [data, filter, search, categoryFilter, ingredientCategoryMap]);

  /* ── loading ────────────────────────────────────────────── */
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
        <span className="animate-pulse">Cargando ingredientes…</span>
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
            className="mt-0.5 text-xs"
            style={{ color: "var(--foreground-muted)" }}
          >
            {filteredData.length} ingrediente
            {filteredData.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Búsqueda */}
          <div className="relative">
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs"
              style={{ color: "var(--foreground-muted)" }}
            >
              🔍
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar…"
              className="rounded-xl border py-2 pl-8 pr-3 text-xs outline-none transition"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
                width: "160px",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.boxShadow = "0 0 0 3px var(--ring)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          {/* Filtro estado */}
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

          {/* Filtro categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-xl border px-3 py-2 text-xs outline-none transition"
            style={{
              background: "var(--background)",
              borderColor:
                categoryFilter !== "all" ? "var(--primary)" : "var(--border)",
              color: "var(--foreground)",
              boxShadow:
                categoryFilter !== "all" ? "0 0 0 3px var(--ring)" : "none",
            }}
          >
            <option value="all">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Tabla ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Nombre", "Unidad", "Costo", "Estado", ""].map((col) => (
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
                  colSpan={5}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No hay ingredientes{" "}
                  {filter === "inactive"
                    ? "inactivos"
                    : filter === "active"
                      ? "activos"
                      : ""}{" "}
                  {categoryFilter !== "all"
                    ? `en la categoría "${categories.find((c) => c.id === categoryFilter)?.name ?? categoryFilter}"`
                    : search
                      ? `que coincidan con "${search}"`
                      : "registrados"}
                  .
                </td>
              </tr>
            ) : (
              filteredData.map((ingredient) => {
                const isSelected = selectedIngredientId === ingredient.id;

                return (
                  <tr
                    key={ingredient.id}
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
                    {/* Nombre + descripción */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{
                        borderColor: "var(--border-soft)",
                        color: isSelected
                          ? "var(--warning-text)"
                          : "var(--foreground)",
                      }}
                    >
                      <span className="block font-medium">
                        {ingredient.name}
                      </span>
                      {ingredient.description && (
                        <span
                          className="mt-0.5 block text-xs"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {ingredient.description}
                        </span>
                      )}
                    </td>

                    {/* Unidad */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{
                        borderColor: "var(--border-soft)",
                        color: "var(--foreground-muted)",
                      }}
                    >
                      <span
                        className="inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold"
                        style={{
                          background: "var(--surface-3)",
                          color: "var(--foreground-soft)",
                        }}
                      >
                        {UNIT_LABELS[ingredient.unit] ?? ingredient.unit}
                      </span>
                    </td>

                    {/* Costo */}
                    <td
                      className="border-b px-5 py-3.5 font-medium tabular-nums"
                      style={{
                        borderColor: "var(--border-soft)",
                        color: "var(--foreground)",
                      }}
                    >
                      {formatMoney(ingredient.currentCost)}
                    </td>

                    {/* Estado */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={
                          ingredient.isActive
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
                            background: ingredient.isActive
                              ? "var(--success)"
                              : "var(--foreground-faint)",
                          }}
                        />
                        {ingredient.isActive ? "Activo" : "Inactivo"}
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
                          onClick={() => onEditIngredient(ingredient.id)}
                          disabled={isToggling}
                          title="Editar"
                          className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
                          style={
                            isSelected
                              ? {
                                  background: "var(--warning)",
                                  borderColor: "var(--warning)",
                                  color: "#fff",
                                }
                              : {
                                  background: "var(--surface-2)",
                                  borderColor: "var(--border)",
                                  color: "var(--foreground-soft)",
                                }
                          }
                        >
                          <MdEdit size={13} />
                          <span>Editar</span>
                        </button>

                        {/* Desactivar — solo si está activo */}
                        {ingredient.isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Desactivar "${ingredient.name}"?`,
                                )
                              ) {
                                deactivateMutation.mutate(ingredient.id);
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
