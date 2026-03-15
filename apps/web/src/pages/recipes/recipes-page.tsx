import { RecipeBrowser } from "../../features/recipes/recipe-browser";
import { RecipeForm } from "../../features/recipes/recipe-form";

export function RecipesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="rounded-3xl border border-sombra bg-arena px-6 py-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cafe/70">
          Producción
        </p>

        <h1 className="mt-2 text-3xl font-bold text-bordo">Recetas</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-cafe/85">
          Definí la receta de cada producto preparado: los ingredientes que
          lleva, sus cantidades y el rendimiento por tanda. El sistema usa esta
          información para calcular el costo de producción.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div>
          <RecipeForm />
        </div>

        <div>
          <RecipeBrowser />
        </div>
      </section>
    </div>
  );
}
