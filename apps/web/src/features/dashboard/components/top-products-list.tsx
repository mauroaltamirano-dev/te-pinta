import type { TopProductItem } from "../../../services/api/dashboard.api";

type Props = {
  data: TopProductItem[];
};

export function TopProductsList({ data }: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h3 className="text-lg font-bold text-bordo">Top productos</h3>
        <p className="mt-1 text-sm text-cafe/75">
          Los más vendidos en el período.
        </p>
      </div>

      <div className="space-y-2 p-4">
        {data.length ? (
          data.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center gap-4 rounded-2xl border border-sombra bg-white/50 px-4 py-3 transition hover:bg-arena/40"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-bordo/10 text-xs font-bold text-bordo">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-cafe">
                  {product.productName}
                </p>
                <p className="text-xs text-cafe/60">
                  {product.quantitySold} vendidos
                </p>
              </div>
              <p className="shrink-0 text-sm font-bold text-bordo">
                ${product.totalSales.toLocaleString("es-AR")}
              </p>
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-cafe/60">
            Sin datos en el período seleccionado.
          </p>
        )}
      </div>
    </section>
  );
}
