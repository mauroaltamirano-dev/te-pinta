import { useMemo, useState } from "react";

import type { Product } from "../../services/api/products.api";
import { ProductForm } from "../../features/products/product-form";
import { ProductsTable } from "../../features/products/products-table";
import { useProducts } from "../../features/products/use-products";

export function ProductsPage() {
  const { data: products } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const selectedProduct = useMemo<Product | null>(() => {
    if (!products || !selectedProductId) return null;

    return products.find((product) => product.id === selectedProductId) ?? null;
  }, [products, selectedProductId]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Catálogo
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Productos</h1>

        <p className="mt-3 max-w-3xl text-sm leading-6 text-cafe/85">
          Registrá y administrá los productos que vende el negocio. Definí su
          categoría, tipo, precios de venta y, cuando corresponda, el costo
          directo para mantener un control claro y ordenado.
        </p>
      </section>

      <section className="grid gap-6 grid-cols-1">
        <div>
          <ProductForm
            product={selectedProduct}
            onCancelEdit={() => setSelectedProductId(null)}
          />
        </div>

        <div>
          <ProductsTable
            selectedProductId={selectedProductId}
            onEditProduct={setSelectedProductId}
          />
        </div>
      </section>
    </div>
  );
}
