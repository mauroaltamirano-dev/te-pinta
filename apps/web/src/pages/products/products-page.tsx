import { useMemo, useState } from "react";

import type { Product } from "../../services/api/products.api";
import { ProductForm } from "../../features/products/product-form";
import { ProductsTable } from "../../features/products/products-table";
import { useProducts } from "../../features/products/use-products";

export function ProductsPage() {
  const { data: products } = useProducts({ includeInactive: true });
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const selectedProduct = useMemo<Product | null>(() => {
    if (!products || !selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const handleCancelEdit = () => setSelectedProductId(null);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Catálogo
        </p>
        <h1 className="mt-1 text-2xl font-bold text-strong">Productos</h1>
      </div>

      {/* ── Banner edición ──────────────────────────────────── */}
      {selectedProduct && (
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm animate-slide-up"
          style={{
            background: "var(--warning-soft)",
            borderColor: "var(--warning)",
            color: "var(--warning-text)",
          }}
        >
          <span>
            ✏️ Editando:{" "}
            <strong className="font-semibold">{selectedProduct.name}</strong>
          </span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="ml-4 rounded-lg px-3 py-1 text-xs font-semibold transition"
            style={{ background: "var(--warning)", color: "#fff" }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── Form ───────────────────────────────────────────── */}
      <ProductForm product={selectedProduct} onCancelEdit={handleCancelEdit} />

      {/* ── Tabla ───────────────────────────────────────────── */}
      <ProductsTable
        selectedProductId={selectedProductId}
        onEditProduct={setSelectedProductId}
      />
    </div>
  );
}
