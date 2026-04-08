import { useMemo, useState } from "react";
import { MdEdit, MdPowerSettingsNew } from "react-icons/md";

import type { Product } from "../../services/api/products.api";
import {
  useDeactivateProduct,
  useProducts,
  useReactivateProduct,
} from "./use-products";

/* ── helpers ─────────────────────────────────────────────────── */
type StatusFilter = "all" | "active" | "inactive";
type KindFilter = "all" | Product["kind"];

function formatMoney(value: number | null) {
  if (value === null) return null;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

const KIND_LABELS: Record<Product["kind"], string> = {
  prepared: "Preparado",
  resale: "Reventa",
  combo: "Combo",
};

const KIND_STYLE: Record<Product["kind"], React.CSSProperties> = {
  prepared: { background: "var(--info-soft)", color: "var(--info-text)" },
  resale: { background: "var(--success-soft)", color: "var(--success-text)" },
  combo: { background: "var(--warning-soft)", color: "var(--warning-text)" },
};

/* ── props ───────────────────────────────────────────────────── */
type ProductsTableProps = {
  selectedProductId?: string | null;
  onEditProduct: (productId: string) => void;
};

export function ProductsTable({
  selectedProductId,
  onEditProduct,
}: ProductsTableProps) {
  const { data: products, isLoading } = useProducts({ includeInactive: true });

  const deactivateMutation = useDeactivateProduct();
  const reactivateMutation = useReactivateProduct();
  const isToggling =
    deactivateMutation.isPending || reactivateMutation.isPending;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.categoryName ?? "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? p.isActive
            : !p.isActive;
      const matchKind = kindFilter === "all" ? true : p.kind === kindFilter;
      return matchSearch && matchStatus && matchKind;
    });
  }, [products, search, statusFilter, kindFilter]);

  /* ── loading ──────────────────────────────────────────────── */
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
        <span className="animate-pulse">Cargando productos…</span>
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
      {/* ── Toolbar de filtros ───────────────────────────────── */}
      <div
        className="flex flex-col gap-4 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
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
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Filtros compactos */}
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
                  width: "180px",
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

            {/* Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-xl border px-3 py-2 text-xs outline-none transition"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Solo activos</option>
              <option value="inactive">Solo inactivos</option>
            </select>

            {/* Tipo */}
            <select
              value={kindFilter}
              onChange={(e) => setKindFilter(e.target.value as KindFilter)}
              className="rounded-xl border px-3 py-2 text-xs outline-none transition"
              style={{
                background: "var(--background)",
                borderColor: "var(--border)",
                color: "var(--foreground)",
              }}
            >
              <option value="all">Todos los tipos</option>
              <option value="prepared">Preparadas</option>
              <option value="resale">Reventa</option>
              <option value="combo">Combos</option>
            </select>

            {/* Limpiar Filtros */}
            {(search !== "" || statusFilter !== "all" || kindFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                  setKindFilter("all");
                }}
                className="rounded-xl px-3 py-2 text-xs font-semibold transition hover:opacity-80"
                style={{
                  color: "var(--foreground-soft)",
                  background: "var(--surface-3)",
                }}
              >
                Limpiar
              </button>
            )}
        </div>
      </div>

      {/* ── Tabla ───────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {["Producto", "Categoría", "Tipo", "Precios", "Estado", ""].map(
                (col) => (
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
                ),
              )}
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  No se encontraron productos con los filtros actuales.
                </td>
              </tr>
            ) : (
              filtered.map((product) => {
                const isSelected = selectedProductId === product.id;

                return (
                  <tr
                    key={product.id}
                    className="align-middle transition"
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
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <p
                        className="font-semibold leading-snug"
                        style={{
                          color: isSelected
                            ? "var(--warning-text)"
                            : "var(--foreground)",
                        }}
                      >
                        {product.name}
                      </p>
                      {product.description && (
                        <p
                          className="mt-0.5 text-xs leading-5"
                          style={{ color: "var(--foreground-muted)" }}
                        >
                          {product.description}
                        </p>
                      )}
                    </td>

                    {/* Categoría */}
                    <td
                      className="border-b px-5 py-3.5 text-sm"
                      style={{
                        borderColor: "var(--border-soft)",
                        color: "var(--foreground-muted)",
                      }}
                    >
                      {product.categoryName ?? (
                        <span style={{ color: "var(--foreground-faint)" }}>
                          —
                        </span>
                      )}
                    </td>

                    {/* Tipo */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <span
                        className="inline-flex items-center rounded-lg px-2.5 py-0.5 text-xs font-semibold"
                        style={KIND_STYLE[product.kind]}
                      >
                        {KIND_LABELS[product.kind]}
                      </span>
                    </td>

                    {/* Precios — colapsados */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <div className="space-y-0.5">
                        <p
                          className="text-sm font-semibold tabular-nums"
                          style={{ color: "var(--foreground)" }}
                        >
                          {formatMoney(product.unitPrice)}
                          <span
                            className="ml-1 text-xs font-normal"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            /u
                          </span>
                        </p>
                        {product.halfDozenPrice !== null && (
                          <p
                            className="text-xs tabular-nums"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            {formatMoney(product.halfDozenPrice)}{" "}
                            <span style={{ color: "var(--foreground-faint)" }}>
                              /½ doc
                            </span>
                          </p>
                        )}
                        {product.dozenPrice !== null && (
                          <p
                            className="text-xs tabular-nums"
                            style={{ color: "var(--foreground-muted)" }}
                          >
                            {formatMoney(product.dozenPrice)}{" "}
                            <span style={{ color: "var(--foreground-faint)" }}>
                              /doc
                            </span>
                          </p>
                        )}
                        {product.directCost !== null && (
                          <p
                            className="text-xs tabular-nums"
                            style={{ color: "var(--foreground-faint)" }}
                          >
                            Costo: {formatMoney(product.directCost)}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Estado */}
                    <td
                      className="border-b px-5 py-3.5"
                      style={{ borderColor: "var(--border-soft)" }}
                    >
                      <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                        style={
                          product.isActive
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
                            background: product.isActive
                              ? "var(--success)"
                              : "var(--foreground-faint)",
                          }}
                        />
                        {product.isActive ? "Activo" : "Inactivo"}
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
                          onClick={() => onEditProduct(product.id)}
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
                        {product.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(`¿Desactivar "${product.name}"?`)
                              )
                                deactivateMutation.mutate(product.id);
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
                              if (window.confirm(`¿Activar "${product.name}"?`))
                                reactivateMutation.mutate(product.id);
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
