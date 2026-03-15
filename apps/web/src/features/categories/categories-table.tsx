import { useCategories } from "./use-categories";

export function CategoriesTable() {
  const { data, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="rounded-3xl border border-sombra bg-crema p-6 shadow-sm">
        <p className="text-sm text-cafe/70">Cargando categorías...</p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-sombra bg-crema shadow-sm">
      <div className="border-b border-sombra px-5 py-4">
        <h2 className="text-lg font-bold text-bordo">Listado de categorías</h2>
        <p className="mt-1 text-sm text-cafe/75">
          Vista general de las categorías registradas en el sistema.
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
                Estado
              </th>
            </tr>
          </thead>

          <tbody>
            {data?.length ? (
              data.map((category) => (
                <tr key={category.id} className="transition hover:bg-arena/30">
                  <td className="border-b border-sombra px-5 py-4 text-sm font-medium text-bordo">
                    {category.name}
                  </td>

                  <td className="border-b border-sombra px-5 py-4 text-sm text-cafe/85">
                    {category.description || "Sin descripción"}
                  </td>

                  <td className="border-b border-sombra px-5 py-4 text-sm">
                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        category.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-200 text-slate-700",
                      ].join(" ")}
                    >
                      {category.isActive ? "Activa" : "Inactiva"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-10 text-center text-sm text-cafe/65"
                >
                  Todavía no hay categorías cargadas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
