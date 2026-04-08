import { useState, useCallback } from "react";
import { RecipeBrowser } from "../../features/recipes/recipe-browser";
import { RecipeForm } from "../../features/recipes/recipe-form";
import { Drawer } from "../../components/ui/Drawer";

export function RecipesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const openNew = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleSuccessCreate = useCallback((productId: string) => {
    setSelectedProductId(productId);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 md:px-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Producción
          </p>
          <h1 className="mt-1 text-2xl font-bold text-strong">Recetas</h1>
        </div>

        <button
          onClick={openNew}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:opacity-90 active:scale-95"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
          }}
        >
          Nueva receta
        </button>
      </div>

      {/* ── Layout ─────────────────────────────────────────── */}
      <div>
        <RecipeBrowser 
          selectedProductId={selectedProductId}
          onSelectProductId={setSelectedProductId}
        />
      </div>

      <Drawer open={drawerOpen} onClose={closeDrawer}>
        <RecipeForm 
          onCancelEdit={closeDrawer} 
          onSuccessCreate={handleSuccessCreate}
        />
      </Drawer>
    </div>
  );
}
