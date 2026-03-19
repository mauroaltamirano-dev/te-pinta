import { useMemo, useState } from "react";

import type { Ingredient } from "../../services/api/ingredients.api";
import { IngredientForm } from "../../features/ingredients/ingredient-form";
import { IngredientsTable } from "../../features/ingredients/ingredients-table";
import { useIngredients } from "../../features/ingredients/use-ingredients";

export function IngredientsPage() {
  const { data: ingredients } = useIngredients();
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | null
  >(null);

  const selectedIngredient = useMemo<Ingredient | null>(() => {
    if (!ingredients || !selectedIngredientId) return null;
    return ingredients.find((i) => i.id === selectedIngredientId) ?? null;
  }, [ingredients, selectedIngredientId]);

  const handleCancelEdit = () => setSelectedIngredientId(null);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">
          Insumos
        </p>
        <h1 className="mt-1 text-2xl font-bold text-strong">Ingredientes</h1>
      </div>

      {/* ── Banner de edición ───────────────────────────────── */}
      {selectedIngredient && (
        <div
          className="flex items-center justify-between rounded-xl border px-4 py-3 text-sm animate-slide-up"
          style={{
            background: "var(--warning-soft)",
            borderColor: "var(--warning)",
            color: "var(--warning-text)",
          }}
        >
          <span>
            ✏️ Editando:{" "}
            <strong className="font-semibold">{selectedIngredient.name}</strong>
          </span>
          <button
            type="button"
            onClick={handleCancelEdit}
            className="ml-4 rounded-lg px-3 py-1 text-xs font-semibold transition"
            style={{ background: "var(--warning)", color: "#fff" }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* ── Layout principal ────────────────────────────────── */}
      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <IngredientForm
          ingredient={selectedIngredient}
          onCancelEdit={handleCancelEdit}
        />
        <IngredientsTable
          selectedIngredientId={selectedIngredientId}
          onEditIngredient={setSelectedIngredientId}
        />
      </div>
    </div>
  );
}
