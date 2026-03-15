import { useIngredientsNeeded } from "./use-production";

export function IngredientsNeededTable() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useIngredientsNeeded();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando datos de producción...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <p className="text-sm text-red-700">
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos de producción"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-2xl bg-bordo px-4 py-2 text-sm font-semibold text-crema transition hover:bg-cafe"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-sombra bg-crema p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
            Pedidos considerados
          </p>
          <p className="mt-2 text-3xl font-bold text-bordo">
            {data?.ordersConsidered ?? 0}
          </p>
          <p className="mt-1 text-xs text-cafe/50">
            Pedidos pendientes y confirmados incluidos en el cálculo
          </p>
        </div>

        <div className="rounded-2xl border border-sombra bg-crema p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-cafe/60">
            Productos calculados
          </p>
          <p className="mt-2 text-3xl font-bold text-bordo">
            {data?.productsCalculated ?? 0}
          </p>
          <p className="mt-1 text-xs text-cafe/50">
            Productos distintos con receta activa procesados
          </p>
        </div>
      </div>

      <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
        <div className="flex items-center justify-between border-b border-sombra px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-bordo">
              Ingredientes necesarios
            </h2>
            <p className="mt-1 text-sm text-cafe/75">
              Insumos requeridos para cumplir con los pedidos activos.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="rounded-2xl border border-sombra bg-arena px-4 py-2 text-sm font-semibold text-cafe transition hover:bg-sombra/60 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isFetching}
          >
            {isFetching ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-arena/70">
              <tr>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Ingrediente
                </th>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Unidad base
                </th>
                <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                  Cantidad requerida
                </th>
              </tr>
            </thead>

            <tbody>
              {data?.items.map((item) => (
                <tr
                  key={item.ingredientId}
                  className="transition hover:bg-arena/30"
                >
                  <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                    {item.ingredientName}
                  </td>
                  <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                    {item.ingredientBaseUnit}
                  </td>
                  <td className="border-b border-sombra px-5 py-4 text-sm font-semibold text-cafe">
                    {item.requiredQuantityInBaseUnit}
                  </td>
                </tr>
              ))}

              {!data?.items.length ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center text-sm text-cafe/65"
                  >
                    No hay ingredientes requeridos en este momento.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
