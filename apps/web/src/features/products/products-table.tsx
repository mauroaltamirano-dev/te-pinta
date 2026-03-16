import { useMemo, useState } from "react";

import type { Product } from "../../services/api/products.api";
import {
  useDeactivateProduct,
  useProducts,
  useReactivateProduct,
} from "./use-products";
import { MdEdit, MdDelete } from "react-icons/md";


type ProductsTableProps = {
  selectedProductId?: string | null;
  onEditProduct: (productId: string) => void;
};

type StatusFilter = "all" | "active" | "inactive";
type KindFilter = "all" | Product["kind"];

function formatMoney(value: number | null) {
  if (value === null) return "—";

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatKindLabel(kind: Product["kind"]) {
  if (kind === "prepared") return "Preparado";
  if (kind === "resale") return "Reventa";
  return "Combo";
}

export function ProductsTable({
  selectedProductId,
  onEditProduct,
}: ProductsTableProps) {
  const { data: products, isLoading } = useProducts();
  const deactivateMutation = useDeactivateProduct();
  const reactivateMutation = useReactivateProduct();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description ?? "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (product.categoryName ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? product.isActive
            : !product.isActive;

      const matchesKind =
        kindFilter === "all" ? true : product.kind === kindFilter;

      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [products, search, statusFilter, kindFilter]);

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando productos...</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h2 className="text-lg font-bold text-bordo">Listado de productos</h2>
        <p className="mt-1 text-sm text-cafe/75">
          Buscá, filtrá y administrá los productos registrados en el sistema.
        </p>
      </div>

      <div className="grid gap-4 border-b border-sombra bg-arena/30 px-5 py-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-cafe">
            Buscar producto
          </label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, descripción o categoría"
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition placeholder:text-cafe/45 focus:border-bordo"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-cafe">
            Filtrar por estado
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
          >
            <option value="all">Todos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-cafe">
            Filtrar por tipo
          </label>
          <select
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
            className="w-full rounded-2xl border border-sombra bg-white/60 px-4 py-3 text-sm text-cafe outline-none transition focus:border-bordo"
          >
            <option value="all">Todos</option>
            <option value="prepared">Preparado</option>
            <option value="resale">Reventa</option>
            <option value="combo">Combo</option>
          </select>
        </div>
      </div>

      <div className="px-5 py-3 text-sm text-cafe/70">
        Resultados encontrados:{" "}
        <span className="font-semibold text-bordo">
          {filteredProducts.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] w-full">
          <thead className="bg-arena/70">
            <tr>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Producto
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Categoría
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Tipo
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Precio unitario
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Media docena
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Docena
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Costo directo
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Estado
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.length ? (
              filteredProducts.map((product) => {
                const isSelected = selectedProductId === product.id;

                return (
                  <tr
                    key={product.id}
                    className={[
                      "align-top transition hover:bg-arena/30",
                      isSelected ? "bg-arena/40" : "",
                    ].join(" ")}
                  >
                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      <div className="space-y-1">
                        <p className="font-semibold text-bordo">
                          {product.name}
                        </p>
                        <p className="text-xs leading-5 text-cafe/70">
                          {product.description || "Sin descripción cargada"}
                        </p>
                      </div>
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      {product.categoryName ?? "Categoría no encontrada"}
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      {formatKindLabel(product.kind)}
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      {formatMoney(product.unitPrice)}
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      {formatMoney(product.halfDozenPrice)}
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      {formatMoney(product.dozenPrice)}
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                      {formatMoney(product.directCost)}
                    </td>

                    <td className="border-b border-sombra px-5 py-4 text-sm">
                      <span
                        className={[
                          "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                          product.isActive
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-200 text-slate-700",
                        ].join(" ")}
                      >
                        {product.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td className="border-b border-sombra px-5 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          onClick={() => onEditProduct(product.id)}
                          className="rounded-2xl m-auto border border-sombra bg-arena px-3 py-2 text-sm font-semibold text-cafe transition hover:bg-sombra/60"
                        >
                          <MdEdit />
                        </button>

                        {product.isActive ? (
                          <button
                            type="button"
                            onClick={() => {
                              const confirmed = window.confirm(
                                `¿Seguro que querés desactivar "${product.name}"?`,
                              );

                              if (!confirmed) return;

                              deactivateMutation.mutate(product.id);
                            }}
                            disabled={deactivateMutation.isPending}
                            className="rounded-2xl m-auto bg-bordo px-3 py-2 text-sm font-semibold text-crema transition hover:bg-cafe disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <MdDelete />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const confirmed = window.confirm(
                                `¿Querés volver a activar "${product.name}"?`,
                              );

                              if (!confirmed) return;

                              reactivateMutation.mutate(product.id);
                            }}
                            disabled={reactivateMutation.isPending}
                            className="rounded-2xl bg-cafe px-3 py-2 text-sm font-semibold text-crema transition hover:bg-bordo disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Reactivar producto
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-10 text-center text-sm text-cafe/65"
                >
                  No se encontraron productos con los filtros actuales.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
