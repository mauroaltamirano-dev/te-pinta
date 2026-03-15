import { useIngredients } from "./use-ingredients";

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

export function IngredientsTable() {
  const { data, isLoading } = useIngredients();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando ingredientes...</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h2 className="text-lg font-bold text-bordo">Listado de ingredientes</h2>
        <p className="mt-1 text-sm text-cafe/75">
          Insumos registrados con su unidad de medida y costo actual de compra.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-arena/70">
            <tr>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Nombre
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Descripción
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Unidad
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Costo actual
              </th>
              <th className="border-b border-sombra px-5 py-4 text-left text-sm font-semibold text-cafe">
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.length ? (
              data.map((ingredient) => (
                <tr key={ingredient.id} className="transition hover:bg-arena/30">
                  <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                    {ingredient.name}
                  </td>
                  <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/85">
                    {ingredient.description || "Sin descripción"}
                  </td>
                  <td className="border-b border-sombra px-5 py-4 text-sm text-cafe">
                    {UNIT_LABELS[ingredient.unit] ?? ingredient.unit}
                  </td>
                  <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-cafe">
                    {formatMoney(ingredient.currentCost)}
                  </td>
                  <td className="border-b border-sombra px-5 py-4 text-sm">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        ingredient.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700",
                      ].join(" ")}
                    >
                      {ingredient.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-sm text-cafe/65"
                >
                  Todavía no hay ingredientes cargados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
