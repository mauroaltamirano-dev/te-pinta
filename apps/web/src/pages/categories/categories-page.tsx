import { CategoryForm } from "../../features/categories/category-form";
import { CategoriesTable } from "../../features/categories/categories-table";

export function CategoriesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Catálogo
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Categorías</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Administrá las categorías de productos para mantener el sistema
          ordenado, mejorar la carga de datos y facilitar la organización del
          menú.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div>
          <CategoryForm />
        </div>

        <div>
          <CategoriesTable />
        </div>
      </section>
    </div>
  );
}
