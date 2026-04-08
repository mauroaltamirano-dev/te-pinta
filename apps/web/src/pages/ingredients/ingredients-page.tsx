import { useState, useCallback, useMemo } from "react";
import { MdAdd } from "react-icons/md";

import type { Ingredient } from "../../services/api/ingredients.api";
import { IngredientForm } from "../../features/ingredients/ingredient-form";
import { Drawer } from "../../components/ui/Drawer";
import { IngredientsTable } from "../../features/ingredients/ingredients-table";
import { useIngredients } from "../../features/ingredients/use-ingredients";

export function IngredientsPage() {
  const { data: ingredients } = useIngredients();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<
    string | null
  >(null);

  const selectedIngredient = useMemo<Ingredient | null>(() => {
    if (!ingredients || !selectedIngredientId) return null;
    return ingredients.find((i) => i.id === selectedIngredientId) ?? null;
  }, [ingredients, selectedIngredientId]);

  const openNew = useCallback(() => {
    setSelectedIngredientId(null);
    setDrawerOpen(true);
  }, []);

  const openEdit = useCallback((ingredientId: string) => {
    setSelectedIngredientId(ingredientId);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);

    setTimeout(() => {
      setSelectedIngredientId(null);
    }, 300);
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 md:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Insumos
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Ingredientes</h1>
          <p className="mt-2 text-sm text-soft">
            Gestioná costos, unidades y disponibilidad de tus ingredientes.
          </p>
        </div>

        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          <MdAdd size={18} />
          Nuevo ingrediente
        </button>
      </div>

      <IngredientsTable
        selectedIngredientId={selectedIngredientId}
        onEditIngredient={openEdit}
      />

      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <IngredientForm
          ingredient={selectedIngredient}
          onCancelEdit={closeDrawer}
        />
      </Drawer>
    </div>
  );
}
