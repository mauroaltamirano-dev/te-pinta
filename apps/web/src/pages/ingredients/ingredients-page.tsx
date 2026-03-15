import { IngredientForm } from "../../features/ingredients/ingredient-form";
import { IngredientsTable } from "../../features/ingredients/ingredients-table";

export function IngredientsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Insumos
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Ingredientes</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Registrá los insumos que usás en la producción. Cada ingrediente tiene
          su unidad de medida y costo actual, que el sistema utiliza para
          calcular el costo de tus recetas.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div>
          <IngredientForm />
        </div>

        <div>
          <IngredientsTable />
        </div>
      </section>
    </div>
  );
}
