import { RecipeBrowser } from "../../features/recipes/recipe-browser";
import { RecipeForm } from "../../features/recipes/recipe-form";

export function RecipesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Producción
        </p>
        <h1 className="mt-1 text-2xl font-bold text-strong">Recetas</h1>
      </div>

      {/* ── Layout ─────────────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <RecipeForm />
        <RecipeBrowser />
      </div>
    </div>
  );
}
