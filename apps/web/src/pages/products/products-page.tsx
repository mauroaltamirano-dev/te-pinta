import { useState, useCallback, useMemo } from "react";
import { MdAdd } from "react-icons/md";

import type { Product } from "../../services/api/products.api";
import { ProductForm } from "../../features/products/product-form";
import { Drawer } from "../../components/ui/Drawer";
import { ProductsTable } from "../../features/products/products-table";
import { useProducts } from "../../features/products/use-products";

export function ProductsPage() {
  const { data: products } = useProducts({ includeInactive: true });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const selectedProduct = useMemo<Product | null>(() => {
    if (!products || !selectedProductId) return null;
    return products.find((p) => p.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  const openNew = useCallback(() => {
    setSelectedProductId(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((productId: string) => {
    setSelectedProductId(productId);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setTimeout(() => {
      setSelectedProductId(null);
    }, 300);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Catálogo
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Productos</h1>
          <p className="mt-2 text-sm text-soft">
            Gestioná el menú, los productos de reventa y sus precios de recargo.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <MdAdd size={18} />
          Nuevo producto
        </button>
      </div>

      {/* ── Tabla ───────────────────────────────────────────── */}
      <ProductsTable
        selectedProductId={selectedProductId}
        onEditProduct={openEdit}
      />

      {/* ── Drawer de Formulario ────────────────────────────── */}
      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <ProductForm product={selectedProduct} onCancelEdit={closeDrawer} />
      </Drawer>
    </div>
  );
}
