import { useIngredientsNeeded } from "./use-production";

export function IngredientsNeededTable() {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useIngredientsNeeded();

  if (isLoading) {
    return (
      <div 
        className="rounded-2xl border p-6 shadow-sm"
        style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
      >
        <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
          Cargando datos de producción...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div 
        className="rounded-2xl border p-6 shadow-sm"
        style={{ background: "var(--danger-soft)", borderColor: "var(--danger)" }}
      >
        <p className="text-sm font-medium" style={{ color: "var(--danger-text)" }}>
          {error instanceof Error
            ? error.message
            : "No se pudieron cargar los datos de producción"}
        </p>
        <button
          onClick={() => refetch()}
          className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90"
          style={{ background: "var(--danger)", color: "#fff" }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Stat: Pedidos */}
        <div 
          className="rounded-2xl border p-5 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
            Pedidos considerados
          </p>
          <p className="mt-1.5 text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            {data?.ordersConsidered ?? 0}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--foreground-faint)" }}>
            Pedidos pendientes y confirmados incluidos en el cálculo
          </p>
        </div>

        {/* Stat: Productos */}
        <div 
          className="rounded-2xl border p-5 shadow-sm"
          style={{ background: "var(--surface)", borderColor: "var(--border-soft)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--foreground-muted)" }}>
            Productos calculados
          </p>
          <p className="mt-1.5 text-3xl font-bold" style={{ color: "var(--foreground)" }}>
            {data?.productsCalculated ?? 0}
          </p>
          <p className="mt-1 text-xs" style={{ color: "var(--foreground-faint)" }}>
            Productos distintos con receta activa procesados
          </p>
        </div>
      </div>

      <div 
        className="overflow-hidden rounded-2xl border shadow-sm"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div 
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border-soft)", background: "var(--surface-2)" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
              Ingredientes necesarios
            </h2>
            <p className="mt-0.5 text-sm" style={{ color: "var(--foreground-soft)" }}>
              Insumos requeridos para cumplir con los pedidos activos.
            </p>
          </div>

          <button
            onClick={() => refetch()}
            className="rounded-xl border px-4 py-2 text-sm font-semibold transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ 
              background: "transparent", 
              borderColor: "var(--border)", 
              color: "var(--foreground-muted)"
            }}
            disabled={isFetching}
          >
            {isFetching ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th 
                  className="border-b px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}
                >
                  Ingrediente
                </th>
                <th 
                  className="border-b px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}
                >
                  Unidad base
                </th>
                <th 
                  className="border-b px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider"
                  style={{ borderColor: "var(--border-soft)", color: "var(--foreground-muted)" }}
                >
                  Cantidad requerida
                </th>
              </tr>
            </thead>

            <tbody>
              {data?.items.map((item) => (
                <tr
                  key={item.ingredientId}
                  className="transition"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <td 
                    className="border-b px-5 py-4 font-medium"
                    style={{ borderColor: "var(--border-soft)", color: "var(--foreground)" }}
                  >
                    {item.ingredientName}
                  </td>
                  <td 
                    className="border-b px-5 py-4"
                    style={{ borderColor: "var(--border-soft)", color: "var(--foreground-soft)" }}
                  >
                    {item.ingredientBaseUnit}
                  </td>
                  <td 
                    className="border-b px-5 py-4 font-semibold"
                    style={{ borderColor: "var(--border-soft)", color: "var(--foreground)" }}
                  >
                    {item.requiredQuantityInBaseUnit}
                  </td>
                </tr>
              ))}

              {!data?.items.length ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-10 text-center"
                    style={{ color: "var(--foreground-muted)" }}
                  >
                    No hay ingredientes requeridos para los pedidos activos.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
